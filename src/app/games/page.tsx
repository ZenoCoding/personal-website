'use client';

import Link from 'next/link';
import styles from './games.module.css';

const games = [
    {
        id: 'doudizhu',
        name: '斗地主',
        subtitle: 'Dou Di Zhu',
        description: 'Fight the Landlord! 3-player card shedding game.',
        players: '3 players',
        emoji: '👑',
        color: '#ef4444',
        href: '/games/doudizhu'
    },
    {
        id: 'wushik',
        name: '五十K',
        subtitle: '510K',
        description: 'Team trick-taking with point cards (5, 10, K).',
        players: '2-4 players',
        emoji: '🃏',
        color: '#3b82f6',
        href: '/games/wushik'
    }
];

export default function GamesHub() {
    return (
        <main className={styles.hub}>
            <div className={styles.header}>
                <h1 className={styles.title}>Games</h1>
                <p className={styles.subtitle}>Classic Chinese card games</p>
            </div>

            <div className={styles.gameGrid}>
                {games.map(game => (
                    <Link
                        key={game.id}
                        href={game.href}
                        className={styles.gameCard}
                        style={{ '--accent': game.color } as React.CSSProperties}
                    >
                        <div className={styles.gameEmoji}>{game.emoji}</div>
                        <div className={styles.gameInfo}>
                            <h2 className={styles.gameName}>{game.name}</h2>
                            <p className={styles.gameSubtitle}>{game.subtitle}</p>
                            <p className={styles.gameDesc}>{game.description}</p>
                            <span className={styles.gamePlayers}>{game.players}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
