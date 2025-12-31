// 510K (五十K) Game Types

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type JokerType = 'small' | 'big';

export interface RegularCard {
    type: 'regular';
    suit: Suit;
    rank: Rank;
    value: number; // For comparison within suit
}

export interface JokerCard {
    type: 'joker';
    jokerType: JokerType;
    value: number;
}

export type Card = RegularCard | JokerCard;

// Point values: 5=5, 10=10, K=10
export function getPointValue(card: Card): number {
    if (card.type === 'joker') return 0;
    if (card.rank === '5') return 5;
    if (card.rank === '10') return 10;
    if (card.rank === 'K') return 10;
    return 0;
}

export type Team = 'A' | 'B';
export type GamePhase = 'waiting' | 'bidding' | 'playing' | 'finished';

export interface Player {
    id: string;
    name: string;
    hand: Card[];
    team: Team | null;
    isConnected: boolean;
}

export interface Trick {
    leadSuit: Suit | null; // null if joker led
    cards: { playerId: string; card: Card }[];
    winnerId: string | null;
}

export interface GameState {
    phase: GamePhase;
    players: Player[]; // 4 players
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

// Messages
export type ClientMessage =
    | { type: 'join'; name: string }
    | { type: 'start_game' }
    | { type: 'set_trump'; suit: Suit }
    | { type: 'play'; cardIndex: number }
    | { type: 'add_bot' }
    | { type: 'reset' };

export type ServerMessage =
    | { type: 'state'; state: GameState }
    | { type: 'error'; message: string }
    | { type: 'player_joined'; player: Player }
    | { type: 'player_left'; playerId: string };
