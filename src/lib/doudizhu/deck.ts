// Card deck utilities for Dou Di Zhu

import { Card, RegularCard, JokerCard, Suit, Rank } from './types';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

// Get numeric value for a rank (for comparison)
export function getRankValue(rank: Rank): number {
    const values: Record<Rank, number> = {
        '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15
    };
    return values[rank];
}

// Create a full 54-card deck
export function createDeck(): Card[] {
    const deck: Card[] = [];

    // Add regular cards
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            const card: RegularCard = {
                type: 'regular',
                suit,
                rank,
                value: getRankValue(rank)
            };
            deck.push(card);
        }
    }

    // Add jokers
    const smallJoker: JokerCard = { type: 'joker', jokerType: 'small', value: 16 };
    const bigJoker: JokerCard = { type: 'joker', jokerType: 'big', value: 17 };
    deck.push(smallJoker, bigJoker);

    return deck;
}

// Fisher-Yates shuffle
export function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Deal cards to 3 players (17 each) and return 3 hole cards
export function dealCards(deck: Card[]): { hands: Card[][]; holeCards: Card[] } {
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

// Sort cards by value (for display)
export function sortCards(cards: Card[]): Card[] {
    return [...cards].sort((a, b) => a.value - b.value);
}

// Get card display string
export function getCardDisplay(card: Card): string {
    if (card.type === 'joker') {
        return card.jokerType === 'big' ? '🃏' : '🂿';
    }

    const suitSymbols: Record<Suit, string> = {
        spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣'
    };

    return `${suitSymbols[card.suit]}${card.rank}`;
}

// Create a unique ID for a card
export function getCardId(card: Card, index: number): string {
    if (card.type === 'joker') {
        return `joker-${card.jokerType}`;
    }
    return `${card.suit}-${card.rank}-${index}`;
}
