"use client";

import { useEffect, useRef } from 'react';

const SpacetimeGrid = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        const pointer = { x: width / 2, y: height / 2, active: false, pressed: false };
        let pressure = 0;
        let expansion = 0;
        let previousTime = 0;
        let animationId = 0;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

        const handlePointerMove = (event: PointerEvent) => {
            pointer.x = event.clientX;
            pointer.y = event.clientY;
            pointer.active = true;
        };
        const handlePointerDown = (event: PointerEvent) => {
            handlePointerMove(event);
            pointer.pressed = true;
        };
        const handlePointerUp = (event: PointerEvent) => {
            pointer.pressed = false;
            if (event.pointerType === 'touch') pointer.active = false;
        };
        const releasePointer = () => {
            pointer.active = false;
            pointer.pressed = false;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', releasePointer);
        window.addEventListener('blur', releasePointer);
        document.documentElement.addEventListener('pointerleave', releasePointer);
        resize();

        const GRID_SPACING = 30;
        const FOCAL_LENGTH = 800;
        const WELL_STRENGTH = 25000;
        const CORE_RADIUS = 30;

        // Helper to get CSS variable color
        const getComputedColor = (varName: string) => {
            return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        };

        const draw = (timestamp: number) => {
            const dt = previousTime ? Math.min((timestamp - previousTime) / 1000, 0.05) : 1 / 60;
            previousTime = timestamp;
            const targetPressure = pointer.active ? (pointer.pressed ? 1.2 : 1) : 0;
            // The contact point follows the pointer exactly; only depth eases in and out.
            pressure = reducedMotion.matches
                ? targetPressure
                : pressure + (targetPressure - pressure) * (1 - Math.exp(-dt * 12));

            expansion = reducedMotion.matches ? 1 : Math.min(expansion + dt * 0.48, 1);
            const progress = 1 - Math.pow(1 - expansion, 3); // Cubic Ease Out
            const maxDist = Math.hypot(width, height) * 0.8 * progress; // expanded coverage
            const maxDistSq = maxDist * maxDist;
            const isFullyExpanded = expansion >= 0.99;
            const gridCenterX = width / 2;
            const gridCenterY = height / 2;

            const bgPrimary = getComputedColor('--grid-bg');
            const starColor = getComputedColor('--grid-star');
            const gridLineColor = getComputedColor('--grid-line');
            const gridWahoColor = getComputedColor('--grid-line-waho'); // "Wormhole" / Gradient core
            const vignetteColor = getComputedColor('--color-bg-primary'); // Use primary bg for vignette fade

            // Clear
            ctx.fillStyle = bgPrimary; // Use grid specific background
            ctx.fillRect(0, 0, width, height);

            // Draw Stars
            stars.forEach(star => {
                // Parse rgb/rgba to apply star opacity override
                // Simplified: just assume starColor is rgba-able or uses CSS var
                // We'll trust the CSS variable to be a full color
                ctx.fillStyle = starColor;
                ctx.globalAlpha = star.opacity; // Combine with CSS opacity?
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;

                star.y -= star.speed;
                if (star.y < 0) star.y = height;
            });

            ctx.lineWidth = 1;

            // Creative Highlight: Radial Gradient Stroke
            const gridGradient = ctx.createRadialGradient(
                pointer.x, pointer.y, 0,
                pointer.x, pointer.y, 300
            );
            gridGradient.addColorStop(0, pressure > 0.01 ? gridWahoColor : gridLineColor);
            gridGradient.addColorStop(1, gridLineColor);

            ctx.strokeStyle = gridGradient;

            // OVERSCAN: Draw extra columns/rows off-screen
            const buffer = 15;
            const cols = Math.ceil(width / GRID_SPACING) + buffer * 2;
            const rows = Math.ceil(height / GRID_SPACING) + buffer * 2;

            // Center both the well and its projection on the cursor so the
            // entire depression stays concentric with the point of contact.
            const wellX = pointer.x;
            const wellY = pointer.y;
            const cameraX = wellX;
            const cameraY = wellY;

            const project = (gx: number, gy: number) => {
                const distance = Math.hypot(gx - wellX, gy - wellY);
                const z = -WELL_STRENGTH * pressure / (distance + CORE_RADIUS);
                const scale = FOCAL_LENGTH / (FOCAL_LENGTH - z);

                return {
                    x: cameraX + (gx - cameraX) * scale,
                    y: cameraY + (gy - cameraY) * scale,
                };
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
            gradient.addColorStop(0, 'rgba(0,0,0,0)'); // Completely transparent center
            gradient.addColorStop(1, vignetteColor); // Fade to actual BG color

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            animationId = requestAnimationFrame(draw);
        };

        animationId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', releasePointer);
            window.removeEventListener('blur', releasePointer);
            document.documentElement.removeEventListener('pointerleave', releasePointer);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                transition: 'background 0.5s ease', // Smooth transition for canvas bg
            }}
        />
    );
};

export default SpacetimeGrid;
