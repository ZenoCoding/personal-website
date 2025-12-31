'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../doudizhu/doudizhu.module.css';

function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export default function WushikLobby() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');

    const handleCreate = () => {
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        sessionStorage.setItem('wushik_name', name.trim());
        const roomCode = generateRoomCode();
        router.push(`/games/wushik/${roomCode}`);
    };

    const handleJoin = () => {
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!joinCode.trim()) {
            setError('Please enter a room code');
            return;
        }
        sessionStorage.setItem('wushik_name', name.trim());
        router.push(`/games/wushik/${joinCode.toUpperCase()}`);
    };

    return (
        <main className={styles.lobby}>
            <div className={styles.lobbyCard}>
                <h1 className={styles.title} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text' }}>五十K</h1>
                <p className={styles.subtitle}>510K - Team Trick-Taking</p>

                <div className={styles.form}>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className={styles.input}
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <button onClick={handleCreate} className={styles.primaryBtn} style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        Create Room
                    </button>

                    <div className={styles.divider}>or join existing</div>

                    <input
                        type="text"
                        placeholder="Room code"
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                        className={styles.input}
                        maxLength={4}
                    />

                    <button onClick={handleJoin} className={styles.secondaryBtn}>
                        Join Room
                    </button>

                    <a href="/games" className={styles.backLink}>← Back to Games</a>
                </div>

                <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    2-4 players • Point cards: 5, 10, K
                </p>
            </div>
        </main>
    );
}
