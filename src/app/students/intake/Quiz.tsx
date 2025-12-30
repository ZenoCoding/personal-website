'use client';

import { useState } from 'react';
import styles from './Quiz.module.css';

interface QuizOption {
    text: string;
    correct?: boolean;
}

interface QuizProps {
    question: string;
    options: QuizOption[];
    explanation?: string;
}

export default function Quiz({ question, options, explanation }: QuizProps) {
    const [selected, setSelected] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSelect = (index: number) => {
        if (!submitted) {
            setSelected(index);
        }
    };

    const handleSubmit = () => {
        if (selected !== null) {
            setSubmitted(true);
        }
    };

    const handleReset = () => {
        setSelected(null);
        setSubmitted(false);
    };

    const isCorrect = selected !== null && options[selected]?.correct;

    return (
        <div className={styles.quiz}>
            <div className={styles.header}>
                <span className={styles.icon}>🧠</span>
                <span className={styles.label}>Quick Check</span>
            </div>
            <p className={styles.question}>{question}</p>
            <div className={styles.options}>
                {options.map((option, index) => (
                    <button
                        key={index}
                        className={`${styles.option} ${selected === index ? styles.selected : ''
                            } ${submitted && option.correct ? styles.correct : ''
                            } ${submitted && selected === index && !option.correct ? styles.incorrect : ''
                            }`}
                        onClick={() => handleSelect(index)}
                        disabled={submitted}
                    >
                        <span className={styles.optionLetter}>
                            {String.fromCharCode(65 + index)}
                        </span>
                        {option.text}
                    </button>
                ))}
            </div>
            {!submitted ? (
                <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={selected === null}
                >
                    Check Answer
                </button>
            ) : (
                <div className={styles.result}>
                    <div className={`${styles.resultBanner} ${isCorrect ? styles.success : styles.failure}`}>
                        {isCorrect ? '✓ Correct!' : '✗ Not quite'}
                    </div>
                    {explanation && (
                        <p className={styles.explanation}>{explanation}</p>
                    )}
                    <button className={styles.resetBtn} onClick={handleReset}>
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
}
