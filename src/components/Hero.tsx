'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './Hero.module.css';
import { portfolio } from '@/data/portfolio';

const Hero = () => {
    return (
        <section id="hero" className={styles.hero}>
            <div className={`container ${styles.content}`}>
                <Link href="#projects" className={styles.statusBadge}>
                    <div className={styles.statusDot} />
                    <span>Currently building {portfolio.projects[0].title}</span>
                </Link>

                <h1 className={styles.title}>
                    <div className={styles.greetingWrapper}>
                        <img
                            src={portfolio.about.headshot}
                            alt={portfolio.personalInfo.name}
                            className={styles.avatar}
                        />
                        <span className={styles.greeting}>Hi, I'm Tycho.</span>
                    </div>
                    I engineer <span className={styles.highlight}>robots</span>
                    <br />
                    and build <span className={styles.highlight}>intelligent software.</span>
                </h1>

                <p className={styles.tagline}>
                    I'm a software engineer and robotics leader focused on AI, solving complex problems, and constant learning.
                </p>

                <div className={styles.actions}>
                    <a
                        href="#projects"
                        className={styles.primaryBtn}
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                            window.history.pushState(null, '', '#projects');
                        }}
                    >
                        View Projects
                        <ArrowRight size={20} className={styles.btnIcon} />
                    </a>
                    <a
                        href="#about"
                        className={styles.secondaryBtn}
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                            window.history.pushState(null, '', '#about');
                        }}
                    >
                        About Me
                    </a>
                </div>
            </div>

            <button
                onClick={() => {
                    const projectsSection = document.getElementById('projects');
                    if (projectsSection) {
                        projectsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
                className={styles.scrollIndicator}
                aria-label="Scroll to projects"
            >
                <ArrowRight size={24} className={styles.scrollIcon} />
            </button>
        </section >
    );
};

export default Hero;
