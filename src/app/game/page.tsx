import { Metadata } from "next";
import Link from "next/link";
import styles from "./Game.module.css";

export const metadata: Metadata = {
    title: "The Deck | Tycho Young",
    description: "A secret card game.",
    robots: { index: false, follow: false },
};

export default function GamePage() {
    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <div className={styles.cardPlaceholder}>
                    <span>?</span>
                </div>

                <h1 className={styles.title}>The Deck</h1>
                <p className={styles.subtitle}>
                    A card game is currently under construction. Check back soon.
                </p>

                <footer className={styles.footer}>
                    <Link href="/" className={styles.backLink}>
                        <span>←</span>
                        <span>Return to Safety</span>
                    </Link>
                </footer>
            </div>
        </main>
    );
}
