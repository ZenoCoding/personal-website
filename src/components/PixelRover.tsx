'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './PixelRover.module.css';

type Mode = 'idle' | 'patrol' | 'sleep' | 'investigate' | 'scan' | 'bump' | 'turning' | 'recoil' | 'held';

interface Track {
    id: string;
    x: number;
    y: number;
    angle: number;
    createdAt: number;
}

interface RadarBeam {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    angle: number;
    createdAt: number;
}

interface RadarPing {
    id: string;
    x: number;
    y: number;
    createdAt: number;
}

export default function PixelRover() {
    // Refs for Physics State (avoid re-renders for 60fps logic)
    const pos = useRef({ x: 50, y: 50 });
    const vel = useRef({ v: 0, angle: 0 }); // speed, heading (degrees)
    const target = useRef<{ x: number, y: number } | null>(null);
    const mode = useRef<Mode>('idle');
    const containerRef = useRef<HTMLDivElement>(null);
    const roverRef = useRef<HTMLDivElement>(null);

    const radarRef = useRef<HTMLDivElement>(null);
    const laserRef = useRef<HTMLDivElement>(null);

    // React State for rendering non-physics UI
    const [uiMode, setUiMode] = useState<Mode>('idle');
    const [tracks, setTracks] = useState<Track[]>([]);
    const [radarPings, setRadarPings] = useState<RadarPing[]>([]);
    // Store last ~30 beams for visual trail
    const [radarBeams, setRadarBeams] = useState<RadarBeam[]>([]);
    const frameId = useRef<number>(0);
    const lastTrackTime = useRef<number>(0);
    const bumpUntil = useRef<number>(0);
    const mousePos = useRef({ x: -9999, y: -9999 });
    const collisionAngle = useRef<number>(0);
    const radarAngle = useRef<number>(0);
    const scanProgress = useRef<number>(0);
    const lastPingTime = useRef<number>(0);
    const obstaclesRef = useRef<DOMRect[]>([]);
    const radarPingsRef = useRef<RadarPing[]>([]); // Synced ref for physics loop
    const collisionHistory = useRef<number[]>([]); // Track recent bumps for frustration scan
    const telemetryRef = useRef<HTMLDivElement>(null); // Direct DOM manipulation for stats
    const battery = useRef<number>(100); // Stateful battery level

    // Debug State
    const [debug, setDebug] = useState(false); // Toggle to show bounding boxes
    const [debugObstacles, setDebugObstacles] = useState<DOMRect[]>([]);

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

        // Cache obstacles occasionally (or just once if static)
        const updateObstacles = () => {
            if (!containerRef.current) return;
            const parent = containerRef.current.parentElement; // should be footer
            if (parent) {
                const els = parent.querySelectorAll('[data-obstacle="true"]');
                const containerRect = containerRef.current.getBoundingClientRect();
                const obsList = Array.from(els).map(el => {
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
                obstaclesRef.current = obsList;
                setDebugObstacles(obsList);
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

            if (m === 'sleep') {
                // Recharging (Slow)
                battery.current = Math.min(100, battery.current + 0.1); // +0.1% per frame (~16s to 100)

                // Wake up when full
                if (battery.current >= 100) {
                    setMode('patrol');
                    pickTarget();
                }

                // Hide Laser
                if (laserRef.current) laserRef.current.style.opacity = '0';
            }
            else if (m === 'idle') {
                // Mouse Check
                // const dx = mousePos.current.x - pos.current.x;
                // const dy = mousePos.current.y - pos.current.y;
                // const dist = Math.sqrt(dx * dx + dy * dy);
                // if (dist < 150 && battery.current > 0) setMode('investigate');

                if (Math.random() < 0.005) {
                    setMode('patrol');
                    pickTarget();
                } else if (Math.random() < 0.001) {
                    setMode('sleep');
                }
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
                    // Done recoiling
                    const awayAngle = collisionAngle.current + 180;
                    const turnVariation = (Math.random() - 0.5) * 90; // ±45°
                    vel.current.v = awayAngle + turnVariation;
                    setMode('turning');
                }
            }
            else if (m === 'turning') {
                // Low Battery Sputter (Turning)
                let turnSpeed = 4;
                if (battery.current < 20) turnSpeed = 2; // Slower turning

                const targetAngle = vel.current.v;
                let da = targetAngle - vel.current.angle;
                while (da > 180) da -= 360;
                while (da < -180) da += 360;

                if (Math.abs(da) < turnSpeed) {
                    vel.current.angle = targetAngle;
                    setMode('patrol');
                    pickTarget();
                } else {
                    vel.current.angle += Math.sign(da) * turnSpeed;
                }
            }
            else if (m === 'patrol' || m === 'investigate') {
                // Low Battery Logic
                let speed = 0.8; // Relaxed patrol speed
                if (m === 'investigate') speed = 2.0; // Slightly faster for investigation

                if (battery.current < 20) {
                    speed *= 0.5; // Half speed
                    // Sputter/Jitter
                    if (Math.random() < 0.3) {
                        pos.current.x += (Math.random() - 0.5) * 2;
                        pos.current.y += (Math.random() - 0.5) * 2;
                    }
                }

                if (m === 'investigate') {
                    // Chase Mouse
                    const dx = mousePos.current.x - pos.current.x;
                    const dy = mousePos.current.y - pos.current.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Boredom / Loss
                    if (dist > 250 || battery.current <= 0) {
                        setMode('patrol');
                        pickTarget();
                    }
                    else if (dist < 40) {
                        // "Sniffing" - stop but look
                        speed = 0;
                    }

                    // DEBUG: Log state occasionally
                    if (Math.random() < 0.01) {
                        console.log('INVESTIGATE:', { dist, speed, mx: mousePos.current.x, my: mousePos.current.y, rx: pos.current.x, ry: pos.current.y });
                    }

                    // Steer towards mouse
                    const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                    let da = targetAngle - vel.current.angle;
                    while (da > 180) da -= 360;
                    while (da < -180) da += 360;
                    vel.current.angle += da * 0.1; // Smooth tracking

                } else {
                    // Patrol: Random Wander
                    const wander = (Math.random() - 0.5) * 2;
                    vel.current.angle += wander;

                    // Mouse Proximity Check to Switch Mode
                    // const dx = mousePos.current.x - pos.current.x;
                    // const dy = mousePos.current.y - pos.current.y;
                    // const dist = Math.sqrt(dx * dx + dy * dy);
                    // if (dist < 150 && battery.current > 0) setMode('investigate');
                }

                // Lidar Memory Avoidance
                // If we recall seeing something nearby, steer away
                if (radarPingsRef.current.length > 0) {
                    const cx = pos.current.x + 16;
                    const cy = pos.current.y + 16;
                    const avoidRadius = 60;

                    let avoidX = 0;
                    let avoidY = 0;
                    let count = 0;

                    // Check recent memory
                    for (const ping of radarPingsRef.current) {
                        const dx = cx - ping.x;
                        const dy = cy - ping.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < avoidRadius) {
                            // Sum vectors pointing AWAY from danger
                            avoidX += dx / dist; // Normalize
                            avoidY += dy / dist;
                            count++;
                        }
                    }

                    if (count > 0) {
                        // Calculate desired heading (away from obstacles)
                        // Standard angle is atan2(y, x) * 180/PI + 90 (since 0 is up)
                        const avoidAngle = Math.atan2(avoidY, avoidX) * (180 / Math.PI) + 90;

                        // Smoothly steer towards safety
                        let da = avoidAngle - vel.current.angle;
                        while (da > 180) da -= 360;
                        while (da < -180) da += 360;

                        // Steer stronger if closer/more danger
                        vel.current.angle += da * 0.1; // 10% steer per frame
                    }
                }

                // Move with variable speed (like bumpy terrain)
                const rad = (vel.current.angle - 90) * (Math.PI / 180);

                let nextX = pos.current.x + Math.cos(rad) * speed;
                let nextY = pos.current.y + Math.sin(rad) * speed;

                // Wall Collision - Center based (Radius 12 - 24px body)
                const wallBuffer = 0; // Tighter walls

                // Check centers
                // If the div is 32x32, center is ALWAYS +16.
                // Physics body is smaller, but usually centered in the 32x32 div.
                // So cx is STILL nextX + 16. The LIMIT changes because the body is smaller.

                const visualCenter = 16;
                const physicsR = 12;

                const cx_world = nextX + visualCenter;
                const cy_world = nextY + visualCenter;

                // Check against walls using physics radius
                if (cx_world < physicsR) {
                    nextX = physicsR - visualCenter; // push back
                    vel.current.angle = -vel.current.angle + (Math.random() * 30 - 15);
                } else if (cx_world > clientWidth - physicsR) {
                    nextX = clientWidth - physicsR - visualCenter;
                    vel.current.angle = -vel.current.angle + (Math.random() * 30 - 15);
                }

                if (cy_world < physicsR) {
                    nextY = physicsR - visualCenter;
                    vel.current.angle = 180 - vel.current.angle + (Math.random() * 30 - 15);
                } else if (cy_world > clientHeight - physicsR) {
                    nextY = clientHeight - physicsR - visualCenter;
                    vel.current.angle = 180 - vel.current.angle + (Math.random() * 30 - 15);
                }

                // Obstacle Collision (skip if in grace period)
                let collided = false;
                if (time > bumpUntil.current) {
                    for (const obs of obstaclesRef.current) {
                        const buffer = 4; // Tighter object buffer
                        // Hitbox is center +/- (radius + buffer)

                        if (cx_world > obs.left - (physicsR + buffer) && cx_world < obs.right + (physicsR + buffer) &&
                            cy_world > obs.top - (physicsR + buffer) && cy_world < obs.bottom + (physicsR + buffer)) {


                            collided = true;

                            // Frustration Scan Logic
                            // Record this collision
                            collisionHistory.current.push(time);
                            // Keep only recent (last 8s)
                            collisionHistory.current = collisionHistory.current.filter(t => time - t < 8000);

                            // If bumped 3 times recently, stop and look
                            if (collisionHistory.current.length >= 3) {
                                collisionHistory.current = []; // Clear frustration
                                setMode('scan');
                                break;
                            }

                            // Calculate angle toward obstacle center for smart turning
                            const obsCenter = { x: (obs.left + obs.right) / 2, y: (obs.top + obs.bottom) / 2 };
                            collisionAngle.current = Math.atan2(obsCenter.y - pos.current.y, obsCenter.x - obsCenter.x) * (180 / Math.PI) + 90;
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
                            const next = [...prev, {
                                id: `${time}-${nextX}-${nextY}`,
                                x: nextX,
                                y: nextY,
                                angle: vel.current.angle,
                                createdAt: time
                            }];
                            return next; // Don't slice here, cleanup in loop
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
                const rotSpeed = 2.4;
                radarAngle.current = (radarAngle.current + rotSpeed) % 360;
                scanProgress.current += rotSpeed;

                // Sync Visual Radar
                if (radarRef.current) {
                    radarRef.current.style.transform = `translate(-50%, -50%) rotate(${radarAngle.current}deg)`;
                }

                // Raycasting Logic
                const range = 100; // Increased range
                // Include rover's heading in the logic because the radar is a child of the rotated rover
                const angleRad = (vel.current.angle + radarAngle.current - 90) * (Math.PI / 180);
                // Offset start to center of rover (32x32 div, so +16)
                const start = { x: pos.current.x + 16, y: pos.current.y + 16 };
                const end = {
                    x: start.x + Math.cos(angleRad) * range,
                    y: start.y + Math.sin(angleRad) * range
                };

                // Define all collidable lines (Walls + Obstacles)
                // Format: {x1, y1, x2, y2}
                const lines: { x1: number, y1: number, x2: number, y2: number }[] = [];

                // 1. Add Container Walls
                // Top
                lines.push({ x1: 0, y1: 0, x2: clientWidth, y2: 0 });
                // Bottom
                lines.push({ x1: 0, y1: clientHeight, x2: clientWidth, y2: clientHeight });
                // Left
                lines.push({ x1: 0, y1: 0, x2: 0, y2: clientHeight });
                // Right
                lines.push({ x1: clientWidth, y1: 0, x2: clientWidth, y2: clientHeight });

                // 2. Add Obstacles (as 4 lines each)
                obstaclesRef.current.forEach(obs => {
                    const pad = 2; // Slight padding so points appear on surface
                    lines.push({ x1: obs.left - pad, y1: obs.top - pad, x2: obs.right + pad, y2: obs.top - pad }); // Top
                    lines.push({ x1: obs.right + pad, y1: obs.top - pad, x2: obs.right + pad, y2: obs.bottom + pad }); // Right
                    lines.push({ x1: obs.right + pad, y1: obs.bottom + pad, x2: obs.left - pad, y2: obs.bottom + pad }); // Bottom
                    lines.push({ x1: obs.left - pad, y1: obs.bottom + pad, x2: obs.left - pad, y2: obs.top - pad }); // Left
                });

                // Helper: Line-Line Intersection
                const getIntersection = (p0: { x: number, y: number }, p1: { x: number, y: number },
                    p2: { x: number, y: number }, p3: { x: number, y: number }) => {
                    const s1_x = p1.x - p0.x;
                    const s1_y = p1.y - p0.y;
                    const s2_x = p3.x - p2.x;
                    const s2_y = p3.y - p2.y;

                    const s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) / (-s2_x * s1_y + s1_x * s2_y);
                    const t = (s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) / (-s2_x * s1_y + s1_x * s2_y);

                    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
                        return {
                            x: p0.x + (t * s1_x),
                            y: p0.y + (t * s1_y),
                            dist: t * Math.sqrt(s1_x * s1_x + s1_y * s1_y) // approximate dist factor
                        };
                    }
                    return null;
                };

                // Find closest intersection
                let closestHit: { x: number, y: number, dist: number } | null = null;
                let closestDist = Infinity;

                for (const line of lines) {
                    const hit = getIntersection(start, end, { x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 });
                    if (hit) {
                        const d = (hit.x - start.x) ** 2 + (hit.y - start.y) ** 2;
                        if (d < closestDist) {
                            closestDist = d;
                            closestHit = hit;
                        }
                    }
                }

                // Update Visual Laser Length (cut short if hit)
                if (laserRef.current) {
                    // Calculate distance to draw
                    let drawDist = range;
                    if (closestHit) {
                        drawDist = Math.sqrt(closestDist);
                    }
                    // The laser is inside the rotated radar container, so we just set height/width
                    // The radar rotates, so the laser just needs to be the length of the radius
                    laserRef.current.style.height = `${drawDist}px`;
                    laserRef.current.style.opacity = '1';
                }

                // Register Beam Trail
                const beamEnd = closestHit ? closestHit : end;
                const beamId = `beam-${time}-${Math.random()}`;

                setRadarBeams(prev => {
                    const next = [...prev, {
                        id: beamId,
                        x1: start.x,
                        y1: start.y,
                        x2: beamEnd.x,
                        y2: beamEnd.y,
                        angle: angleRad,
                        createdAt: time
                    }];
                    return next; // GC handles cleanup
                });

                // Register Ping if hit
                if (closestHit) { // No throttle - every frame
                    const hit = closestHit; // Capture for closure
                    const pingId = `ping-${time}-${Math.random()}`; // Unique ID

                    setRadarPings(prev => {
                        const newPings = [...prev, { id: pingId, x: hit.x, y: hit.y, createdAt: time }];
                        radarPingsRef.current = newPings; // Sync for physics
                        return newPings; // GC handles cleanup
                    });
                    lastPingTime.current = time;
                }

                // Scan for limited time (3 full rotations = 1080 degrees)
                if (scanProgress.current > 1080) {
                    setMode('patrol');
                    scanProgress.current = 0;
                    radarAngle.current = 0;
                    if (laserRef.current) laserRef.current.style.opacity = '0';
                }
            }


            // Global Cleanup (Garbage Collection)
            // Run every ~200ms
            if (time % 200 < 20) {
                // Tracks last 4s
                setTracks(prev => {
                    if (prev.length === 0) return prev;
                    if (time - prev[0].createdAt > 4500) {
                        return prev.filter(t => time - t.createdAt < 4500);
                    }
                    return prev;
                });
                // Beams last 0.6s
                setRadarBeams(prev => {
                    if (prev.length === 0) return prev;
                    if (time - prev[0].createdAt > 1000) {
                        return prev.filter(b => time - b.createdAt < 1000);
                    }
                    return prev;
                });
                // Pings last 2s
                setRadarPings(prev => {
                    if (prev.length === 0) return prev;
                    // Sync ref
                    let next = prev;
                    if (time - prev[0].createdAt > 5000) {
                        next = prev.filter(p => time - p.createdAt < 5000);
                    }
                    radarPingsRef.current = next;
                    return next;
                });
            }



            // Update Telemetry
            if (telemetryRef.current) {
                const m = mode.current.toUpperCase();
                const x = Math.round(pos.current.x).toString().padStart(3, '0');
                const y = Math.round(pos.current.y).toString().padStart(3, '0');
                const hdg = Math.round((vel.current.angle % 360 + 360) % 360).toString().padStart(3, '0');
                const pings = radarPingsRef.current.length.toString().padStart(2, '0');
                // Battery Logic
                // Scan = High Drain (0.05 per frame ~ 3%/sec)
                // Move = Normal Drain (0.02 per frame ~ 1.2%/sec)
                // Stop = Zero Drain
                let drain = 0;
                if (m === 'SCAN') drain = 0.05;
                else if (m === 'PATROL' || m === 'INVESTIGATE' || m === 'TURNING' || m === 'BUMP') drain = 0.02;

                battery.current = Math.max(0, battery.current - drain);
                const bat = Math.floor(battery.current).toString().padStart(3, '0');

                // Trigger Sleep at 0%
                if (battery.current <= 0 && m !== 'SLEEP' && m !== 'HELD' && m !== 'IDLE') {
                    setMode('sleep');
                }

                let sysText = m;
                if (m === 'SLEEP') {
                    // Charging Bar [|||||.....]
                    const bars = Math.floor(battery.current / 10);
                    const visual = '[' + '|'.repeat(bars) + '.'.repeat(10 - bars) + ']';
                    sysText = `CHRG ${visual}`;
                } else if (battery.current < 20) {
                    // Flash Low Battery
                    if (Math.floor(time / 500) % 2 === 0) sysText = `${m} (LOW BAT)`;
                }

                telemetryRef.current.innerText = `SYS: ${sysText}\nPOS: ${x},${y}\nHDG: ${hdg}°\nLDR: ${pings}\nBAT: ${bat}%`;
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

            // Clear laser if we interrupt a scan
            if (laserRef.current) {
                laserRef.current.style.opacity = '0';
                laserRef.current.style.height = '0px';
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Always track mouse for investigation
        mousePos.current = { x: mx, y: my };

        if (mode.current === 'held') {
            // Follow cursor when held
            pos.current.x = mx;
            pos.current.y = my;
            if (roverRef.current) {
                roverRef.current.style.transform = `translate(${mx}px, ${my}px) rotate(${vel.current.angle}deg)`;
            }
        }
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

            return (
                <g key={pt.id} stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" className={styles.trackSegment}>
                    <line x1={pL.x} y1={pL.y} x2={cL.x} y2={cL.y} />
                    <line x1={pR.x} y1={pR.y} x2={cR.x} y2={cR.y} />
                </g>
            );
        });
    };

    const handleContainerClick = () => {
        if (mode.current === 'held') {
            bumpUntil.current = performance.now() + 500;
            setMode('idle');
        }
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.container} ${uiMode === 'held' ? styles.activeContainer : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleContainerClick}
        >
            <svg className={styles.trackSvg}>
                {renderTrackSegments()}
            </svg>

            <div
                ref={telemetryRef}
                className={styles.telemetry}
                onClick={(e) => {
                    e.stopPropagation();
                    setDebug(prev => !prev);
                }}
            />

            {/* Radar pings - Continuous Lines */}
            <svg className={styles.lidarSvg}>
                <defs>
                    <filter id="beam-blur">
                        <feGaussianBlur stdDeviation="2" />
                    </filter>
                </defs>

                {/* Visual Beam Trail */}
                <g filter="url(#beam-blur)">
                    {radarBeams.map((beam) => {
                        // Calculate cone vertices
                        const dx = beam.x2 - beam.x1;
                        const dy = beam.y2 - beam.y1;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        // Rotation is 2.4 deg/frame. Spread should be half that (1.2) + tiny overlap
                        const spread = 1.3 * (Math.PI / 180);

                        const pLeft = {
                            x: beam.x1 + Math.cos(beam.angle - spread) * dist,
                            y: beam.y1 + Math.sin(beam.angle - spread) * dist
                        };
                        const pRight = {
                            x: beam.x1 + Math.cos(beam.angle + spread) * dist,
                            y: beam.y1 + Math.sin(beam.angle + spread) * dist
                        };

                        return (
                            <polygon
                                key={beam.id}
                                points={`${beam.x1},${beam.y1} ${pLeft.x},${pLeft.y} ${pRight.x},${pRight.y}`}
                                fill="var(--color-accent-secondary)"
                                className={styles.beamSegment}
                                style={{ mixBlendMode: 'screen' }} // Help blending
                            />
                        );
                    })}
                </g>

                {radarPings.map((ping, i) => {
                    if (i === 0) return null;
                    const prev = radarPings[i - 1];

                    // Check for depth jump/occlusion - don't connect if points are too far apart
                    const dist = Math.sqrt(Math.pow(ping.x - prev.x, 2) + Math.pow(ping.y - prev.y, 2));
                    if (dist > 20) return null; // Break line on jumps

                    return (
                        <line
                            key={ping.id}
                            x1={prev.x}
                            y1={prev.y}
                            x2={ping.x}
                            y2={ping.y}
                            stroke="var(--color-accent-highlight)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            style={{ animation: `${styles.fadeBeam} 5s linear forwards` }}
                        />
                    );
                })}

                {/* Debug Overlays */}
                {debug && (
                    <>
                        {/* Obstacles */}
                        {debugObstacles.map((obs, i) => (
                            <rect
                                key={i}
                                x={obs.left}
                                y={obs.top}
                                width={obs.width}
                                height={obs.height}
                                fill="none"
                                stroke="cyan"
                                strokeWidth="1"
                                strokeDasharray="4 2"
                                opacity="0.5"
                            />
                        ))}
                    </>
                )}

                {/* Debug Rover Body - Syncs with physics r=12 (24x24) */}
                {debug && (
                    <rect
                        x={pos.current.x + 16 - 12} // Center (16) - Physics Radius (12)
                        y={pos.current.y + 16 - 12}
                        width="24"
                        height="24"
                        fill="none"
                        stroke="magenta"
                        strokeWidth="1"
                        transform={`rotate(${vel.current.angle}, ${pos.current.x + 16}, ${pos.current.y + 16})`}
                    />
                )}
            </svg>

            {/* Rover Debug Box (Rendered outside SVG for simplicity or inside? Inside trackSvg is easiest if it has pointer-events: none) 
                Wait, pos.current is REF, it won't re-render. 
                We need to use a synced state or just trust the roverWrapper's div? 
                Actually, let's just add a border to the roverWrapper if debug is on.
            */}

            <div
                ref={roverRef}
                className={`${styles.roverWrapper} ${uiMode === 'patrol' || uiMode === 'investigate' ? styles.moving : ''} ${uiMode === 'scan' ? styles.scanning : ''} ${uiMode === 'bump' ? styles.bumping : ''} ${uiMode === 'held' ? styles.held : ''}`}
                onClick={handleClick}
            >
                <div className={styles.roverBody}>
                    <div className={styles.rover} />
                    {/* Visual Radar Container */}
                    <div className={styles.radar} ref={radarRef}>
                        {/* The visible laser beam */}
                        <div className={styles.laser} ref={laserRef} />
                    </div>

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
