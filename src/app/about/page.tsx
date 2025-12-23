'use client';

import styles from './about.module.css';
import { portfolio } from '@/data/portfolio';

export default function About() {
    return (
        <main className={styles.main}>
            <div className="grid-bg" />
            <div className="container">
                <h1 className={styles.title}>About</h1>

                <div className={styles.grid}>
                    {/* Now Section (Premium & Personal) */}
                    <section className={styles.section} style={{ gridColumn: '1 / -1' }}>
                        <div className={styles.glassCard} style={{
                            background: 'rgba(var(--background-rgb), 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '1.5rem' // Reduced padding
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
                                            {portfolio.now.focus.map((item, i) => (
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

                                {/* Right Column: Bookshelf */}
                                <div>
                                    <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 600 }}>Reading Log</h4>

                                    {/* Virtual Bookshelf */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* Active Reading (Open Book style) */}
                                        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                            {portfolio.now.reading.filter(b => b.status === 'reading').map((book, i) => (
                                                <div key={i} style={{
                                                    background: 'rgba(255, 255, 255, 0.03)',
                                                    borderLeft: '3px solid var(--color-accent-blue)',
                                                    padding: '0.5rem 0.8rem',
                                                    borderRadius: '0 4px 4px 0',
                                                    flex: '1 1 45%'
                                                }}>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{book.title}</p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>by {book.author}</p>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-accent-blue)', marginTop: '0.2rem', display: 'block' }}>Currently Reading</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Finished Stack (Clean List) */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                                            <h5 style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previously Read</h5>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {portfolio.now.reading.filter(b => b.status === 'finished').map((book, i) => (
                                                    <div key={i} style={{
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        width: '100%' // Full width
                                                    }}>
                                                        <span style={{ color: 'var(--color-accent-green, #4ade80)', fontSize: '0.8rem' }}>✓</span>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'baseline' }}>
                                                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{book.title}</p>
                                                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{book.author}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Bio Section */}
                    <section className={styles.section}>
                        <div className={styles.glassCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className={styles.headerRow}>
                                <h2 className="section-title">Biography</h2>
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
                                <span className={styles.metricValue}>20+</span>
                                <span className={styles.metricLabel}>Projects Delivered</span>
                            </div>
                            <div className={styles.metricCard}>
                                <span className={styles.metricValue}>50+</span>
                                <span className={styles.metricLabel}>Students Led</span>
                            </div>
                        </div>
                    </section>

                    {/* Skills Section */}
                    <section className={styles.section}>
                        <h2 className="section-title">Technical Skills</h2>
                        <div className={styles.skillsGrid}>
                            {portfolio.skills.map((skill) => (
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
