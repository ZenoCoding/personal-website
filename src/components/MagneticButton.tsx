'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './MagneticButton.module.css';

interface MagneticButtonProps {
    children: React.ReactNode;
    strength?: number; // How strong the pull is. Higher = moves further.
    range?: number; // Distance in pixels to trigger magnitude
}

const MagneticButton = ({ children, strength = 10, range = 200 }: MagneticButtonProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!ref.current) return;

            const { clientX, clientY } = e;
            const { left, top, width, height } = ref.current.getBoundingClientRect();

            const centerX = left + width / 2;
            const centerY = top + height / 2;

            const dist = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));

            if (dist < range) {
                const deltaX = (clientX - centerX) / width;
                const deltaY = (clientY - centerY) / height;

                // Strength decreases as distance increases
                const attenuation = 1 - (dist / range);

                setPosition({
                    x: deltaX * strength * attenuation,
                    y: deltaY * strength * attenuation,
                });
            } else {
                setPosition({ x: 0, y: 0 });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [strength, range]);

    return (
        <div
            ref={ref}
            className={styles.magnetic}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: position.x === 0 ? 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'transform 0.1s linear'
            }}
        >
            {children}
        </div>
    );
};

export default MagneticButton;
