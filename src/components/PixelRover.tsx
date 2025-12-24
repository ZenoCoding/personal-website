'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './PixelRover.module.css';

type Mode = 'idle' | 'patrol' | 'sleep' | 'investigate' | 'scan' | 'bump' | 'turning' | 'recoil' | 'held';

interface Track {
    id: string;
    x: number;
    y: number;
    angle: number;
}

interface RadarPing {
    id: string;
    x: number;
    y: number;
}

export default function PixelRover() {
    // Refs for Physics State (avoid re-renders for 60fps logic)
    const pos = useRef({ x: 50, y: 50 });
    const vel = useRef({ v: 0, angle: 0 }); // speed, heading (degrees)
    const target = useRef<{ x: number, y: number } | null>(null);
    const mode = useRef<Mode>('idle');
    const containerRef = useRef<HTMLDivElement>(null);
    const roverRef = useRef<HTMLDivElement>(null);

    // React State for rendering non-physics UI
    const [uiMode, setUiMode] = useState<Mode>('idle');
    const [tracks, setTracks] = useState<Track[]>([]);
    const [radarPings, setRadarPings] = useState<RadarPing[]>([]);
    const frameId = useRef<number>(0);
    const lastTrackTime = useRef<number>(0);
    const bumpUntil = useRef<number>(0);
    const mousePos = useRef({ x: 0, y: 0 });
    const collisionAngle = useRef<number>(0);
    const radarAngle = useRef<number>(0);
    const lastPingTime = useRef<number>(0);

    // Helpers
    const setMode = (m: Mode) => {
        mode.current = m;
        setUiMode(m);
    };

    const pickTarget = () => {
        if (!containerRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;
        const padding = 40;
        const x = Math.max(padding, Math.random() * (clientWidth - padding));
        const y = Math.max(padding, Math.random() * (clientHeight - padding));
        target.current = { x, y };
    };

    // Physics Loop
    useEffect(() => {
        let obstacles: DOMRect[] = [];

        // Cache obstacles occasionally (or just once if static)
        const updateObstacles = () => {
            if (!containerRef.current) return;
            const parent = containerRef.current.parentElement; // should be footer
            if (parent) {
                const els = parent.querySelectorAll('[data-obstacle="true"]');
                const containerRect = containerRef.current.getBoundingClientRect();
                obstacles = Array.from(els).map(el => {
                    const r = el.getBoundingClientRect();
                    // Convert to relative coords in container
                    return {
                        left: r.left - containerRect.left,
                        top: r.top - containerRect.top,
                        right: r.right - containerRect.left,
                        bottom: r.bottom - containerRect.top,
                        width: r.width,
                        height: r.height,
                        x: r.x, y: r.y, toJSON: () => { }
                    } as DOMRect;
                });
            }
        };

        // Update obstacles on mount and resize
        updateObstacles();
        window.addEventListener('resize', updateObstacles);

        const loop = (time: number) => {
            if (!containerRef.current || !roverRef.current) {
                frameId.current = requestAnimationFrame(loop);
                return;
            }

            const { clientWidth, clientHeight } = containerRef.current;
            const m = mode.current;

            // Skip physics when held by user
            if (m === 'held') {
                frameId.current = requestAnimationFrame(loop);
                return;
            }

            // --- BEHAVIOR TREE ---

            if (m === 'idle') {
                if (Math.random() < 0.005) {
                    setMode('patrol');
                    pickTarget();
                } else if (Math.random() < 0.001) {
                    setMode('sleep');
                }
            }
            else if (m === 'sleep') {
                if (Math.random() < 0.002) setMode('idle');
            }
            else if (m === 'bump') {
                // Pause and shake - wait until bumpUntil, then start recoil
                if (time > bumpUntil.current) {
                    // Start gradual recoil backwards
                    vel.current.v = 12; // Store remaining recoil distance
                    setMode('recoil');
                }
            }
            else if (m === 'recoil') {
                // Gradually move backwards
                const recoilSpeed = 1.5; // pixels per frame backwards
                const rad = (vel.current.angle - 90) * (Math.PI / 180);

                pos.current.x -= Math.cos(rad) * recoilSpeed;
                pos.current.y -= Math.sin(rad) * recoilSpeed;
                vel.current.v -= recoilSpeed;

                if (vel.current.v <= 0) {
                    // Done recoiling - turn AWAY from where we hit
                    // collisionAngle stores the angle TOWARD the obstacle
                    // So we want to turn to face roughly opposite (±45° for variety)
                    const awayAngle = collisionAngle.current + 180;
                    const turnVariation = (Math.random() - 0.5) * 90; // ±45°
                    vel.current.v = awayAngle + turnVariation;
                    setMode('turning');
                }
            }
            else if (m === 'turning') {
                // Gradually rotate to the target angle stored in vel.v
                const targetAngle = vel.current.v;
                let da = targetAngle - vel.current.angle;
                while (da > 180) da -= 360;
                while (da < -180) da += 360;

                const turnSpeed = 4; // degrees per frame
                if (Math.abs(da) < turnSpeed) {
                    vel.current.angle = targetAngle;
                    setMode('patrol');
                    pickTarget();
                } else {
                    vel.current.angle += Math.sign(da) * turnSpeed;
                }
            }
            else if (m === 'patrol' || m === 'investigate') {
                // Pure wander - no target, just random angle changes
                const wander = (Math.random() - 0.5) * 2; // ±1 degree drift per frame
                vel.current.angle += wander;

                // Move with variable speed (like bumpy terrain)
                const baseSpeed = 0.7;
                const speedVariation = Math.random() * 0.4;
                const speed = baseSpeed + speedVariation;
                const rad = (vel.current.angle - 90) * (Math.PI / 180);

                let nextX = pos.current.x + Math.cos(rad) * speed;
                let nextY = pos.current.y + Math.sin(rad) * speed;

                // Wall Collision - simple reflection, no bump needed
                const p = 25;
                if (nextX < p) {
                    nextX = p;
                    vel.current.angle = -vel.current.angle + (Math.random() * 30 - 15);
                } else if (nextX > clientWidth - p) {
                    nextX = clientWidth - p;
                    vel.current.angle = -vel.current.angle + (Math.random() * 30 - 15);
                }
                if (nextY < p) {
                    nextY = p;
                    vel.current.angle = 180 - vel.current.angle + (Math.random() * 30 - 15);
                } else if (nextY > clientHeight - p) {
                    nextY = clientHeight - p;
                    vel.current.angle = 180 - vel.current.angle + (Math.random() * 30 - 15);
                }

                // Obstacle Collision (skip if in grace period)
                let collided = false;
                if (time > bumpUntil.current) {
                    for (const obs of obstacles) {
                        const buffer = 5; // Tighter collision detection
                        if (nextX > obs.left - buffer && nextX < obs.right + buffer &&
                            nextY > obs.top - buffer && nextY < obs.bottom + buffer) {

                            collided = true;
                            // Calculate angle toward obstacle center for smart turning
                            const obsCenter = { x: (obs.left + obs.right) / 2, y: (obs.top + obs.bottom) / 2 };
                            collisionAngle.current = Math.atan2(obsCenter.y - pos.current.y, obsCenter.x - pos.current.x) * (180 / Math.PI) + 90;
                            bumpUntil.current = time + 500;
                            setMode('bump');
                            break;
                        }
                    }
                }

                if (!collided) {
                    pos.current.x = nextX;
                    pos.current.y = nextY;

                    // Tracks
                    if (time - lastTrackTime.current > 30) {
                        setTracks(prev => {
                            const next = [...prev, { id: `${time}-${nextX}-${nextY}`, x: nextX, y: nextY, angle: vel.current.angle }];
                            if (next.length > 50) return next.slice(next.length - 50);
                            return next;
                        });
                        lastTrackTime.current = time;
                    }
                }

                // Random chance to stop and scan
                if (Math.random() < 0.001) {
                    setMode('scan');
                }
            }
            else if (m === 'scan') {
                // Update radar angle (2.5s per rotation = 144 deg/sec = ~2.4 deg/frame at 60fps)
                radarAngle.current = (radarAngle.current + 2.4) % 360;

                // Check if radar sweep hits any obstacle
                const radarRange = 60; // 60px radius
                const radarRad = (radarAngle.current - 90) * (Math.PI / 180);
                const sweepEndX = pos.current.x + Math.cos(radarRad) * radarRange;
                const sweepEndY = pos.current.y + Math.sin(radarRad) * radarRange;

                // Line-box intersection check for each obstacle
                if (time - lastPingTime.current > 30) {
                    for (const obs of obstacles) {
                        if (sweepEndX > obs.left && sweepEndX < obs.right &&
                            sweepEndY > obs.top && sweepEndY < obs.bottom) {
                            const pingId = `ping-${time}-${sweepEndX.toFixed(0)}-${sweepEndY.toFixed(0)}`;
                            setRadarPings(prev => {
                                const newPings = [...prev, { id: pingId, x: sweepEndX, y: sweepEndY }];
                                if (newPings.length > 100) return newPings.slice(-100);
                                return newPings;
                            });
                            lastPingTime.current = time;
                            break;
                        }
                    }
                }

                // Clean up old pings only every 500ms to reduce re-renders
                if (time % 500 < 20) {
                    setRadarPings(prev => prev.filter(p => {
                        const pingTime = parseInt(p.id.split('-')[1]);
                        return time - pingTime < 1500;
                    }));
                }

                // Scan for at least 3 full rotations (7.5s), then exit
                if (radarAngle.current > 360 * 3) {
                    setMode('patrol');
                    radarAngle.current = 0;
                    setRadarPings([]); // Clear pings when done
                }
            }

            roverRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) rotate(${vel.current.angle}deg)`;
            frameId.current = requestAnimationFrame(loop);
        };

        frameId.current = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(frameId.current);
            window.removeEventListener('resize', updateObstacles);
        };
    }, []);

    // Interactions
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (mode.current === 'held') {
            // Place the rover down with brief immunity
            bumpUntil.current = performance.now() + 500; // Grace period after placing
            setMode('idle');
        } else {
            // Pick up the rover
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            setMode('held');
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (mode.current === 'held') {
            // Follow cursor when held
            mousePos.current = { x: mx, y: my };
            pos.current.x = mx;
            pos.current.y = my;
            if (roverRef.current) {
                roverRef.current.style.transform = `translate(${mx}px, ${my}px) rotate(${vel.current.angle}deg)`;
            }
        }
        // Removed investigate behavior - it was causing unexpected mode changes
    };

    const handleMouseLeave = (e: React.MouseEvent) => {
        // Only drop if we're actually leaving the container, not just moving to a child element
        if (mode.current === 'held' && e.relatedTarget && !containerRef.current?.contains(e.relatedTarget as Node)) {
            bumpUntil.current = performance.now() + 500; // Grace period after dropping
            setMode('patrol');
        }
    };

    // Calculate segments for rendering
    // Wheel offset from center. Rover is 32px wide? wheels at roughly +/- 8px
    const wheelOffset = 10;

    // Convert track points to line segments
    const renderTrackSegments = () => {
        if (tracks.length < 2) return null;

        return tracks.map((pt, i) => {
            if (i === 0) return null;
            const prev = tracks[i - 1];

            // Calculate Vector perpendicular to heading
            // Heading is angle - 90 (since UP is 0 in code logic? or wait, 0 is right in Trig)
            // Code uses: (angle - 90) * PI/180

            const getWheelPos = (p: { x: number, y: number, angle: number }, offset: number) => {
                const rad = (p.angle - 90) * (Math.PI / 180);
                const perp = rad + Math.PI / 2; // +90 deg
                return {
                    x: p.x + 16 + Math.cos(perp) * offset, // +16 because x/y is top-left of 32x32 div?
                    y: p.y + 16 + Math.sin(perp) * offset
                };
            };

            const pL = getWheelPos(prev, -wheelOffset);
            const pR = getWheelPos(prev, wheelOffset);
            const cL = getWheelPos(pt, -wheelOffset);
            const cR = getWheelPos(pt, wheelOffset);

            // Opacity fades based on index
            const alpha = (i / tracks.length) * 0.3; // max opacity 0.3

            return (
                <g key={pt.id} stroke="var(--color-text-secondary)" strokeOpacity={alpha} strokeWidth="2" strokeLinecap="round">
                    <line x1={pL.x} y1={pL.y} x2={cL.x} y2={cL.y} />
                    <line x1={pR.x} y1={pR.y} x2={cR.x} y2={cR.y} />
                </g>
            );
        });
    };

    return (
        <div ref={containerRef} className={styles.container} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <svg className={styles.trackSvg}>
                {renderTrackSegments()}
            </svg>

            {/* Radar pings - lidar dots */}
            {radarPings.map(ping => (
                <div
                    key={ping.id}
                    className={styles.radarPing}
                    style={{
                        left: ping.x - 2,
                        top: ping.y - 2
                    }}
                />
            ))}

            <div
                ref={roverRef}
                className={`${styles.roverWrapper} ${uiMode === 'patrol' || uiMode === 'investigate' ? styles.moving : ''} ${uiMode === 'scan' ? styles.scanning : ''} ${uiMode === 'bump' ? styles.bumping : ''} ${uiMode === 'held' ? styles.held : ''}`}
                onClick={handleClick}
            >
                <div className={styles.roverBody}>
                    <div className={styles.rover} />
                    <div className={styles.radar} />

                    {uiMode === 'sleep' && (
                        <>
                            <div className={styles.zzz}>z</div>
                            <div className={styles.zzz}>z</div>
                            <div className={styles.zzz}>z</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
