'use client';

import Link from 'next/link';
import styles from './Hero.module.css';
import { useTypewriter } from '@/hooks/useTypewriter';
import MagneticButton from '@/components/MagneticButton';

const Hero = () => {
    const typewriterText = useTypewriter(
        ['Autonomous Systems.', 'Neural Architectures.', 'Immersive Worlds.', 'Algorithmic Design.'],
        100,
        50,
        2500
    );

    return (
        <section className={styles.hero}>
            <div className={`container ${styles.content}`}>
                <div className={styles.statusBadge}>
                    <div className={styles.statusDot} />
                    <span>Currently compiling MathGPT v2.0</span>
                </div>

                <h1 className={styles.title}>
                    <span className={styles.greeting}>Hi, I'm Tycho.</span>
                    Building Intelligence
                    <br />
                    through <span style={{ color: 'var(--color-accent-highlight)' }} className={styles.typewriterWrapper}>
                        {/* Render all phrases invisibly to reserve space */}
                        {['Autonomous Systems.', 'Neural Architectures.', 'Immersive Worlds.', 'Algorithmic Design.'].map((text) => (
                            <span key={text} aria-hidden="true">{text}</span>
                        ))}
                        {/* Render the visible active text */}
                        <span className={styles.typewriterVisible}>
                            {typewriterText}
                            <span className={styles.typewriterCursor}></span>
                        </span>
                    </span>
                </h1>

                <p className={styles.tagline}>
                    I'm a software engineer and robotics leader focused on AI, game development, and solving complex problems.
                </p>

                <div className={styles.actions}>
                    <MagneticButton>
                        <Link href="/projects" className={styles.primaryBtn}>
                            View Projects
                        </Link>
                    </MagneticButton>
                    <MagneticButton>
                        <Link href="/about" className={styles.secondaryBtn}>
                            About Me
                        </Link>
                    </MagneticButton>
                </div>
            </div>
        </section>
    );
};

export default Hero;
