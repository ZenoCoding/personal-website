'use client';

import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import './prism-theme.css';
import styles from './Intake.module.css';

interface CodeBlockProps {
    children: string;
    language?: string;
}

export default function CodeBlock({ children, language = 'java' }: CodeBlockProps) {
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current);
        }
    }, [children]);

    return (
        <pre className={styles.codeBlock}>
            <code ref={codeRef} className={`language-${language}`}>
                {children}
            </code>
        </pre>
    );
}
