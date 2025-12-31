// 510K Deck Utilities

import { Card, Suit, Rank, RegularCard, JokerCard, getPointValue } from './types';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Rank values for comparison (2 is low, A is high)
const RANK_VALUES: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export function createDeck(): Card[] {
    const cards: Card[] = [];

    // Regular cards
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            cards.push({
                type: 'regular',
                suit,
                rank,
                value: RANK_VALUES[rank]
            });
        }
    }

    // Jokers
    cards.push({ type: 'joker', jokerType: 'small', value: 15 });
    cards.push({ type: 'joker', jokerType: 'big', value: 16 });

    return cards;
}

export function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Deal cards to 4 players (13 cards each, 2 left in kitty)
export function dealCards(deck: Card[]): { hands: Card[][]; kitty: Card[] } {
    const hands: Card[][] = [[], [], [], []];

    for (let i = 0; i < 52; i++) {
        hands[i % 4].push(deck[i]);
    }

    // Last 2 cards go to kitty (dealer picks them up)
    const kitty = [deck[52], deck[53]];

    return { hands, kitty };
}

export function sortCards(cards: Card[], trumpSuit: Suit | null): Card[] {
    return [...cards].sort((a, b) => {
        // Jokers always highest
        if (a.type === 'joker' && b.type === 'joker') {
            return b.value - a.value;
        }
        if (a.type === 'joker') return 1;
        if (b.type === 'joker') return -1;

        const aCard = a as RegularCard;
        const bCard = b as RegularCard;

        // Trump suit ranks higher
        const aIsTrump = aCard.suit === trumpSuit;
        const bIsTrump = bCard.suit === trumpSuit;

        if (aIsTrump && !bIsTrump) return 1;
        if (!aIsTrump && bIsTrump) return -1;

        // Same suit: compare by value
        if (aCard.suit === bCard.suit) {
            return aCard.value - bCard.value;
        }

        // Different suits: sort by suit order
        const suitOrder = { spades: 4, hearts: 3, diamonds: 2, clubs: 1 };
        return suitOrder[aCard.suit] - suitOrder[bCard.suit];
    });
}

export function getCardDisplay(card: Card): string {
    if (card.type === 'joker') {
        return card.jokerType === 'big' ? '大' : '小';
    }
    const suitSymbols = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
    return `${suitSymbols[card.suit]}${card.rank}`;
}

// Calculate points in a set of cards
export function calculatePoints(cards: Card[]): number {
    return cards.reduce((sum, card) => sum + getPointValue(card), 0);
}

// Determine winner of a trick
export function determineTrickWinner(
    trick: { playerId: string; card: Card }[],
    leadSuit: Suit | null,
    trumpSuit: Suit | null
): string {
    let winningPlay = trick[0];

    for (let i = 1; i < trick.length; i++) {
        const current = trick[i];
        if (beats(current.card, winningPlay.card, leadSuit, trumpSuit)) {
            winningPlay = current;
        }
    }

    return winningPlay.playerId;
}

// Does card A beat card B?
function beats(a: Card, b: Card, leadSuit: Suit | null, trumpSuit: Suit | null): boolean {
    // Big joker beats everything except big joker
    if (a.type === 'joker' && a.jokerType === 'big') return true;
    if (b.type === 'joker' && b.jokerType === 'big') return false;

    // Small joker beats non-jokers
    if (a.type === 'joker' && a.jokerType === 'small') {
        return b.type !== 'joker';
    }
    if (b.type === 'joker') return false;

    const aCard = a as RegularCard;
    const bCard = b as RegularCard;

    const aIsTrump = aCard.suit === trumpSuit;
    const bIsTrump = bCard.suit === trumpSuit;

    // Trump beats non-trump
    if (aIsTrump && !bIsTrump) return true;
    if (!aIsTrump && bIsTrump) return false;

    // Both trump or both non-trump
    if (aIsTrump && bIsTrump) {
        return aCard.value > bCard.value;
    }

    // Neither is trump - must follow lead suit
    const aFollows = aCard.suit === leadSuit;
    const bFollows = bCard.suit === leadSuit;

    if (aFollows && !bFollows) return true;
    if (!aFollows && bFollows) return false;
    if (aFollows && bFollows) {
        return aCard.value > bCard.value;
    }

    // Neither follows - first one wins (B was already winning)
    return false;
}

// Check if player can play this card (must follow suit if possible)
export function canPlayCard(
    card: Card,
    hand: Card[],
    leadSuit: Suit | null,
    trumpSuit: Suit | null
): boolean {
    // First card of trick - can play anything
    if (leadSuit === null) return true;

    // Check if player has any cards of lead suit
    const hasLeadSuit = hand.some(c =>
        c.type === 'regular' && c.suit === leadSuit
    );

    // If no lead suit cards, can play anything
    if (!hasLeadSuit) return true;

    // Must follow lead suit
    if (card.type === 'joker') return false;
    return (card as RegularCard).suit === leadSuit;
}
