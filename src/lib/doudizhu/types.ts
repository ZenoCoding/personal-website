// Game types for Dou Di Zhu (斗地主)

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2';
export type JokerType = 'small' | 'big';

export interface RegularCard {
    type: 'regular';
    suit: Suit;
    rank: Rank;
    value: number; // 3=3, 4=4... A=14, 2=15
}

export interface JokerCard {
    type: 'joker';
    jokerType: JokerType;
    value: number; // small=16, big=17
}

export type Card = RegularCard | JokerCard;

export type GamePhase = 'waiting' | 'bidding' | 'playing' | 'finished';
export type PlayerRole = 'peasant' | 'landlord' | null;
export type BidValue = 0 | 1 | 2 | 3; // 0 = pass

export interface Player {
    id: string;
    name: string;
    hand: Card[];
    role: PlayerRole;
    bid: BidValue | null;
    isConnected: boolean;
}

export type CombinationType =
    | 'single'
    | 'pair'
    | 'triple'
    | 'triple_one'
    | 'triple_two'
    | 'straight'
    | 'straight_pairs'
    | 'plane'
    | 'plane_wings'
    | 'four_two'
    | 'bomb'
    | 'rocket';

export interface Combination {
    type: CombinationType;
    cards: Card[];
    primaryValue: number; // For comparison
    length?: number; // For straights
}

export interface GameState {
    phase: GamePhase;
    players: Player[];
    deck: Card[];
    holeCards: Card[]; // 3 cards for landlord
    currentPlayerIndex: number;
    currentBidIndex: number;
    highestBid: BidValue;
    highestBidder: string | null;
    lastPlay: Combination | null;
    lastPlayerId: string | null;
    passCount: number;
    winner: 'landlord' | 'peasants' | null;
    roomCode: string;
}

// Messages from client to server
export type ClientMessage =
    | { type: 'join'; name: string; token?: string }
    | { type: 'start_game' }
    | { type: 'bid'; value: BidValue }
    | { type: 'play'; cardIds: number[] }
    | { type: 'pass' }
    | { type: 'add_bot' }
    | { type: 'reset' };

// Messages from server to client
export type ServerMessage =
    | { type: 'state'; state: GameState }
    | { type: 'error'; message: string }
    | { type: 'player_joined'; player: Player }
    | { type: 'player_left'; playerId: string };
