'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import usePartySocket from 'partysocket/react';
import styles from '../doudizhu.module.css';
import { GameState, Card, ClientMessage, ServerMessage, BidValue, Combination } from '@/lib/doudizhu/types';

// PartyKit host - use localhost for dev, will need to update for production
const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

function getCardDisplay(card: Card): string {
    if (card.type === 'joker') {
        return card.jokerType === 'big' ? '大' : '小';
    }
    const suitSymbols = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
    return `${suitSymbols[card.suit]}${card.rank}`;
}

function isRedCard(card: Card): boolean {
    if (card.type === 'joker') return card.jokerType === 'big';
    return card.suit === 'hearts' || card.suit === 'diamonds';
}

export default function GameRoom() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    const [name, setName] = useState<string>('');
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const storedName = sessionStorage.getItem('doudizhu_name');
        if (!storedName) {
            router.push('/doudizhu');
            return;
        }
        setName(storedName);
    }, [router]);

    const socket = usePartySocket({
        host: PARTYKIT_HOST,
        room: roomId,
        onMessage: (event) => {
            const msg: ServerMessage = JSON.parse(event.data);
            if (msg.type === 'state') {
                setGameState(msg.state);
                setError('');
            } else if (msg.type === 'error') {
                setError(msg.message);
                setTimeout(() => setError(''), 3000);
            }
        },
        onOpen: () => {
            if (name) {
                send({ type: 'join', name });
            }
        }
    });

    const send = useCallback((msg: ClientMessage) => {
        socket.send(JSON.stringify(msg));
    }, [socket]);

    // Join when name is available
    useEffect(() => {
        if (name && socket.readyState === WebSocket.OPEN) {
            send({ type: 'join', name });
        }
    }, [name, socket.readyState, send]);

    const toggleCard = (index: number) => {
        setSelectedCards(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handlePlay = () => {
        if (selectedCards.size === 0) return;
        send({ type: 'play', cardIds: Array.from(selectedCards).sort((a, b) => a - b) });
        setSelectedCards(new Set());
    };

    const handlePass = () => {
        send({ type: 'pass' });
    };

    const handleBid = (value: BidValue) => {
        send({ type: 'bid', value });
    };

    const handleStart = () => {
        send({ type: 'start_game' });
    };

    if (!gameState) {
        return (
            <main className={styles.gameRoom}>
                <div className={styles.gameHeader}>
                    <span className={styles.roomCode}>Room: {roomId}</span>
                    <span className={styles.gameStatus}>Connecting...</span>
                </div>
            </main>
        );
    }

    const myPlayer = gameState.players.find(p => p.name === name);
    const otherPlayers = gameState.players.filter(p => p.name !== name);
    const isMyTurn = myPlayer && gameState.players[gameState.currentPlayerIndex]?.id === myPlayer.id;
    const isBidTurn = myPlayer && gameState.players[gameState.currentBidIndex]?.id === myPlayer.id;

    // Waiting phase
    if (gameState.phase === 'waiting') {
        return (
            <main className={styles.gameRoom}>
                <div className={styles.gameHeader}>
                    <span className={styles.roomCode}>Room: {roomId}</span>
                    <span className={styles.gameStatus}>Waiting for players...</span>
                </div>
                <div className={styles.waitingRoom}>
                    <div className={styles.playerList}>
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className={`${styles.playerSlot} ${gameState.players[i] ? '' : styles.empty}`}
                            >
                                {gameState.players[i] ? (
                                    <>
                                        <div className={styles.playerName}>{gameState.players[i].name}</div>
                                        <div className={styles.playerRole}>
                                            {gameState.players[i].name === name ? '(You)' : ''}
                                        </div>
                                    </>
                                ) : (
                                    'Waiting...'
                                )}
                            </div>
                        ))}
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button
                        onClick={handleStart}
                        disabled={gameState.players.length !== 3}
                        className={styles.startBtn}
                    >
                        Start Game
                    </button>
                    <p className={styles.waitingText}>
                        Share room code <strong>{roomId}</strong> with friends
                    </p>
                </div>
            </main>
        );
    }

    // Bidding phase
    if (gameState.phase === 'bidding') {
        return (
            <main className={styles.gameRoom}>
                <div className={styles.gameHeader}>
                    <span className={styles.roomCode}>Room: {roomId}</span>
                    <span className={styles.gameStatus}>
                        Bidding - {isBidTurn ? 'Your turn!' : `${gameState.players[gameState.currentBidIndex]?.name}'s turn`}
                    </span>
                </div>
                <div className={styles.gameArea}>
                    <div className={styles.otherPlayers}>
                        {otherPlayers.map(p => (
                            <div
                                key={p.id}
                                className={`${styles.playerSlot} ${gameState.players[gameState.currentBidIndex]?.id === p.id ? styles.current : ''}`}
                            >
                                <div className={styles.playerName}>{p.name}</div>
                                <div className={styles.playerRole}>
                                    {p.bid !== null ? (p.bid === 0 ? 'Passed' : `Bid: ${p.bid}`) : '...'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.playArea}>
                        <div className={styles.holeCards}>
                            {gameState.holeCards.map((card, i) => (
                                <div key={i} className={`${styles.card} ${isRedCard(card) ? styles.red : styles.black}`}>
                                    ?
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.myHand}>
                        <div className={styles.handLabel}>Your cards</div>
                        <div className={styles.cards}>
                            {myPlayer?.hand.sort((a, b) => a.value - b.value).map((card, i) => (
                                <div
                                    key={i}
                                    className={`${styles.card} ${card.type === 'joker' ? styles.joker : isRedCard(card) ? styles.red : styles.black}`}
                                >
                                    {getCardDisplay(card)}
                                </div>
                            ))}
                        </div>

                        {isBidTurn && (
                            <div className={styles.biddingArea}>
                                {error && <p className={styles.error}>{error}</p>}
                                <div className={styles.bidButtons}>
                                    <button
                                        onClick={() => handleBid(0)}
                                        className={styles.bidBtn}
                                    >
                                        Pass
                                    </button>
                                    {[1, 2, 3].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => handleBid(v as BidValue)}
                                            disabled={v <= gameState.highestBid}
                                            className={`${styles.bidBtn} ${v === 3 ? styles.highlight : ''}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    // Playing phase
    if (gameState.phase === 'playing' || gameState.phase === 'finished') {
        const canPass = gameState.lastPlay && gameState.lastPlayerId !== myPlayer?.id;

        return (
            <main className={styles.gameRoom}>
                <div className={styles.gameHeader}>
                    <span className={styles.roomCode}>Room: {roomId}</span>
                    <span className={styles.gameStatus}>
                        {gameState.phase === 'finished'
                            ? `Game Over - ${gameState.winner === 'landlord' ? 'Landlord' : 'Peasants'} Win!`
                            : isMyTurn ? 'Your turn!' : `${gameState.players[gameState.currentPlayerIndex]?.name}'s turn`
                        }
                    </span>
                </div>

                <div className={styles.gameArea}>
                    <div className={styles.otherPlayers}>
                        {otherPlayers.map(p => (
                            <div
                                key={p.id}
                                className={`${styles.playerSlot} ${gameState.players[gameState.currentPlayerIndex]?.id === p.id ? styles.current : ''} ${p.role === 'landlord' ? styles.landlord : ''}`}
                            >
                                <div className={styles.playerName}>{p.name}</div>
                                <div className={`${styles.playerRole} ${p.role === 'landlord' ? styles.landlord : ''}`}>
                                    {p.role === 'landlord' ? '👑 Landlord' : 'Peasant'}
                                </div>
                                <div className={styles.cardCount}>🃏 {p.hand.length}</div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.playArea}>
                        {gameState.lastPlay ? (
                            <div className={styles.lastPlay}>
                                {gameState.lastPlay.cards.map((card, i) => (
                                    <div
                                        key={i}
                                        className={`${styles.card} ${card.type === 'joker' ? styles.joker : isRedCard(card) ? styles.red : styles.black}`}
                                    >
                                        {getCardDisplay(card)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noPlay}>
                                {isMyTurn ? 'Play any cards!' : 'Waiting...'}
                            </div>
                        )}
                    </div>

                    <div className={styles.myHand}>
                        <div className={styles.handLabel}>
                            Your cards ({myPlayer?.role === 'landlord' ? '👑 Landlord' : 'Peasant'})
                        </div>
                        <div className={styles.cards}>
                            {myPlayer?.hand
                                .map((card, originalIndex) => ({ card, originalIndex }))
                                .sort((a, b) => a.card.value - b.card.value)
                                .map(({ card, originalIndex }) => (
                                    <div
                                        key={originalIndex}
                                        onClick={() => isMyTurn && toggleCard(originalIndex)}
                                        className={`${styles.card} ${selectedCards.has(originalIndex) ? styles.selected : ''} ${card.type === 'joker' ? styles.joker : isRedCard(card) ? styles.red : styles.black}`}
                                    >
                                        {getCardDisplay(card)}
                                    </div>
                                ))}
                        </div>

                        {isMyTurn && gameState.phase === 'playing' && (
                            <div className={styles.actions}>
                                {error && <p className={styles.error}>{error}</p>}
                                <button
                                    onClick={handlePlay}
                                    disabled={selectedCards.size === 0}
                                    className={styles.playBtn}
                                >
                                    Play
                                </button>
                                {canPass && (
                                    <button onClick={handlePass} className={styles.passBtn}>
                                        Pass
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {gameState.phase === 'finished' && (
                    <div className={styles.winnerOverlay}>
                        <div className={styles.winnerCard}>
                            <h2 className={`${styles.winnerTitle} ${gameState.winner === 'landlord' ? styles.landlord : styles.peasants}`}>
                                {gameState.winner === 'landlord' ? '👑 Landlord Wins!' : '🎉 Peasants Win!'}
                            </h2>
                            <button onClick={() => router.push('/doudizhu')} className={styles.primaryBtn}>
                                Play Again
                            </button>
                        </div>
                    </div>
                )}
            </main>
        );
    }

    return null;
}
