'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import usePartySocket from 'partysocket/react';
import styles from '../../doudizhu/doudizhu.module.css';

// Types
type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
type Team = 'A' | 'B';
type GamePhase = 'waiting' | 'bidding' | 'playing' | 'finished';

interface RegularCard { type: 'regular'; suit: Suit; rank: string; value: number; }
interface JokerCard { type: 'joker'; jokerType: 'small' | 'big'; value: number; }
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
    trumpSuit: Suit | null;
    currentPlayerIndex: number;
    currentTrick: Trick;
    completedTricks: Trick[];
    teamAPoints: number;
    teamBPoints: number;
    winner: Team | null;
    roomCode: string;
}

type ClientMessage =
    | { type: 'join'; name: string; token?: string }
    | { type: 'start_game' }
    | { type: 'set_trump'; suit: Suit }
    | { type: 'play'; cardIndex: number }
    | { type: 'add_bot' }
    | { type: 'reset' };

type ServerMessage =
    | { type: 'state'; state: GameState }
    | { type: 'error'; message: string };

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

function isPointCard(card: Card): boolean {
    if (card.type === 'joker') return false;
    return card.rank === '5' || card.rank === '10' || card.rank === 'K';
}

export default function WushikGameRoom() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    const [name, setName] = useState<string>('');
    const [pendingName, setPendingName] = useState<string>('');
    const [needsName, setNeedsName] = useState(false);
    const [playerToken, setPlayerToken] = useState<string>('');
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [error, setError] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Help Modal Component
    const HelpModal = () => (
        <div className={styles.modalOverlay} onClick={() => setShowHelp(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <span className={styles.modalTitle}>510K Rules</span>
                    <button className={styles.modalClose} onClick={() => setShowHelp(false)}>×</button>
                </div>
                <div className={styles.modalContent}>
                    <h3>Overview</h3>
                    <p>510K (五十K) is a Chinese trick-taking game. The goal is to capture point cards.</p>

                    <h3>Point Cards</h3>
                    <p><strong>5 = 5 pts</strong> | <strong>10 = 10 pts</strong> | <strong>K = 10 pts</strong></p>
                    <p>Total: 100 points per deck. Capture 40+ to win!</p>

                    <h3>Teams</h3>
                    <p>• <strong>2 Players:</strong> 1v1 (27 cards each)</p>
                    <p>• <strong>4 Players:</strong> Teams (A: P1+P3, B: P2+P4)</p>

                    <h3>Trump Selection</h3>
                    <p>First player chooses the trump suit (♠♥♦♣). Trump cards beat all others.</p>

                    <h3>Card Rankings (High → Low)</h3>
                    <p>A K Q J 10 9 8 7 6 5 4 3 2</p>
                    <p>Jokers are always trump and beat everything.</p>

                    <h3>Playing Tricks</h3>
                    <p>• Lead player plays any card</p>
                    <p>• Others must follow suit if possible</p>
                    <p>• If you can't follow, play any card (including trump)</p>
                    <p>• Highest card of led suit wins (unless trumped)</p>
                    <p>• Winner leads next trick</p>

                    <h3>Winning</h3>
                    <p>• Play all cards, then count captured points</p>
                    <p>• Team/player with 40+ points wins</p>
                    <p>• Capturing the last trick adds bonus strategy!</p>
                </div>
            </div>
        </div>
    );
    useEffect(() => {
        const storedName = sessionStorage.getItem('wushik_name');
        if (!storedName) {
            setNeedsName(true);
            return;
        }
        setName(storedName);
    }, []);

    const socket = usePartySocket({
        host: PARTYKIT_HOST,
        party: 'wushik',
        room: roomId,
        onMessage: (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'state') {
                setGameState(msg.state);
                setError('');
            } else if (msg.type === 'error') {
                setError(msg.message);
                setTimeout(() => setError(''), 3000);
            } else if (msg.type === 'token') {
                setPlayerToken(msg.token);
                sessionStorage.setItem(`wushik_token_${roomId}`, msg.token);
            }
        },
        onOpen: () => {
            if (name) {
                const storedToken = sessionStorage.getItem(`wushik_token_${roomId}`);
                send({ type: 'join', name, token: storedToken || undefined });
            }
        }
    });

    const send = useCallback((msg: ClientMessage) => {
        socket.send(JSON.stringify(msg));
    }, [socket]);

    useEffect(() => {
        if (name && socket.readyState === WebSocket.OPEN) {
            const storedToken = sessionStorage.getItem(`wushik_token_${roomId}`);
            send({ type: 'join', name, token: storedToken || undefined });
        }
    }, [name, socket.readyState, send, roomId]);

    const handlePlay = (cardIndex: number) => {
        send({ type: 'play', cardIndex });
    };

    const handleSetTrump = (suit: Suit) => {
        send({ type: 'set_trump', suit });
    };

    // Name entry for shared links
    if (needsName) {
        const handleNameSubmit = () => {
            if (pendingName.trim()) {
                sessionStorage.setItem('wushik_name', pendingName.trim());
                setName(pendingName.trim());
                setNeedsName(false);
            }
        };

        return (
            <main className={styles.lobby}>
                <div className={styles.lobbyCard}>
                    <h1 className={styles.title}>510K</h1>
                    <p className={styles.subtitle}>Joining Room: {roomId}</p>
                    <div className={styles.form}>
                        <input
                            type="text"
                            placeholder="Your name"
                            value={pendingName}
                            onChange={(e) => setPendingName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                            className={styles.input}
                            maxLength={20}
                            autoFocus
                        />
                        <button onClick={handleNameSubmit} className={styles.primaryBtn} disabled={!pendingName.trim()}>
                            Join Game
                        </button>
                    </div>
                </div>
            </main>
        );
    }

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
    const isMyTurn = myPlayer && gameState.players[gameState.currentPlayerIndex]?.id === myPlayer.id;

    // Waiting phase
    if (gameState.phase === 'waiting') {
        const canStart = gameState.players.length === 2 || gameState.players.length === 4;
        const maxPlayers = 4;

        const handleCopyLink = async () => {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <main className={styles.gameRoom}>
                {showHelp && <HelpModal />}
                <div className={styles.gameHeader}>
                    <button onClick={handleCopyLink} className={styles.roomCode} title="Click to copy link">
                        {copied ? 'Copied!' : `Room: ${roomId}`}
                    </button>
                    <span className={styles.gameTitle}>510K</span>
                    <span className={styles.gameStatus}>Waiting for players...</span>
                    <button className={styles.helpBtn} onClick={() => setShowHelp(true)} title="How to play">?</button>
                    <button onClick={() => router.push('/games/wushik')} className={styles.exitBtn}>
                        Exit
                    </button>
                </div>
                <div className={styles.waitingRoom}>
                    <div className={styles.playerList}>
                        {[0, 1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`${styles.playerSlot} ${gameState.players[i] ? '' : styles.empty}`}
                            >
                                {gameState.players[i] ? (
                                    <>
                                        <div className={styles.playerName}>
                                            {gameState.players[i].name}
                                        </div>
                                        <div className={styles.playerRole}>
                                            {gameState.players.length <= 2
                                                ? (i === 0 ? 'Player 1' : 'Player 2')
                                                : (i % 2 === 0 ? 'Team A' : 'Team B')}
                                            {gameState.players[i].name === name ? ' (You)' : ''}
                                        </div>
                                    </>
                                ) : (
                                    i < 2 ? 'Waiting...' : '(Optional)'
                                )}
                            </div>
                        ))}
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.actions}>
                        <button
                            onClick={() => send({ type: 'start_game' })}
                            disabled={!canStart}
                            className={styles.startBtn}
                        >
                            Start Game ({gameState.players.length}p)
                        </button>
                        <button
                            onClick={() => send({ type: 'add_bot' })}
                            disabled={gameState.players.length >= maxPlayers}
                            className={styles.secondaryBtn}
                        >
                            + Add Bot
                        </button>
                        <button
                            onClick={() => send({ type: 'reset' })}
                            className={styles.passBtn}
                        >
                            Reset Room
                        </button>
                    </div>
                    <p className={styles.waitingText}>
                        Share room code <strong>{roomId}</strong> • Start with 2 or 4 players
                    </p>
                </div>
            </main>
        );
    }

    // Bidding phase (choose trump)
    if (gameState.phase === 'bidding') {
        const suitOptions: { suit: Suit; symbol: string; color: string }[] = [
            { suit: 'spades', symbol: '♠', color: '#1f2937' },
            { suit: 'hearts', symbol: '♥', color: '#dc2626' },
            { suit: 'diamonds', symbol: '♦', color: '#dc2626' },
            { suit: 'clubs', symbol: '♣', color: '#1f2937' }
        ];

        return (
            <main className={styles.gameRoom}>
                <div className={styles.gameHeader}>
                    <span className={styles.roomCode}>Room: {roomId}</span>
                    <span className={styles.gameStatus}>Choose Trump Suit</span>
                    <button onClick={() => router.push('/games/wushik')} className={styles.exitBtn}>
                        ✕ Exit
                    </button>
                </div>
                <div className={styles.gameArea}>
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <h2>Select Trump Suit</h2>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                            {suitOptions.map(({ suit, symbol, color }) => (
                                <button
                                    key={suit}
                                    onClick={() => handleSetTrump(suit)}
                                    style={{
                                        fontSize: '3rem',
                                        padding: '1rem 2rem',
                                        background: 'white',
                                        border: '2px solid #ddd',
                                        borderRadius: '0.5rem',
                                        color,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {symbol}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.myHand}>
                        <div className={styles.handLabel}>Your cards (Team {myPlayer?.team})</div>
                        <div className={styles.cards}>
                            {myPlayer?.hand.map((card, i) => (
                                <div
                                    key={i}
                                    className={`${styles.card} ${card.type === 'joker' ? styles.joker : isRedCard(card) ? styles.red : styles.black} ${isPointCard(card) ? styles.point : ''}`}
                                >
                                    {getCardDisplay(card)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // Playing phase
    if (gameState.phase === 'playing' || gameState.phase === 'finished') {
        const suitSymbols: Record<Suit, string> = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };

        return (
            <main className={styles.gameRoom}>
                {isMyTurn && gameState.phase === 'playing' && (
                    <div className={styles.turnBanner}>
                        🎯 YOUR TURN — Play a card!
                    </div>
                )}

                <div className={styles.gameHeader} style={isMyTurn && gameState.phase === 'playing' ? { marginTop: '48px' } : {}}>
                    <span className={styles.roomCode}>Room: {roomId}</span>
                    <span className={styles.gameStatus}>
                        Trump: {gameState.trumpSuit ? suitSymbols[gameState.trumpSuit] : 'None'} |
                        Team A: {gameState.teamAPoints}pts | Team B: {gameState.teamBPoints}pts
                    </span>
                    <button onClick={() => router.push('/games/wushik')} className={styles.exitBtn}>
                        ✕ Exit
                    </button>
                </div>

                <div className={styles.gameArea}>
                    <div className={styles.otherPlayers}>
                        {gameState.players.filter(p => p.name !== name).map(p => (
                            <div
                                key={p.id}
                                className={`${styles.playerSlot} ${gameState.players[gameState.currentPlayerIndex]?.id === p.id ? styles.current : ''}`}
                            >
                                <div className={styles.playerName}>{p.name}</div>
                                <div className={styles.playerRole}>Team {p.team}</div>
                                <div className={styles.cardCount}>🃏 {p.hand.length}</div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.playArea}>
                        {gameState.currentTrick.cards.length > 0 ? (
                            <div className={styles.lastPlay}>
                                {gameState.currentTrick.cards.map((play, i) => {
                                    const player = gameState.players.find(p => p.id === play.playerId);
                                    return (
                                        <div key={i} style={{ textAlign: 'center' }}>
                                            <div
                                                className={`${styles.card} ${play.card.type === 'joker' ? styles.joker : isRedCard(play.card) ? styles.red : styles.black}`}
                                            >
                                                {getCardDisplay(play.card)}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>
                                                {player?.name}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={styles.noPlay}>
                                {isMyTurn ? 'Lead the trick!' : 'Waiting...'}
                            </div>
                        )}
                    </div>

                    <div className={`${styles.myHand} ${isMyTurn && gameState.phase === 'playing' ? styles.myTurn : ''}`}>
                        <div className={styles.handLabel}>
                            Your cards (Team {myPlayer?.team}) — {myPlayer?.hand.length} remaining
                        </div>
                        <div className={styles.cards}>
                            {myPlayer?.hand.map((card, i) => (
                                <div
                                    key={i}
                                    onClick={() => isMyTurn && handlePlay(i)}
                                    className={`${styles.card} ${card.type === 'joker' ? styles.joker : isRedCard(card) ? styles.red : styles.black}`}
                                    style={{ cursor: isMyTurn ? 'pointer' : 'default' }}
                                >
                                    {getCardDisplay(card)}
                                </div>
                            ))}
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                    </div>
                </div>

                {gameState.phase === 'finished' && (
                    <div className={styles.winnerOverlay}>
                        <div className={styles.winnerCard}>
                            <h2 className={styles.winnerTitle} style={{ color: '#3b82f6' }}>
                                🎉 Team {gameState.winner} Wins!
                            </h2>
                            <p style={{ marginBottom: '1.5rem' }}>
                                Team A: {gameState.teamAPoints}pts | Team B: {gameState.teamBPoints}pts
                            </p>
                            <button onClick={() => router.push('/games/wushik')} className={styles.primaryBtn}>
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
