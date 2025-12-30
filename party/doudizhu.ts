// PartyKit server for Dou Di Zhu
import type * as Party from "partykit/server";
import {
    GameState,
    Player,
    ClientMessage,
    ServerMessage,
    Card,
    BidValue,
    Combination
} from "../src/lib/doudizhu/types";

// Import game logic (we'll inline it for PartyKit compatibility)
const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
const RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'] as const;

function getRankValue(rank: string): number {
    const values: Record<string, number> = {
        '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15
    };
    return values[rank] || 0;
}

function createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({
                type: 'regular',
                suit,
                rank,
                value: getRankValue(rank)
            });
        }
    }
    deck.push({ type: 'joker', jokerType: 'small', value: 16 });
    deck.push({ type: 'joker', jokerType: 'big', value: 17 });
    return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function dealCards(deck: Card[]): { hands: Card[][]; holeCards: Card[] } {
    const shuffled = shuffleDeck(deck);
    return {
        hands: [
            shuffled.slice(0, 17),
            shuffled.slice(17, 34),
            shuffled.slice(34, 51)
        ],
        holeCards: shuffled.slice(51, 54)
    };
}

// Simplified combination validation for server
function validateCombination(cards: Card[]): Combination | null {
    if (cards.length === 0) return null;

    const groups = new Map<number, Card[]>();
    for (const card of cards) {
        const existing = groups.get(card.value) || [];
        groups.set(card.value, [...existing, card]);
    }

    const values = Array.from(groups.keys()).sort((a, b) => a - b);
    const counts = Array.from(groups.values()).map(g => g.length);

    // Rocket
    if (cards.length === 2 && cards.every(c => c.type === 'joker')) {
        return { type: 'rocket', cards, primaryValue: 99 };
    }

    // Bomb
    if (cards.length === 4 && groups.size === 1 && counts[0] === 4) {
        return { type: 'bomb', cards, primaryValue: values[0] };
    }

    // Single
    if (cards.length === 1) {
        return { type: 'single', cards, primaryValue: cards[0].value };
    }

    // Pair
    if (cards.length === 2 && groups.size === 1) {
        return { type: 'pair', cards, primaryValue: values[0] };
    }

    // Triple
    if (cards.length === 3 && groups.size === 1) {
        return { type: 'triple', cards, primaryValue: values[0] };
    }

    // Triple + 1
    if (cards.length === 4 && groups.size === 2) {
        const tripleValue = values.find(v => groups.get(v)!.length === 3);
        if (tripleValue !== undefined) {
            return { type: 'triple_one', cards, primaryValue: tripleValue };
        }
    }

    // Triple + 2
    if (cards.length === 5 && groups.size === 2) {
        const tripleValue = values.find(v => groups.get(v)!.length === 3);
        if (tripleValue !== undefined) {
            return { type: 'triple_two', cards, primaryValue: tripleValue };
        }
    }

    // Straight (5+)
    const isConsecutive = (vals: number[]) => {
        if (vals.length < 2) return true;
        const sorted = [...vals].sort((a, b) => a - b);
        if (sorted.some(v => v >= 15)) return false;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] !== sorted[i - 1] + 1) return false;
        }
        return true;
    };

    if (cards.length >= 5 && groups.size === cards.length && isConsecutive(values)) {
        return { type: 'straight', cards, primaryValue: Math.max(...values), length: cards.length };
    }

    return null;
}

function canBeat(play1: Combination, play2: Combination): boolean {
    if (play2.type === 'rocket') return true;
    if (play1.type === 'rocket') return false;
    if (play2.type === 'bomb' && play1.type !== 'bomb') return true;
    if (play1.type === 'bomb' && play2.type !== 'bomb') return false;
    if (play1.type !== play2.type) return false;
    if (play1.length !== undefined && play1.length !== play2.length) return false;
    return play2.primaryValue > play1.primaryValue;
}

function createInitialState(roomCode: string): GameState {
    return {
        phase: 'waiting',
        players: [],
        deck: createDeck(),
        holeCards: [],
        currentPlayerIndex: 0,
        currentBidIndex: 0,
        highestBid: 0,
        highestBidder: null,
        lastPlay: null,
        lastPlayerId: null,
        passCount: 0,
        winner: null,
        roomCode
    };
}

export default class DoudizhuServer implements Party.Server {
    state: GameState;

    constructor(readonly room: Party.Room) {
        this.state = createInitialState(room.id);
    }

    async onStart() {
        // Load persisted state if any
        const stored = await this.room.storage.get<GameState>("state");
        if (stored) {
            this.state = stored;
        }
    }

    async saveState() {
        await this.room.storage.put("state", this.state);
    }

    broadcast(msg: ServerMessage) {
        this.room.broadcast(JSON.stringify(msg));
    }

    sendState() {
        this.broadcast({ type: 'state', state: this.state });
    }

    sendError(conn: Party.Connection, message: string) {
        conn.send(JSON.stringify({ type: 'error', message }));
    }

    onConnect(conn: Party.Connection) {
        // Send current state to new connection
        conn.send(JSON.stringify({ type: 'state', state: this.state }));
    }

    onClose(conn: Party.Connection) {
        const player = this.state.players.find(p => p.id === conn.id);
        if (player) {
            player.isConnected = false;
            this.saveState();
            this.sendState();
        }
    }

    onMessage(message: string, sender: Party.Connection) {
        try {
            const msg: ClientMessage = JSON.parse(message);
            this.handleMessage(msg, sender);
        } catch (e) {
            this.sendError(sender, "Invalid message format");
        }
    }

    handleMessage(msg: ClientMessage, sender: Party.Connection) {
        switch (msg.type) {
            case 'join':
                this.handleJoin(msg.name, sender);
                break;
            case 'start_game':
                this.handleStartGame(sender);
                break;
            case 'bid':
                this.handleBid(msg.value, sender);
                break;
            case 'play':
                this.handlePlay(msg.cardIds, sender);
                break;
            case 'pass':
                this.handlePass(sender);
                break;
        }
    }

    handleJoin(name: string, sender: Party.Connection) {
        if (this.state.phase !== 'waiting') {
            // Allow reconnection
            const existing = this.state.players.find(p => p.name === name);
            if (existing) {
                existing.id = sender.id;
                existing.isConnected = true;
                this.saveState();
                this.sendState();
                return;
            }
            this.sendError(sender, "Game already in progress");
            return;
        }

        if (this.state.players.length >= 3) {
            this.sendError(sender, "Room is full");
            return;
        }

        const player: Player = {
            id: sender.id,
            name,
            hand: [],
            role: null,
            bid: null,
            isConnected: true
        };

        this.state.players.push(player);
        this.saveState();
        this.sendState();
    }

    handleStartGame(sender: Party.Connection) {
        if (this.state.players.length !== 3) {
            this.sendError(sender, "Need exactly 3 players");
            return;
        }

        // Deal cards
        const { hands, holeCards } = dealCards(this.state.deck);
        this.state.players[0].hand = hands[0];
        this.state.players[1].hand = hands[1];
        this.state.players[2].hand = hands[2];
        this.state.holeCards = holeCards;

        // Start bidding
        this.state.phase = 'bidding';
        this.state.currentBidIndex = Math.floor(Math.random() * 3);

        this.saveState();
        this.sendState();
    }

    handleBid(value: BidValue, sender: Party.Connection) {
        if (this.state.phase !== 'bidding') {
            this.sendError(sender, "Not in bidding phase");
            return;
        }

        const playerIndex = this.state.players.findIndex(p => p.id === sender.id);
        if (playerIndex !== this.state.currentBidIndex) {
            this.sendError(sender, "Not your turn to bid");
            return;
        }

        const player = this.state.players[playerIndex];

        if (value > 0 && value <= this.state.highestBid) {
            this.sendError(sender, "Bid must be higher than current");
            return;
        }

        player.bid = value;

        if (value > this.state.highestBid) {
            this.state.highestBid = value;
            this.state.highestBidder = player.id;
        }

        // Check if bidding is done
        const allBid = this.state.players.every(p => p.bid !== null);
        const maxBid = this.state.highestBid === 3;

        if (allBid || maxBid) {
            this.finishBidding();
        } else {
            this.state.currentBidIndex = (this.state.currentBidIndex + 1) % 3;
        }

        this.saveState();
        this.sendState();
    }

    finishBidding() {
        if (this.state.highestBidder === null) {
            // No one bid, restart
            this.state.phase = 'waiting';
            this.state.players.forEach(p => {
                p.hand = [];
                p.bid = null;
            });
            return;
        }

        // Assign roles
        const landlordIndex = this.state.players.findIndex(p => p.id === this.state.highestBidder);
        this.state.players.forEach((p, i) => {
            p.role = i === landlordIndex ? 'landlord' : 'peasant';
        });

        // Give hole cards to landlord
        this.state.players[landlordIndex].hand.push(...this.state.holeCards);

        // Start playing
        this.state.phase = 'playing';
        this.state.currentPlayerIndex = landlordIndex;
    }

    handlePlay(cardIndices: number[], sender: Party.Connection) {
        if (this.state.phase !== 'playing') {
            this.sendError(sender, "Not in playing phase");
            return;
        }

        const playerIndex = this.state.players.findIndex(p => p.id === sender.id);
        if (playerIndex !== this.state.currentPlayerIndex) {
            this.sendError(sender, "Not your turn");
            return;
        }

        const player = this.state.players[playerIndex];
        const cards = cardIndices.map(i => player.hand[i]).filter(Boolean);

        if (cards.length !== cardIndices.length) {
            this.sendError(sender, "Invalid card selection");
            return;
        }

        const combo = validateCombination(cards);
        if (!combo) {
            this.sendError(sender, "Invalid combination");
            return;
        }

        // Check if it beats current play
        if (this.state.lastPlay && this.state.lastPlayerId !== player.id) {
            if (!canBeat(this.state.lastPlay, combo)) {
                this.sendError(sender, "Must beat the current play");
                return;
            }
        }

        // Remove cards from hand
        const sortedIndices = [...cardIndices].sort((a, b) => b - a);
        for (const i of sortedIndices) {
            player.hand.splice(i, 1);
        }

        this.state.lastPlay = combo;
        this.state.lastPlayerId = player.id;
        this.state.passCount = 0;

        // Check for win
        if (player.hand.length === 0) {
            this.state.phase = 'finished';
            this.state.winner = player.role === 'landlord' ? 'landlord' : 'peasants';
        } else {
            this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % 3;
        }

        this.saveState();
        this.sendState();
    }

    handlePass(sender: Party.Connection) {
        if (this.state.phase !== 'playing') {
            this.sendError(sender, "Not in playing phase");
            return;
        }

        const playerIndex = this.state.players.findIndex(p => p.id === sender.id);
        if (playerIndex !== this.state.currentPlayerIndex) {
            this.sendError(sender, "Not your turn");
            return;
        }

        // Can't pass if you're the one who played last (or no one played yet)
        if (this.state.lastPlayerId === sender.id || !this.state.lastPlay) {
            this.sendError(sender, "You must play");
            return;
        }

        this.state.passCount++;

        // If everyone passed, the last player who played gets a free turn
        if (this.state.passCount >= 2) {
            this.state.lastPlay = null;
            this.state.passCount = 0;
        }

        this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % 3;

        this.saveState();
        this.sendState();
    }
}

DoudizhuServer satisfies Party.Worker;
