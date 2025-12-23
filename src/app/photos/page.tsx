'use client';

import { useState } from 'react';
import { portfolio } from '@/data/portfolio';
import styles from './photos.module.css';
import Lightbox from '@/components/Lightbox';
import Image from 'next/image';

export default function Photos() {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    const navigateLightbox = (direction: 'next' | 'prev') => {
        if (lightboxIndex === null) return;
        const total = portfolio.photos.length;
        if (direction === 'next') {
            setLightboxIndex((lightboxIndex + 1) % total);
        } else {
            setLightboxIndex((lightboxIndex - 1 + total) % total);
        }
    };

    return (
        <main className={styles.main}>
            <div className="grid-bg" />
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 className={styles.title} style={{ marginBottom: 0 }}>Through the Lens</h1>

                    {portfolio.gear && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.4rem 0.8rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '999px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.85rem',
                            color: 'var(--color-text-secondary)',
                            marginTop: '0.5rem'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                                <circle cx="12" cy="13" r="3" />
                            </svg>
                            <span>
                                {portfolio.gear.map(g => g.name).join(' + ')}
                            </span>
                        </div>
                    )}
                </div>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '600px', fontSize: '1.1rem' }}>
                    A collection of moments from robotics competitions, late-night coding sessions, and everything in between.
                </p>

                <div className={styles.gallery}>
                    {portfolio.photos?.map((photo, index) => (
                        <div key={index}
                            className={styles.photoCard}
                            onClick={() => openLightbox(index)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={photo.url}
                                    alt={photo.caption}
                                    className={styles.image}
                                    width={0}
                                    height={0}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                            </div>
                            <div className={styles.caption}>
                                {photo.caption}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    photo={portfolio.photos[lightboxIndex]}
                    isOpen={true}
                    onClose={closeLightbox}
                    onNext={() => navigateLightbox('next')}
                    onPrev={() => navigateLightbox('prev')}
                />
            )}
        </main>
    );
}
