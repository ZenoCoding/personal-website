"use client";

import { useEffect, useRef } from 'react';

const SpacetimeGrid = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const targetMouseRef = useRef({ x: 0, y: 0 });
    const currentMouseRef = useRef({ x: 0, y: 0 });
    const initializedRef = useRef(false);

    // Animation State
    const expansionRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let time = 0;

        // Initialize at center
        if (!initializedRef.current) {
            targetMouseRef.current = { x: width / 2, y: height / 2 };
            currentMouseRef.current = { x: width / 2, y: height / 2 };
            initializedRef.current = true;
        }

        // Starfield
        const stars = Array.from({ length: 150 }).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5,
            opacity: Math.random() * 0.5 + 0.1,
            speed: Math.random() * 0.05 + 0.01
        }));

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        };

        const handleMouseMove = (e: MouseEvent) => {
            targetMouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();

        // ---------------------------------------------------------
        // PHYSICS ENGINE: Embedding Diagram (Z = -G/r)
        // ---------------------------------------------------------

        const GRID_SPACING = 30; // Closer lines
        const MOUSE_LERP = 0.12;

        // Camera / Projection Constants
        const FOCAL_LENGTH = 800; // Distance from "eye" to screen
        // Potential well strength
        const Z_SCALE = 25000;
        const MIN_R = 30; // Event Horizon / Clamp to prevent infinite Z

        const draw = () => {
            // physics step: inertia
            currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * MOUSE_LERP;
            currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * MOUSE_LERP;

            // ------------------------------------
            // ENTRANCE ANIMATION: Radial Expansion
            // ------------------------------------
            expansionRef.current = Math.min(expansionRef.current + 0.008, 1);
            const progress = 1 - Math.pow(1 - expansionRef.current, 3); // Cubic Ease Out
            const maxDist = Math.hypot(width, height) * 0.8 * progress; // expanded coverage
            const maxDistSq = maxDist * maxDist;
            const isFullyExpanded = expansionRef.current >= 0.99;
            const gridCenterX = width / 2;
            const gridCenterY = height / 2;

            // Clear
            ctx.fillStyle = '#0a0a16';
            ctx.fillRect(0, 0, width, height);

            // Draw Stars
            stars.forEach(star => {
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
                star.y -= star.speed;
                if (star.y < 0) star.y = height;
            });

            ctx.lineWidth = 1;

            // Creative Highlight: Radial Gradient Stroke
            const gridGradient = ctx.createRadialGradient(
                currentMouseRef.current.x, currentMouseRef.current.y, 0,
                currentMouseRef.current.x, currentMouseRef.current.y, 300
            );
            gridGradient.addColorStop(0, 'rgba(100, 200, 255, 0.3)'); // Bright Cyan Core
            gridGradient.addColorStop(1, 'rgba(70, 130, 255, 0.15)'); // Baseline grid

            ctx.strokeStyle = gridGradient;

            // OVERSCAN: Draw extra columns/rows off-screen
            const buffer = 15;
            const cols = Math.ceil(width / GRID_SPACING) + buffer * 2;
            const rows = Math.ceil(height / GRID_SPACING) + buffer * 2;

            // 3D Projection Engine
            const project = (gx: number, gy: number) => {
                const dx = gx - currentMouseRef.current.x;
                const dy = gy - currentMouseRef.current.y;
                const r = Math.sqrt(dx * dx + dy * dy);

                const noise = Math.sin(gx * 0.003 + gy * 0.003 + time) * 10;
                let z = -(Z_SCALE / (r + MIN_R)) + noise;

                const scale = FOCAL_LENGTH / (FOCAL_LENGTH - z);

                // MOUSE + OFFSET (+300px)
                const centerX = currentMouseRef.current.x;
                const centerY = currentMouseRef.current.y + 300;

                const camX = gx - centerX;
                const camY = gy - centerY;

                const screenX = camX * scale + centerX;
                const screenY = camY * scale + centerY;

                return { x: screenX, y: screenY };
            };

            ctx.beginPath();

            // Draw Vertical Lines
            for (let i = 0; i < cols; i++) {
                // Offset start by buffer
                const gx = (i - buffer) * GRID_SPACING;
                let penDown = false;

                // Overscan vertical bounds
                for (let j = -200; j <= height + 200; j += 10) {
                    // Expansion check
                    if (!isFullyExpanded) {
                        const dx = gx - gridCenterX;
                        const dy = j - gridCenterY;
                        if (dx * dx + dy * dy > maxDistSq) {
                            penDown = false;
                            continue;
                        }
                    }

                    const point = project(gx, j);
                    if (!penDown) {
                        ctx.moveTo(point.x, point.y);
                        penDown = true;
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
            }

            // Draw Horizontal Lines
            for (let j = 0; j < rows; j++) {
                // Offset start by buffer
                const gy = (j - buffer) * GRID_SPACING;
                let penDown = false;

                // Overscan horizontal bounds
                for (let i = -200; i <= width + 200; i += 10) {
                    if (!isFullyExpanded) {
                        const dx = i - gridCenterX;
                        const dy = gy - gridCenterY;
                        if (dx * dx + dy * dy > maxDistSq) {
                            penDown = false;
                            continue;
                        }
                    }

                    const point = project(i, gy);
                    if (!penDown) {
                        ctx.moveTo(point.x, point.y);
                        penDown = true;
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
            }

            ctx.stroke();

            // Vignette
            const gradient = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width);
            gradient.addColorStop(0, 'rgba(5, 5, 16, 0.0)');
            gradient.addColorStop(1, 'rgba(5, 5, 16, 0.95)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            time += 0.015;
            requestAnimationFrame(draw);
        };

        const animationId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
            }}
        />
    );
};

export default SpacetimeGrid;
