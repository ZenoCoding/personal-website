'use client';

import { useEffect, useState } from 'react';
import styles from './SectionNavigation.module.css';

const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'projects', label: 'Work' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
];

export default function SectionNavigation() {
    const [activeSection, setActiveSection] = useState('hero');

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
                rootMargin: '-50% 0px -50% 0px' // Trigger when section crosses the middle of viewport
            }
        );

        sections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className={styles.navContainer}>
            {sections.map(({ id, label }) => (
                <div
                    key={id}
                    className={`${styles.dotContainer} ${activeSection === id ? styles.active : ''}`}
                    onClick={() => scrollToSection(id)}
                >
                    <span className={styles.label}>{label}</span>
                    <div className={styles.dot} />
                </div>
            ))}
        </nav>
    );
}
