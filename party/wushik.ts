import type * as Party from "partykit/server";

// Inline types to avoid import issues
type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
type JokerType = 'small' | 'big';
type Team = 'A' | 'B';
type GamePhase = 'waiting' | 'bidding' | 'playing' | 'finished';

interface RegularCard { type: 'regular'; suit: Suit; rank: Rank; value: number; }
interface JokerCard { type: 'joker'; jokerType: JokerType; value: number; }
type Card = RegularCard | JokerCard;

interface Player {
    id: string;
    name: string;
    hand: Card[];
    team: Team | null;
    isConnected: boolean;
}

interface Trick {
    leadSuit: Suit | null;
    cards: { playerId: string; card: Card }[];
    winnerId: string | null;
}

interface GameState {
    phase: GamePhase;
    players: Player[];
    playerCount: 2 | 4; // Flexible: 2 or 4 players
    deck: Card[];
    trumpSuit: Suit | null;
    currentPlayerIndex: number;
    currentTrick: Trick;
    completedTricks: Trick[];
    teamAPoints: number;
    teamBPoints: number;
    winner: Team | null;
    roomCode: string;
    dealerIndex: number;
}

type ClientMessage =
    | { type: 'join'; name: string }
    | { type: 'start_game' }
    | { type: 'set_trump'; suit: Suit }
    | { type: 'play'; cardIndex: number }
    | { type: 'add_bot' }
    | { type: 'reset' };

// Utility functions
const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

function createDeck(): Card[] {
    const cards: Card[] = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            cards.push({ type: 'regular', suit, rank, value: RANK_VALUES[rank] });
        }
    }
    cards.push({ type: 'joker', jokerType: 'small', value: 15 });
    cards.push({ type: 'joker', jokerType: 'big', value: 16 });
    return cards;
}

function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getPointValue(card: Card): number {
    if (card.type === 'joker') return 0;
    if (card.rank === '5') return 5;
    if (card.rank === '10') return 10;
    if (card.rank === 'K') return 10;
    return 0;
}

function determineTrickWinner(
    trick: { playerId: string; card: Card }[],
    leadSuit: Suit | null,
    trumpSuit: Suit | null
): string {
    let winningIdx = 0;

    for (let i = 1; i < trick.length; i++) {
        if (beats(trick[i].card, trick[winningIdx].card, leadSuit, trumpSuit)) {
            winningIdx = i;
        }
    }

    return trick[winningIdx].playerId;
}

function beats(a: Card, b: Card, leadSuit: Suit | null, trumpSuit: Suit | null): boolean {
    if (a.type === 'joker' && a.jokerType === 'big') return true;
    if (b.type === 'joker' && b.jokerType === 'big') return false;
    if (a.type === 'joker' && a.jokerType === 'small') return b.type !== 'joker';
    if (b.type === 'joker') return false;

    const aCard = a as RegularCard;
    const bCard = b as RegularCard;

    const aIsTrump = aCard.suit === trumpSuit;
    const bIsTrump = bCard.suit === trumpSuit;

    if (aIsTrump && !bIsTrump) return true;
    if (!aIsTrump && bIsTrump) return false;
    if (aIsTrump && bIsTrump) return aCard.value > bCard.value;

    const aFollows = aCard.suit === leadSuit;
    const bFollows = bCard.suit === leadSuit;

    if (aFollows && !bFollows) return true;
    if (!aFollows && bFollows) return false;
    if (aFollows && bFollows) return aCard.value > bCard.value;

    return false;
}

function canPlayCard(card: Card, hand: Card[], leadSuit: Suit | null): boolean {
    if (leadSuit === null) return true;
    const hasLeadSuit = hand.some(c => c.type === 'regular' && c.suit === leadSuit);
    if (!hasLeadSuit) return true;
    if (card.type === 'joker') return false;
    return (card as RegularCard).suit === leadSuit;
}

function createInitialState(roomCode: string): GameState {
    return {
        phase: 'waiting',
        players: [],
        playerCount: 2, // Default to 2, will be set when game starts
        deck: [],
        trumpSuit: null,
        currentPlayerIndex: 0,
        currentTrick: { leadSuit: null, cards: [], winnerId: null },
        completedTricks: [],
        teamAPoints: 0,
        teamBPoints: 0,
        winner: null,
        roomCode,
        dealerIndex: 0
    };
}

export default class WushikServer implements Party.Server {
    state: GameState;

    constructor(readonly room: Party.Room) {
        this.state = createInitialState(room.id);
    }

    async onStart() {
        const stored = await this.room.storage.get<GameState>("state");
        if (stored) {
            this.state = stored;
        }
    }

    async saveState() {
        await this.room.storage.put("state", this.state);
    }

    onConnect(conn: Party.Connection) {
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
        const msg = JSON.parse(message) as ClientMessage & { type: string };

        switch (msg.type) {
            case 'join':
                this.handleJoin((msg as { name: string }).name, sender);
                break;
            case 'start_game':
                this.handleStartGame();
                break;
            case 'set_trump':
                this.handleSetTrump((msg as { suit: Suit }).suit);
                break;
            case 'play':
                this.handlePlay((msg as { cardIndex: number }).cardIndex, sender);
                break;
            case 'add_bot':
                this.handleAddBot();
                break;
            case 'reset':
                this.handleReset();
                break;
        }
    }

    handleJoin(name: string, sender: Party.Connection) {
        // Check for reconnection
        const existing = this.state.players.find(p => p.name === name);
        if (existing) {
            existing.id = sender.id;
            existing.isConnected = true;
            this.saveState();
            this.sendState();
            return;
        }

        if (this.state.phase !== 'waiting') {
            this.sendError(sender, "Game in progress");
            return;
        }

        if (this.state.players.length >= 4) {
            this.sendError(sender, "Room is full");
            return;
        }

        const player: Player = {
            id: sender.id,
            name,
            hand: [],
            team: null,
            isConnected: true
        };

        this.state.players.push(player);
        this.saveState();
        this.sendState();
    }

    handleAddBot() {
        if (this.state.phase !== 'waiting') return;
        if (this.state.players.length >= 4) return;

        const botNum = this.state.players.filter(p => p.name.startsWith('Bot')).length + 1;
        const bot: Player = {
            id: `bot-${botNum}-${Date.now()}`,
            name: `Bot ${botNum}`,
            hand: [],
            team: null,
            isConnected: true
        };

        this.state.players.push(bot);
        this.saveState();
        this.sendState();
    }

    handleStartGame() {
        const numPlayers = this.state.players.length;
        if (numPlayers !== 2 && numPlayers !== 4) return;

        this.state.playerCount = numPlayers as 2 | 4;

        // Assign teams based on player count
        if (numPlayers === 4) {
            // 4 players: 0,2 = Team A, 1,3 = Team B
            this.state.players[0].team = 'A';
            this.state.players[1].team = 'B';
            this.state.players[2].team = 'A';
            this.state.players[3].team = 'B';
        } else {
            // 2 players: each on their own team
            this.state.players[0].team = 'A';
            this.state.players[1].team = 'B';
        }

        // Create and shuffle deck
        const deck = shuffleDeck(createDeck());

        // Deal cards based on player count
        const cardsPerPlayer = numPlayers === 2 ? 27 : 13; // 2p: 27 each (54 total), 4p: 13 each
        const totalCards = numPlayers === 2 ? 54 : 52;

        for (let i = 0; i < totalCards; i++) {
            this.state.players[i % numPlayers].hand.push(deck[i]);
        }

        this.state.phase = 'bidding';
        this.state.currentPlayerIndex = this.state.dealerIndex;

        this.saveState();
        this.sendState();
    }

    handleSetTrump(suit: Suit) {
        if (this.state.phase !== 'bidding') return;

        this.state.trumpSuit = suit;
        this.state.phase = 'playing';
        this.state.currentPlayerIndex = (this.state.dealerIndex + 1) % this.state.playerCount;
        this.state.currentTrick = { leadSuit: null, cards: [], winnerId: null };

        this.saveState();
        this.sendState();
    }

    handlePlay(cardIndex: number, sender: Party.Connection) {
        if (this.state.phase !== 'playing') return;

        const player = this.state.players[this.state.currentPlayerIndex];
        if (player.id !== sender.id) {
            this.sendError(sender, "Not your turn");
            return;
        }

        if (cardIndex < 0 || cardIndex >= player.hand.length) {
            this.sendError(sender, "Invalid card");
            return;
        }

        const card = player.hand[cardIndex];

        // Check if can play this card
        if (!canPlayCard(card, player.hand, this.state.currentTrick.leadSuit)) {
            this.sendError(sender, "Must follow suit");
            return;
        }

        // Remove card from hand and add to trick
        player.hand.splice(cardIndex, 1);
        this.state.currentTrick.cards.push({ playerId: player.id, card });

        // Set lead suit if first card
        if (this.state.currentTrick.cards.length === 1 && card.type === 'regular') {
            this.state.currentTrick.leadSuit = card.suit;
        }

        // Check if trick is complete (2 or 4 cards depending on player count)
        if (this.state.currentTrick.cards.length === this.state.playerCount) {
            const winnerId = determineTrickWinner(
                this.state.currentTrick.cards,
                this.state.currentTrick.leadSuit,
                this.state.trumpSuit
            );

            this.state.currentTrick.winnerId = winnerId;

            // Calculate points in this trick
            const trickPoints = this.state.currentTrick.cards.reduce(
                (sum, play) => sum + getPointValue(play.card), 0
            );

            const winner = this.state.players.find(p => p.id === winnerId);
            if (winner?.team === 'A') {
                this.state.teamAPoints += trickPoints;
            } else {
                this.state.teamBPoints += trickPoints;
            }

            this.state.completedTricks.push({ ...this.state.currentTrick });

            // Check if game is over (all cards played)
            if (this.state.players[0].hand.length === 0) {
                // Last trick bonus: winning team gets remaining points (if any)
                this.state.phase = 'finished';
                this.state.winner = this.state.teamAPoints >= this.state.teamBPoints ? 'A' : 'B';
            } else {
                // Next trick
                const winnerIndex = this.state.players.findIndex(p => p.id === winnerId);
                this.state.currentPlayerIndex = winnerIndex;
                this.state.currentTrick = { leadSuit: null, cards: [], winnerId: null };
            }
        } else {
            // Next player
            this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.playerCount;
        }

        this.saveState();
        this.sendState();
    }

    handleReset() {
        this.state = createInitialState(this.room.id);
        this.saveState();
        this.sendState();
    }

    sendState() {
        this.room.broadcast(JSON.stringify({ type: 'state', state: this.state }));
    }

    sendError(conn: Party.Connection, message: string) {
        conn.send(JSON.stringify({ type: 'error', message }));
    }
}
