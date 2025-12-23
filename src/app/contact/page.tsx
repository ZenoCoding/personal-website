'use client';

import { useState } from 'react';
import styles from './contact.module.css';
import { portfolio } from '@/data/portfolio';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = `Portfolio Contact from ${formData.name}`;
        const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
        window.location.href = `mailto:${portfolio.personalInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    return (
        <main className={styles.main}>
            <div className="container">
                <h1 className={styles.title}>Get In Touch</h1>
                <p className={styles.subtitle}>
                    Have a project in mind or just want to say hi? I&apos;m always open to discussing new opportunities.
                </p>

                <div className={styles.content}>
                    <div className={`${styles.card} glass`}>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.group}>
                                <label htmlFor="name" className={styles.label}>Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    className={styles.input}
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.group}>
                                <label htmlFor="email" className={styles.label}>Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className={styles.input}
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.group}>
                                <label htmlFor="message" className={styles.label}>Message</label>
                                <textarea
                                    id="message"
                                    className={styles.textarea}
                                    rows={5}
                                    placeholder="How can I help you?"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className={styles.button}>Send Message</button>
                        </form>
                    </div>

                    <div className={styles.info}>
                        <p className={styles.email}>
                            Prefer email? <a href={`mailto:${portfolio.personalInfo.email}`} className={styles.link}>{portfolio.personalInfo.email}</a>
                        </p>
                        <div className={styles.socials}>
                            <a href={portfolio.socials.github} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>GitHub</a>
                            <span className={styles.separator}>/</span>
                            <a href={portfolio.socials.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>LinkedIn</a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
