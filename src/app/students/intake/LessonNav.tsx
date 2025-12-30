'use client';

import { useEffect, useState } from 'react';
import styles from './LessonNav.module.css';

interface Section {
    id: string;
    label: string;
}

interface LessonNavProps {
    sections: Section[];
}

export default function LessonNav({ sections }: LessonNavProps) {
    const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-20% 0px -60% 0px' // Trigger when section is in upper portion of viewport
            }
        );

        sections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [sections]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.header}>Contents</div>
            <ul className={styles.list}>
                {sections.map(({ id, label }) => (
                    <li key={id}>
                        <button
                            className={`${styles.item} ${activeSection === id ? styles.active : ''}`}
                            onClick={() => scrollToSection(id)}
                        >
                            {label}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
