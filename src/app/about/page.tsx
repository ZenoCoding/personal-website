'use client';

import styles from './about.module.css';
import { portfolio } from '@/data/portfolio';

export default function About() {
    const uniqueSkills = Array.from(new Set([
        ...portfolio.skills,
        ...portfolio.projects.flatMap(p => p.tags)
    ])).sort();

    return (
        <main className={styles.main}>
            <div className="grid-bg" />
            <div className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>About</h1>
                    <p className={styles.subtitle}>
                        {portfolio.personalInfo.tagline}
                    </p>
                </header>

                <div className={styles.grid}>
                    {/* Now Section (Premium & Personal) */}
                    <section className={styles.section} style={{ gridColumn: '1 / -1' }}>
                        <div className={styles.glassCard} style={{
                            background: 'color-mix(in srgb, var(--color-glass), transparent 50%)',
                            border: '1px solid var(--color-border)',
                            padding: '1.5rem',
                            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' // Soft shadow for depth
                        }}>
                            <div className={styles.headerRow} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <h2 className="section-title" style={{ margin: 0, fontSize: '1.5rem' }}>The Now</h2>
                                    <span style={{
                                        background: 'rgba(var(--color-accent-blue-rgb), 0.1)',
                                        color: 'var(--color-accent-blue)',
                                        border: '1px solid var(--color-accent-blue)',
                                        padding: '0.15rem 0.6rem', // More compact badge
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.05em'
                                    }}>
                                        {portfolio.now.status}
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg> {portfolio.now.location}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                                {/* Left Column: Focus & Meta */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 600 }}>Current Focus</h4>
                                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            {portfolio.now.focus.map((item: { label: string; description: string }, i: number) => (
                                                <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'baseline' }}>
                                                    <span style={{ color: 'var(--color-accent-purple)', fontSize: '0.8rem' }}>▹</span>
                                                    <div style={{ lineHeight: 1.4 }}>
                                                        <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem', marginRight: '0.4rem' }}>{item.label}</strong>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{item.description}</span>
                                                    </div>
                                                </li>
                                            ))}
                                            {/* Merged Offline into Focus list for compactness */}
                                            <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'baseline' }}>
                                                <span style={{ color: 'var(--color-accent-purple)', fontSize: '0.8rem' }}>▹</span>
                                                <div style={{ lineHeight: 1.4 }}>
                                                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem', marginRight: '0.4rem' }}>Offline</strong>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{portfolio.now.baking}</span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Right Column: Bookshelf & Watching */}
                                <div>
                                    <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 600 }}>Reading Log</h4>

                                    {/* Virtual Bookshelf */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* Active Reading (Open Book style) */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {portfolio.now.reading.filter((b: { status: string }) => b.status === 'reading').map((book: { title: string; author: string }, i: number) => (
                                                <div key={i} style={{
                                                    background: 'color-mix(in srgb, var(--color-glass), transparent 80%)',
                                                    border: '1px solid var(--color-border)',
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    width: '100%'
                                                }}>
                                                    <span style={{ color: 'var(--color-accent-blue)', display: 'flex' }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                                        </svg>
                                                    </span>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline' }}>
                                                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{book.title}</p>
                                                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{book.author}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Finished Stack (Clean List) */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            <h5 style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previously Read</h5>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {portfolio.now.reading.filter((b: { status: string }) => b.status === 'finished').map((book: { title: string; author: string }, i: number) => (
                                                    <div key={i} style={{
                                                        background: 'color-mix(in srgb, var(--color-glass), transparent 80%)',
                                                        border: '1px solid var(--color-border)',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        width: '100%' // Full width
                                                    }}>
                                                        <span style={{ color: 'var(--color-accent-green, #4ade80)', display: 'flex' }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        </span>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline' }}>
                                                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{book.title}</p>
                                                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{book.author}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Cool Stuff Links */}
                                        {portfolio.now.coolStuff && portfolio.now.coolStuff.length > 0 && (
                                            <div>
                                                <h5 style={{ margin: 0, marginBottom: '0.8rem', fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cool Stuff</h5>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {portfolio.now.coolStuff.map((item: { title: string; url: string; type: string }, i: number) => (
                                                        <a
                                                            key={i}
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                padding: '0.5rem 0.8rem',
                                                                background: 'color-mix(in srgb, var(--color-glass), transparent 80%)',
                                                                border: '1px solid var(--color-border)',
                                                                borderRadius: '6px',
                                                                color: 'var(--color-text-primary)',
                                                                textDecoration: 'none',
                                                                fontSize: '0.85rem',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                                {item.type === 'video' ? (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                                                    </svg>
                                                                ) : item.type === 'article' ? (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                                    </svg>
                                                                )}
                                                            </span>
                                                            {item.title}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Bio Section */}
                    <section className={styles.section}>
                        <div className={styles.glassCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className={styles.headerRow} style={{ marginBottom: '0.5rem' }}>
                                <h2 className="section-title" style={{ marginBottom: 0 }}>Biography</h2>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
                                {/* Headshot */}
                                <div style={{ flexShrink: 0 }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={portfolio.about.headshot}
                                        alt={portfolio.personalInfo.name}
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '2px solid rgba(255,255,255,0.1)'
                                        }}
                                    />
                                </div>

                                {/* Bio Text */}
                                <p className={styles.bioText} style={{ flex: 1, margin: 0 }}>
                                    {portfolio.about.bio}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Metrics Section */}
                    <section className={styles.section}>
                        <h2 className="section-title">Impact</h2>
                        <div className={styles.metricsGrid}>
                            <div className={styles.metricCard}>
                                <span className={styles.metricValue}>3+</span>
                                <span className={styles.metricLabel}>Years Experience</span>
                            </div>
                            <div className={styles.metricCard}>
                                <span className={styles.metricValue}>{portfolio.projects.length}+</span>
                                <span className={styles.metricLabel}>Projects Delivered</span>
                            </div>
                            <div className={styles.metricCard}>
                                <span className={styles.metricValue}>100+</span>
                                <span className={styles.metricLabel}>Students Led</span>
                            </div>
                        </div>
                    </section>

                    {/* Skills Section */}
                    <section className={styles.section}>
                        <h2 className="section-title">Technical Skills</h2>
                        <div className={styles.skillsGrid}>
                            {uniqueSkills.map((skill) => (
                                <span key={skill} className={styles.skillPill}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Academic Achievements Section */}
                    <section className={styles.section}>
                        <h2 className="section-title">Academic Snapshot</h2>
                        <div className={styles.metricsGrid}>
                            <div className={styles.metricCard}>
                                <span className={styles.metricValue}>{portfolio.education[0].gpa}</span>
                                <span className={styles.metricLabel}>Weighted GPA</span>
                            </div>
                            <div className={styles.metricCard}>
                                <span className={styles.metricValue}>
                                    {portfolio.testScores.find(s => s.name === 'SAT')?.score}
                                </span>
                                <span className={styles.metricLabel}>SAT Score</span>
                            </div>
                            <div className={styles.metricCard}>
                                <span className={styles.metricValue}>
                                    {portfolio.testScores.filter(s => s.name.startsWith('AP') && s.score === '5').length}
                                </span>
                                <span className={styles.metricLabel}>AP Exams (Score 5)</span>
                            </div>
                        </div>
                    </section>

                    {/* Honors Section */}
                    <section className={styles.section}>
                        <h2 className="section-title">Honors & Awards</h2>
                        {portfolio.honors.map((honor, index) => (
                            <div key={index} className={styles.glassCard} style={{ marginBottom: '1rem' }}>
                                <h3 style={{ color: 'var(--color-text-primary)' }}>{honor.title}</h3>
                                <p style={{ color: 'var(--color-accent-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    {honor.award} / {honor.date}
                                </p>
                                <p style={{ color: 'var(--color-text-secondary)' }}>
                                    {honor.description}
                                </p>
                            </div>
                        ))}
                    </section>
                </div>
            </div >
        </main >
    );
}
