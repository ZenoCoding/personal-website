'use client';

import { useState } from 'react';
import { portfolio } from '@/data/portfolio';
import styles from './photos.module.css';
import Lightbox from '@/components/Lightbox';

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
                <h1 className={styles.title}>Through the Lens</h1>
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
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={photo.url}
                                    alt={photo.caption}
                                    className={styles.image}
                                    loading="lazy"
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
