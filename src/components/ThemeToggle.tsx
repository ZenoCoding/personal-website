"use client";

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            style={{
                position: 'fixed',
                bottom: '2rem',
                left: '2rem', // Reusing the left spot of the old gravity toggle
                zIndex: 100,
                background: 'var(--color-glass)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '50%',
                width: '3rem',
                height: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                boxShadow: theme === 'light'
                    ? '0 4px 12px rgba(14, 165, 233, 0.2)'
                    : '0 4px 12px rgba(0,0,0,0.3)'
            }}
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Day Mode"}
        >
            <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                <Sun
                    size={20}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: theme === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
                        opacity: theme === 'light' ? 1 : 0,
                        transition: 'all 0.3s ease',
                        color: 'var(--color-accent-orange)'
                    }}
                />
                <Moon
                    size={20}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
                        opacity: theme === 'dark' ? 1 : 0,
                        transition: 'all 0.3s ease',
                        color: 'var(--color-accent-primary)'
                    }}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;
