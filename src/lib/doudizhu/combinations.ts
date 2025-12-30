// Combination validation for Dou Di Zhu

import { Card, Combination, CombinationType } from './types';

// Group cards by value
function groupByValue(cards: Card[]): Map<number, Card[]> {
    const groups = new Map<number, Card[]>();
    for (const card of cards) {
        const existing = groups.get(card.value) || [];
        groups.set(card.value, [...existing, card]);
    }
    return groups;
}

// Check if values form a consecutive sequence
function isConsecutive(values: number[]): boolean {
    if (values.length < 2) return true;
    const sorted = [...values].sort((a, b) => a - b);
    // 2s and jokers cannot be in straights
    if (sorted.some(v => v >= 15)) return false;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) return false;
    }
    return true;
}

// Validate and identify a combination
export function validateCombination(cards: Card[]): Combination | null {
    if (cards.length === 0) return null;

    const groups = groupByValue(cards);
    const values = Array.from(groups.keys()).sort((a, b) => a - b);
    const counts = Array.from(groups.values()).map(g => g.length);

    // === ROCKET (both jokers) ===
    if (cards.length === 2) {
        const isRocket = cards.every(c => c.type === 'joker');
        if (isRocket) {
            return { type: 'rocket', cards, primaryValue: 99 };
        }
    }

    // === BOMB (four of a kind) ===
    if (cards.length === 4 && groups.size === 1 && counts[0] === 4) {
        return { type: 'bomb', cards, primaryValue: values[0] };
    }

    // === SINGLE ===
    if (cards.length === 1) {
        return { type: 'single', cards, primaryValue: cards[0].value };
    }

    // === PAIR ===
    if (cards.length === 2 && groups.size === 1) {
        return { type: 'pair', cards, primaryValue: values[0] };
    }

    // === TRIPLE ===
    if (cards.length === 3 && groups.size === 1) {
        return { type: 'triple', cards, primaryValue: values[0] };
    }

    // === TRIPLE + ONE ===
    if (cards.length === 4 && groups.size === 2) {
        const tripleValue = values.find(v => groups.get(v)!.length === 3);
        if (tripleValue !== undefined) {
            return { type: 'triple_one', cards, primaryValue: tripleValue };
        }
    }

    // === TRIPLE + PAIR ===
    if (cards.length === 5 && groups.size === 2) {
        const tripleValue = values.find(v => groups.get(v)!.length === 3);
        const pairValue = values.find(v => groups.get(v)!.length === 2);
        if (tripleValue !== undefined && pairValue !== undefined) {
            return { type: 'triple_two', cards, primaryValue: tripleValue };
        }
    }

    // === STRAIGHT (5+ consecutive singles) ===
    if (cards.length >= 5 && groups.size === cards.length && isConsecutive(values)) {
        return {
            type: 'straight',
            cards,
            primaryValue: Math.max(...values),
            length: cards.length
        };
    }

    // === STRAIGHT PAIRS (3+ consecutive pairs) ===
    if (cards.length >= 6 && cards.length % 2 === 0) {
        const allPairs = counts.every(c => c === 2);
        if (allPairs && isConsecutive(values)) {
            return {
                type: 'straight_pairs',
                cards,
                primaryValue: Math.max(...values),
                length: groups.size
            };
        }
    }

    // === PLANE (2+ consecutive triples) ===
    if (cards.length >= 6 && cards.length % 3 === 0) {
        const allTriples = counts.every(c => c === 3);
        if (allTriples && isConsecutive(values)) {
            return {
                type: 'plane',
                cards,
                primaryValue: Math.max(...values),
                length: groups.size
            };
        }
    }

    // === PLANE WITH WINGS (consecutive triples + singles/pairs) ===
    const tripleValues = values.filter(v => groups.get(v)!.length === 3);
    if (tripleValues.length >= 2 && isConsecutive(tripleValues)) {
        const planeSize = tripleValues.length;
        const wingCards = cards.length - planeSize * 3;

        // With singles
        if (wingCards === planeSize) {
            return {
                type: 'plane_wings',
                cards,
                primaryValue: Math.max(...tripleValues),
                length: planeSize
            };
        }
        // With pairs
        if (wingCards === planeSize * 2) {
            const nonTripleValues = values.filter(v => groups.get(v)!.length !== 3);
            const allPairs = nonTripleValues.every(v => groups.get(v)!.length === 2);
            if (allPairs) {
                return {
                    type: 'plane_wings',
                    cards,
                    primaryValue: Math.max(...tripleValues),
                    length: planeSize
                };
            }
        }
    }

    // === FOUR WITH TWO (four + 2 singles or 2 pairs) ===
    const quadValue = values.find(v => groups.get(v)!.length === 4);
    if (quadValue !== undefined) {
        if (cards.length === 6) { // Four + 2 singles
            return { type: 'four_two', cards, primaryValue: quadValue };
        }
        if (cards.length === 8) { // Four + 2 pairs
            const nonQuadValues = values.filter(v => v !== quadValue);
            const allPairs = nonQuadValues.every(v => groups.get(v)!.length === 2);
            if (allPairs && nonQuadValues.length === 2) {
                return { type: 'four_two', cards, primaryValue: quadValue };
            }
        }
    }

    return null;
}

// Check if play2 beats play1
export function canBeat(play1: Combination, play2: Combination): boolean {
    // Rocket beats everything
    if (play2.type === 'rocket') return true;
    if (play1.type === 'rocket') return false;

    // Bomb beats non-bomb
    if (play2.type === 'bomb' && play1.type !== 'bomb') return true;
    if (play1.type === 'bomb' && play2.type !== 'bomb') return false;

    // Same type comparison
    if (play1.type !== play2.type) return false;

    // For straights, must be same length
    if (play1.length !== undefined && play1.length !== play2.length) return false;

    // Higher value wins
    return play2.primaryValue > play1.primaryValue;
}
