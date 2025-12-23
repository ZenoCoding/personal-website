'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './lightbox.module.css';

interface Photo {
    url: string;
    caption: string;
    title?: string;
    date?: string;
    location?: string;
    details?: string;
    link?: string;
}

interface LightboxProps {
    photo: Photo;
    isOpen: boolean;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function Lightbox({ photo, isOpen, onClose, onNext, onPrev }: LightboxProps) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') onNext();
        if (e.key === 'ArrowLeft') onPrev();
    }, [isOpen, onClose, onNext, onPrev]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className={styles.content}>
                    <div className={styles.imageColumn}>
                        {/* Navigation Areas */}
                        <div className={styles.navAreaLeft} onClick={onPrev} title="Previous (Left Arrow)" />
                        <div className={styles.navAreaRight} onClick={onNext} title="Next (Right Arrow)" />

                        {/* Image */}
                        {/* Image */}
                        <div className={styles.imageContainer}>
                            <Image
                                src={photo.url}
                                alt={photo.caption}
                                className={styles.image}
                                fill
                                sizes="100vw"
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </div>
                    </div>

                    <div className={styles.infoColumn}>
                        <div>
                            <div className={styles.metaRow}>
                                <span className={styles.date}>{photo.date}</span>
                                {photo.location && (
                                    <>
                                        <span className={styles.separator}>•</span>
                                        <span className={styles.location}>{photo.location}</span>
                                    </>
                                )}
                            </div>
                            <h2 className={styles.title}>{photo.title}</h2>
                            <p className={styles.caption}>{photo.caption}</p>
                            {photo.details && (
                                <p className={styles.details}>{photo.details}</p>
                            )}
                            {photo.link && (
                                <a href={photo.link} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                                    Read Full Story
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.4rem' }}>
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </a>
                            )}
                        </div>

                        <div className={styles.controls}>
                            <button onClick={onPrev} className={styles.navBtn} aria-label="Previous">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                            <button onClick={onNext} className={styles.navBtn} aria-label="Next">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
