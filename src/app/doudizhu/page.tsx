'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './doudizhu.module.css';

function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export default function DoudizhuLobby() {
    const router = useRouter();
    const [joinCode, setJoinCode] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleCreate = () => {
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        const code = generateRoomCode();
        sessionStorage.setItem('doudizhu_name', name.trim());
        router.push(`/doudizhu/${code}`);
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
        sessionStorage.setItem('doudizhu_name', name.trim());
        router.push(`/doudizhu/${joinCode.toUpperCase()}`);
    };

    return (
        <main className={styles.lobby}>
            <div className={styles.lobbyCard}>
                <h1 className={styles.title}>斗地主</h1>
                <p className={styles.subtitle}>Fight the Landlord</p>

                <div className={styles.form}>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.input}
                        maxLength={20}
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <button onClick={handleCreate} className={styles.primaryBtn}>
                        Create Room
                    </button>

                    <div className={styles.divider}>
                        <span>or join existing</span>
                    </div>

                    <input
                        type="text"
                        placeholder="Room code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        className={styles.input}
                        maxLength={4}
                    />

                    <button onClick={handleJoin} className={styles.secondaryBtn}>
                        Join Room
                    </button>
                </div>
            </div>
        </main>
    );
}
