'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './planner.module.css';

// Types
interface TimeSlot {
    days: number[]; // 0=Sun, 1=Mon, etc.
    startTime: string; // "08:00"
    endTime: string; // "15:00"
}

interface Activity {
    id: string;
    name: string;
    color: string;
    category: 'academic' | 'extracurricular' | 'personal' | 'sleep';
    timeSlots: TimeSlot[];
    unscheduledHours?: number; // Hours per week not tied to specific times
    requiresCommute?: boolean; // If true, auto-add commute time before/after
    isFallback?: boolean; // If true, only show when no other activities are scheduled
}

// Color palette
const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16',
    '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'
];

const CATEGORIES = ['academic', 'extracurricular', 'personal', 'sleep'] as const;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am to 11pm

// Helper functions
const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const formatHour = (hour: number): string => {
    if (hour === 0 || hour === 24) return '12am';
    if (hour === 12) return '12pm';
    if (hour < 12) return `${hour}am`;
    return `${hour - 12}pm`;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export default function PlannerPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [commuteMinutes, setCommuteMinutes] = useState(20);
    const [showCommuteSettings, setShowCommuteSettings] = useState(false);
    const [showSleep, setShowSleep] = useState(true);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('planner-activities');
        if (saved) {
            try {
                setActivities(JSON.parse(saved));
            } catch { /* ignore */ }
        }
        const savedCommute = localStorage.getItem('planner-commute-minutes');
        if (savedCommute) {
            setCommuteMinutes(parseInt(savedCommute) || 20);
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('planner-activities', JSON.stringify(activities));
    }, [activities]);

    useEffect(() => {
        localStorage.setItem('planner-commute-minutes', commuteMinutes.toString());
    }, [commuteMinutes]);

    // Calculate total hours per week
    const calculateHours = useCallback((activity: Activity): number => {
        let total = activity.unscheduledHours || 0;
        for (const slot of activity.timeSlots) {
            const start = timeToMinutes(slot.startTime);
            let end = timeToMinutes(slot.endTime);
            // Handle overnight slots (e.g., 23:30 to 06:30)
            if (end <= start) {
                end += 24 * 60; // Add 24 hours
            }
            const hoursPerDay = (end - start) / 60;

            if (activity.isFallback) {
                // For fallback activities, only count days where no other activity conflicts
                let validDays = 0;
                for (const day of slot.days) {
                    const hasConflict = activities.some(other => {
                        if (other.id === activity.id || other.isFallback) return false;
                        return other.timeSlots.some(otherSlot => {
                            if (!otherSlot.days.includes(day)) return false;
                            const otherStart = timeToMinutes(otherSlot.startTime);
                            let otherEnd = timeToMinutes(otherSlot.endTime);
                            if (otherEnd <= otherStart) otherEnd += 24 * 60;
                            // Check if times overlap
                            return start < otherEnd && end > otherStart;
                        });
                    });
                    if (!hasConflict) validDays++;
                }
                total += hoursPerDay * validDays;
            } else {
                total += hoursPerDay * slot.days.length;
            }
        }
        return total;
    }, [activities]);

    // Get just the scheduled hours (excluding flexible/unscheduled)
    const getScheduledHours = useCallback((activity: Activity): number => {
        let total = 0;
        for (const slot of activity.timeSlots) {
            const start = timeToMinutes(slot.startTime);
            let end = timeToMinutes(slot.endTime);
            if (end <= start) end += 24 * 60;
            const hoursPerDay = (end - start) / 60;

            if (activity.isFallback) {
                let validDays = 0;
                for (const day of slot.days) {
                    const hasConflict = activities.some(other => {
                        if (other.id === activity.id || other.isFallback) return false;
                        return other.timeSlots.some(otherSlot => {
                            if (!otherSlot.days.includes(day)) return false;
                            const otherStart = timeToMinutes(otherSlot.startTime);
                            let otherEnd = timeToMinutes(otherSlot.endTime);
                            if (otherEnd <= otherStart) otherEnd += 24 * 60;
                            return start < otherEnd && end > otherStart;
                        });
                    });
                    if (!hasConflict) validDays++;
                }
                total += hoursPerDay * validDays;
            } else {
                total += hoursPerDay * slot.days.length;
            }
        }
        return total;
    }, [activities]);

    const totalHours = activities.reduce((sum, a) => sum + calculateHours(a), 0);
    const sleepHours = activities
        .filter(a => a.category === 'sleep')
        .reduce((sum, a) => sum + calculateHours(a), 0);
    const committedHours = totalHours - sleepHours;

    // Calculate commute blocks for a given day
    const getCommuteBlocks = useCallback((day: number): { startTime: string; endTime: string; type: 'to' | 'from' }[] => {
        const commuteBlocks: { startTime: string; endTime: string; type: 'to' | 'from' }[] = [];

        // Find all activities that require commute on this day
        const commuteSlots: { start: number; end: number }[] = [];
        for (const activity of activities) {
            if (!activity.requiresCommute) continue;
            for (const slot of activity.timeSlots) {
                if (!slot.days.includes(day)) continue;
                const start = timeToMinutes(slot.startTime);
                let end = timeToMinutes(slot.endTime);
                if (end <= start) end += 24 * 60; // overnight
                commuteSlots.push({ start, end });
            }
        }

        if (commuteSlots.length === 0) return commuteBlocks;

        // Find the earliest start and latest end
        const earliestStart = Math.min(...commuteSlots.map(s => s.start));
        const latestEnd = Math.max(...commuteSlots.map(s => s.end));

        // Add commute TO (before first activity)
        const commuteToStart = earliestStart - commuteMinutes;
        if (commuteToStart >= 0) {
            commuteBlocks.push({
                startTime: minutesToTime(commuteToStart),
                endTime: minutesToTime(earliestStart),
                type: 'to'
            });
        }

        // Add commute FROM (after last activity)
        const commuteFromEnd = latestEnd + commuteMinutes;
        if (commuteFromEnd <= 24 * 60) {
            commuteBlocks.push({
                startTime: minutesToTime(latestEnd),
                endTime: minutesToTime(commuteFromEnd),
                type: 'from'
            });
        }

        return commuteBlocks;
    }, [activities, commuteMinutes]);

    // Calculate total commute hours per week
    const commuteHoursPerWeek = useMemo(() => {
        let total = 0;
        for (let day = 0; day < 7; day++) {
            const blocks = getCommuteBlocks(day);
            for (const block of blocks) {
                const start = timeToMinutes(block.startTime);
                const end = timeToMinutes(block.endTime);
                total += (end - start) / 60;
            }
        }
        return total;
    }, [getCommuteBlocks]);

    // Calculate flex blocks to fill empty calendar spaces
    const flexBlockAssignments = useMemo(() => {
        const assignments: { day: number; hour: number; activity: Activity; minutes: number }[] = [];

        // Get activities with flex hours
        const flexActivities = activities.filter(a => (a.unscheduledHours || 0) > 0);
        if (flexActivities.length === 0) return assignments;

        // Calculate remaining flex minutes for each activity
        const remainingFlex: { [id: string]: number } = {};
        flexActivities.forEach(a => {
            remainingFlex[a.id] = (a.unscheduledHours || 0) * 60;
        });

        // Find all available slots (all hours, avoiding sleep/activities/commute)
        const availableSlots: { day: number; hour: number; available: number }[] = [];

        // Prioritize weekdays (Mon-Fri = days 1-5) over weekends
        const dayOrder = [1, 2, 3, 4, 5, 0, 6]; // Mon-Fri first, then Sun, Sat

        for (const day of dayOrder) {
            for (let hour = 0; hour < 24; hour++) { // All hours - sleep/activities are excluded by occupancy check
                const cellStart = hour * 60;
                const cellEnd = (hour + 1) * 60;

                // Check if this slot is occupied by any activity or commute
                let occupiedMinutes = 0;

                // Check scheduled activities (including overnight slots like sleep)
                for (const activity of activities) {
                    for (const slot of activity.timeSlots) {
                        if (!slot.days.includes(day)) continue;
                        const slotStart = timeToMinutes(slot.startTime);
                        const slotEnd = timeToMinutes(slot.endTime);

                        // Handle overnight slots (e.g., 22:00 to 06:30)
                        if (slotEnd <= slotStart) {
                            // Evening portion (slotStart to midnight)
                            if (slotStart < cellEnd && 24 * 60 > cellStart) {
                                const overlapStart = Math.max(slotStart, cellStart);
                                const overlapEnd = Math.min(24 * 60, cellEnd);
                                if (overlapEnd > overlapStart) {
                                    occupiedMinutes += overlapEnd - overlapStart;
                                }
                            }
                            // Morning portion (midnight to slotEnd)
                            if (0 < cellEnd && slotEnd > cellStart) {
                                const overlapStart = Math.max(0, cellStart);
                                const overlapEnd = Math.min(slotEnd, cellEnd);
                                if (overlapEnd > overlapStart) {
                                    occupiedMinutes += overlapEnd - overlapStart;
                                }
                            }
                        } else {
                            // Normal daytime slot
                            if (slotStart < cellEnd && slotEnd > cellStart) {
                                const overlapStart = Math.max(slotStart, cellStart);
                                const overlapEnd = Math.min(slotEnd, cellEnd);
                                occupiedMinutes += overlapEnd - overlapStart;
                            }
                        }
                    }
                }

                // Check commute blocks
                const commuteBlocks = getCommuteBlocks(day);
                for (const commute of commuteBlocks) {
                    const slotStart = timeToMinutes(commute.startTime);
                    const slotEnd = timeToMinutes(commute.endTime);
                    if (slotStart < cellEnd && slotEnd > cellStart) {
                        const overlapStart = Math.max(slotStart, cellStart);
                        const overlapEnd = Math.min(slotEnd, cellEnd);
                        occupiedMinutes += overlapEnd - overlapStart;
                    }
                }

                const available = 60 - Math.min(occupiedMinutes, 60);
                if (available >= 30) { // Only consider slots with at least 30min free
                    availableSlots.push({ day, hour, available });
                }
            }
        }

        // Distribute flex hours - limit per day to spread across week
        const usedPerActivityPerDay: { [key: string]: number } = {}; // "activityId-day" => minutes
        const MAX_FLEX_PER_DAY = 120; // Max 2 hours per activity per day

        // Keep making passes until no more assignments can be made
        let madeAssignment = true;
        while (madeAssignment) {
            madeAssignment = false;
            for (const activity of flexActivities) {
                if (remainingFlex[activity.id] <= 0) continue;

                for (const slot of availableSlots) {
                    if (remainingFlex[activity.id] <= 0) break;
                    if (slot.available <= 0) continue;

                    const dayKey = `${activity.id}-${slot.day}`;
                    const usedToday = usedPerActivityPerDay[dayKey] || 0;
                    if (usedToday >= MAX_FLEX_PER_DAY) continue; // Skip if already maxed this day

                    // Assign the full slot (or what's remaining) to this activity
                    const maxForDay = MAX_FLEX_PER_DAY - usedToday;
                    const toAssign = Math.min(slot.available, remainingFlex[activity.id], maxForDay);
                    if (toAssign >= 30) { // Minimum 30min block
                        assignments.push({ day: slot.day, hour: slot.hour, activity, minutes: toAssign });
                        remainingFlex[activity.id] -= toAssign;
                        slot.available -= toAssign;
                        usedPerActivityPerDay[dayKey] = usedToday + toAssign;
                        madeAssignment = true;
                    }
                }
            }
        }

        return assignments;
    }, [activities, getCommuteBlocks]);

    // Get flex blocks for a specific cell
    const getFlexBlocksForCell = (day: number, hour: number) => {
        return flexBlockAssignments.filter(a => a.day === day && a.hour === hour);
    };

    // Get blocks for a specific day and hour (including commute blocks)
    const getBlocksForCell = (day: number, hour: number) => {
        const blocks: { activity: Activity; slot: TimeSlot; top: number; height: number; isCommute?: boolean; commuteType?: 'to' | 'from' }[] = [];
        const pendingFallbacks: { activity: Activity; slot: TimeSlot; slotStart: number; slotEnd: number; top: number; height: number }[] = [];

        // Add regular activity blocks
        for (const activity of activities) {
            if (filterCategory && activity.category !== filterCategory) continue;

            for (const slot of activity.timeSlots) {
                if (!slot.days.includes(day)) continue;

                const slotStart = timeToMinutes(slot.startTime);
                let slotEnd = timeToMinutes(slot.endTime);

                // Handle overnight slots (e.g., 22:30 to 06:30)
                // For display purposes, cap at end of day (24:00) for the evening portion
                if (slotEnd <= slotStart) {
                    slotEnd = 24 * 60; // Show until midnight on this day
                }

                const cellStart = hour * 60;
                const cellEnd = (hour + 1) * 60;

                // Check if slot overlaps with this cell
                if (slotStart < cellEnd && slotEnd > cellStart) {
                    const top = Math.max(0, (slotStart - cellStart) / 60 * 40);

                    // Only render if this is the starting cell for this block
                    if (slotStart >= cellStart && slotStart < cellEnd) {
                        const fullHeight = ((slotEnd - slotStart) / 60) * 40;

                        if (activity.isFallback) {
                            // Queue fallback activities to check later
                            pendingFallbacks.push({ activity, slot, slotStart, slotEnd, top, height: fullHeight });
                        } else {
                            blocks.push({ activity, slot, top, height: fullHeight });
                        }
                    }
                }
            }
        }

        // Add commute blocks
        const commuteBlocks = getCommuteBlocks(day);
        for (const commute of commuteBlocks) {
            const slotStart = timeToMinutes(commute.startTime);
            const slotEnd = timeToMinutes(commute.endTime);
            const cellStart = hour * 60;
            const cellEnd = (hour + 1) * 60;

            if (slotStart < cellEnd && slotEnd > cellStart) {
                const top = Math.max(0, (slotStart - cellStart) / 60 * 40);

                if (slotStart >= cellStart && slotStart < cellEnd) {
                    const fullHeight = ((slotEnd - slotStart) / 60) * 40;
                    // Create a pseudo-activity for commute
                    const commuteActivity: Activity = {
                        id: `commute-${day}-${commute.type}`,
                        name: commute.type === 'to' ? 'Commute →' : '← Commute',
                        color: '#64748b', // slate gray
                        category: 'personal',
                        timeSlots: []
                    };
                    const commuteSlot: TimeSlot = {
                        days: [day],
                        startTime: commute.startTime,
                        endTime: commute.endTime
                    };
                    blocks.push({
                        activity: commuteActivity,
                        slot: commuteSlot,
                        top,
                        height: fullHeight,
                        isCommute: true,
                        commuteType: commute.type
                    });
                }
            }
        }

        // Now check fallback activities - only add if no regular activities overlap
        for (const fallback of pendingFallbacks) {
            const hasConflict = blocks.some(block => {
                if (block.isCommute) return false; // Ignore commute blocks for fallback conflict check
                const blockStart = timeToMinutes(block.slot.startTime);
                let blockEnd = timeToMinutes(block.slot.endTime);
                if (blockEnd <= blockStart) blockEnd = 24 * 60;
                // Check if times overlap
                return fallback.slotStart < blockEnd && fallback.slotEnd > blockStart;
            });

            if (!hasConflict) {
                blocks.push({ activity: fallback.activity, slot: fallback.slot, top: fallback.top, height: fallback.height });
            }
        }

        return blocks;
    };

    // Get sleep coverage for a specific cell (returns coverage info for twilight overlay)
    const getSleepCoverage = (day: number, hour: number): { top: number; height: number; isStart: boolean; gradientOffset: number; totalHeight: number; isMorning?: boolean } | null => {
        const sleepActivity = activities.find(a => a.category === 'sleep');
        if (!sleepActivity) return null;

        for (const slot of sleepActivity.timeSlots) {
            if (!slot.days.includes(day)) continue;

            const slotStart = timeToMinutes(slot.startTime);
            const originalSlotEnd = timeToMinutes(slot.endTime);
            const cellStart = hour * 60;
            const cellEnd = (hour + 1) * 60;

            // Handle overnight sleep - check BOTH evening and morning portions
            const isOvernight = originalSlotEnd <= slotStart;

            if (isOvernight) {
                // Evening portion: slotStart to midnight
                const eveningStart = slotStart;
                const eveningEnd = 24 * 60;
                const eveningDuration = eveningEnd - eveningStart;

                if (eveningStart < cellEnd && eveningEnd > cellStart) {
                    const overlapStart = Math.max(eveningStart, cellStart);
                    const overlapEnd = Math.min(eveningEnd, cellEnd);
                    const top = ((overlapStart - cellStart) / 60) * 40;
                    const height = ((overlapEnd - overlapStart) / 60) * 40;
                    const isStart = eveningStart >= cellStart && eveningStart < cellEnd;
                    const totalHeight = (eveningDuration / 60) * 40;
                    const offsetMinutes = overlapStart - eveningStart;
                    const gradientOffset = (offsetMinutes / eveningDuration) * 100;
                    return { top, height, isStart, gradientOffset, totalHeight };
                }

                // Morning portion: midnight (0:00) to originalSlotEnd
                const morningStart = 0;
                const morningEnd = originalSlotEnd;
                const morningDuration = morningEnd - morningStart;

                if (morningDuration > 0 && morningStart < cellEnd && morningEnd > cellStart) {
                    const overlapStart = Math.max(morningStart, cellStart);
                    const overlapEnd = Math.min(morningEnd, cellEnd);
                    const top = ((overlapStart - cellStart) / 60) * 40;
                    const height = ((overlapEnd - overlapStart) / 60) * 40;
                    const isStart = false; // Morning is continuation, not start
                    const totalHeight = (morningDuration / 60) * 40;
                    const offsetMinutes = overlapStart - morningStart;
                    const gradientOffset = (offsetMinutes / morningDuration) * 100;
                    return { top, height, isStart, gradientOffset, totalHeight, isMorning: true };
                }
            } else {
                // Regular daytime slot
                if (slotStart < cellEnd && originalSlotEnd > cellStart) {
                    const overlapStart = Math.max(slotStart, cellStart);
                    const overlapEnd = Math.min(originalSlotEnd, cellEnd);
                    const top = ((overlapStart - cellStart) / 60) * 40;
                    const height = ((overlapEnd - overlapStart) / 60) * 40;
                    const isStart = slotStart >= cellStart && slotStart < cellEnd;
                    const totalDuration = originalSlotEnd - slotStart;
                    const totalHeight = (totalDuration / 60) * 40;
                    const offsetMinutes = overlapStart - slotStart;
                    const gradientOffset = (offsetMinutes / totalDuration) * 100;
                    return { top, height, isStart, gradientOffset, totalHeight };
                }
            }
        }
        return null;
    };

    // Check for conflicts
    const hasConflict = (activity: Activity, slot: TimeSlot, day: number): boolean => {
        for (const other of activities) {
            if (other.id === activity.id) continue;
            for (const otherSlot of other.timeSlots) {
                if (!otherSlot.days.includes(day)) continue;
                const a = { start: timeToMinutes(slot.startTime), end: timeToMinutes(slot.endTime) };
                const b = { start: timeToMinutes(otherSlot.startTime), end: timeToMinutes(otherSlot.endTime) };
                if (a.start < b.end && a.end > b.start) return true;
            }
        }
        return false;
    };

    const handleSave = (activity: Activity) => {
        if (editingActivity) {
            setActivities(prev => prev.map(a => a.id === activity.id ? activity : a));
        } else {
            setActivities(prev => [...prev, { ...activity, id: generateId() }]);
        }
        setIsModalOpen(false);
        setEditingActivity(null);
    };

    // Export functions
    const exportJSON = () => {
        const data = {
            activities,
            commuteMinutes,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'planner-export.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportICS = () => {
        const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Planner//Export//EN\n';

        for (const activity of activities) {
            for (const slot of activity.timeSlots) {
                const days = slot.days.map(d => dayNames[d]).join(',');
                const startParts = slot.startTime.split(':');
                const endParts = slot.endTime.split(':');

                ics += 'BEGIN:VEVENT\n';
                ics += `SUMMARY:${activity.name}\n`;
                ics += `DTSTART:${new Date().toISOString().slice(0, 10).replace(/-/g, '')}T${startParts[0]}${startParts[1]}00\n`;
                ics += `DTEND:${new Date().toISOString().slice(0, 10).replace(/-/g, '')}T${endParts[0]}${endParts[1]}00\n`;
                ics += `RRULE:FREQ=WEEKLY;BYDAY=${days}\n`;
                ics += `CATEGORIES:${activity.category}\n`;
                ics += 'END:VEVENT\n';
            }
        }

        ics += 'END:VCALENDAR';
        const blob = new Blob([ics], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'planner-export.ics';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importJSON = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);
                    if (data.activities && Array.isArray(data.activities)) {
                        setActivities(data.activities);
                        if (data.commuteMinutes) {
                            setCommuteMinutes(data.commuteMinutes);
                        }
                        alert('Import successful!');
                    } else {
                        alert('Invalid file format');
                    }
                } catch {
                    alert('Failed to parse file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleDelete = (id: string) => {
        setActivities(prev => prev.filter(a => a.id !== id));
    };

    const handleEdit = (activity: Activity) => {
        setEditingActivity(activity);
        setIsModalOpen(true);
    };

    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Weekly Planner</h1>
                <p className={styles.subtitle}>Visualize your commitments and find balance</p>
            </div>

            {/* Analytics */}
            <div className={styles.analytics}>
                <div className={styles.stat}>
                    <span className={`${styles.statValue} ${committedHours > 60 ? styles.danger : committedHours > 50 ? styles.warning : ''}`}>
                        {committedHours.toFixed(1)}h
                    </span>
                    <span className={styles.statLabel}>Committed / Week</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{sleepHours.toFixed(1)}h</span>
                    <span className={styles.statLabel}>Sleep / Week</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{commuteHoursPerWeek.toFixed(1)}h</span>
                    <span className={styles.statLabel}>Commute / Week</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>
                        {(168 - totalHours - commuteHoursPerWeek).toFixed(1)}h
                    </span>
                    <span className={styles.statLabel}>Free Time</span>
                </div>
                <button
                    className={styles.settingsButton}
                    onClick={() => setShowCommuteSettings(!showCommuteSettings)}
                    title="Commute Settings"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </button>
                <button
                    className={`${styles.settingsButton} ${showSleep ? '' : styles.inactive}`}
                    onClick={() => setShowSleep(!showSleep)}
                    title={showSleep ? "Hide Sleep Overlay" : "Show Sleep Overlay"}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                </button>
            </div>

            {/* Commute Settings */}
            {showCommuteSettings && (
                <div className={styles.commuteSettings}>
                    <label className={styles.settingsLabel}>
                        <span>Commute time (one-way):</span>
                        <input
                            type="number"
                            className={styles.settingsInput}
                            value={commuteMinutes}
                            onChange={e => setCommuteMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                            min="0"
                            max="120"
                        />
                        <span>minutes</span>
                    </label>
                </div>
            )}

            {/* Allocation Bar */}
            <div className={styles.allocationBar}>
                <div className={styles.allocationBarLabel}>
                    <span>0h</span>
                    <span>168h / week</span>
                </div>
                <div className={styles.allocationBarTrack}>
                    {(() => {
                        const filteredActivities = [...activities].filter(a => showSleep || a.category !== 'sleep');
                        const baseTotal = showSleep ? 168 : 168 - (activities.find(a => a.category === 'sleep') ? calculateHours(activities.find(a => a.category === 'sleep')!) : 0);
                        return filteredActivities
                            .sort((a, b) => calculateHours(b) - calculateHours(a))
                            .map(activity => {
                                const hours = calculateHours(activity);
                                const percentage = (hours / baseTotal) * 100;
                                if (percentage < 0.5) return null;
                                return (
                                    <div
                                        key={activity.id}
                                        className={styles.allocationSegment}
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: activity.color
                                        }}
                                    >
                                        {percentage > 5 && (
                                            <span className={styles.segmentLabel}>
                                                {percentage > 10 ? activity.name : hours.toFixed(0) + 'h'}
                                            </span>
                                        )}
                                        <div className={styles.segmentTooltip}>
                                            <div className={styles.tooltipColor} style={{ backgroundColor: activity.color }} />
                                            <div className={styles.tooltipContent}>
                                                <span className={styles.tooltipName}>{activity.name}</span>
                                                <span className={styles.tooltipStats}>{hours.toFixed(1)}h · {percentage.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                    })()}
                    {/* Commute segment */}
                    {commuteHoursPerWeek > 0 && (
                        <div
                            className={styles.allocationSegment}
                            style={{
                                width: `${(commuteHoursPerWeek / 168) * 100}%`,
                                backgroundColor: '#64748b'
                            }}
                            title={`Commute: ${commuteHoursPerWeek.toFixed(1)}h`}
                        >
                            {(commuteHoursPerWeek / 168) * 100 > 3 && (
                                <span className={styles.segmentLabel}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                                    </svg>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Flexible Hours Bar - shows only unscheduled hours */}
                {(() => {
                    const activitiesWithFlexible = activities.filter(a => (a.unscheduledHours || 0) > 0);
                    if (activitiesWithFlexible.length === 0) return null;
                    const totalFlexible = activitiesWithFlexible.reduce((sum, a) => sum + (a.unscheduledHours || 0), 0);
                    return (
                        <div className={styles.flexibleBar}>
                            <span className={styles.flexibleLabel}>Flex</span>
                            <div className={styles.flexibleBarTrack}>
                                {activitiesWithFlexible
                                    .sort((a, b) => (b.unscheduledHours || 0) - (a.unscheduledHours || 0))
                                    .map(activity => {
                                        const flexHours = activity.unscheduledHours || 0;
                                        const percentage = (flexHours / totalFlexible) * 100;
                                        return (
                                            <div
                                                key={activity.id}
                                                className={styles.flexibleSegment}
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: activity.color
                                                }}
                                            >
                                                {percentage > 15 && (
                                                    <span className={styles.segmentLabel}>
                                                        {percentage > 25 ? activity.name : flexHours.toFixed(0) + 'h'}
                                                    </span>
                                                )}
                                                <div className={styles.segmentTooltip}>
                                                    <div className={styles.tooltipColor} style={{ backgroundColor: activity.color }} />
                                                    <div className={styles.tooltipContent}>
                                                        <span className={styles.tooltipName}>{activity.name}</span>
                                                        <span className={styles.tooltipStats}>{flexHours.toFixed(1)}h flexible</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                            <span className={styles.flexibleTotal}>{totalFlexible.toFixed(0)}h</span>
                        </div>
                    );
                })()}

                <div className={styles.allocationLegend}>
                    {activities.map(activity => (
                        <div key={activity.id} className={styles.legendItem}>
                            <div className={styles.legendDot} style={{ backgroundColor: activity.color }} />
                            <span>{activity.name} ({calculateHours(activity).toFixed(1)}h)</span>
                        </div>
                    ))}
                    {commuteHoursPerWeek > 0 && (
                        <div className={styles.legendItem}>
                            <div className={styles.legendDot} style={{ backgroundColor: '#64748b' }} />
                            <span>Commute ({commuteHoursPerWeek.toFixed(1)}h)</span>
                        </div>
                    )}
                    {168 - totalHours - commuteHoursPerWeek > 0 && (
                        <div className={styles.legendItem}>
                            <div className={`${styles.legendDot} ${styles.legendFree}`} />
                            <span>Free ({(168 - totalHours - commuteHoursPerWeek).toFixed(1)}h)</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.layout}>
                {/* Calendar */}
                <div className={styles.calendarContainer}>
                    <div className={styles.calendar}>
                        {/* Header row */}
                        <div className={styles.dayHeader}></div>
                        {DAYS.map((day, i) => (
                            <div key={day} className={`${styles.dayHeader} ${new Date().getDay() === i ? styles.today : ''}`}>
                                {day}
                            </div>
                        ))}

                        {/* Time rows */}
                        {HOURS.map(hour => (
                            <>
                                <div key={`time-${hour}`} className={styles.timeLabel}>
                                    {formatHour(hour)}
                                </div>
                                {DAYS.map((_, dayIndex) => {
                                    const sleepCoverage = getSleepCoverage(dayIndex, hour);
                                    return (
                                        <div key={`${hour}-${dayIndex}`} className={styles.timeSlot}>
                                            {/* Twilight/sleep overlay */}
                                            {sleepCoverage && (() => {
                                                const gradientOffset = (sleepCoverage.gradientOffset / 100) * sleepCoverage.totalHeight;
                                                const gradientDir = sleepCoverage.isMorning ? 'to top' : 'to bottom';
                                                const gradientColors = sleepCoverage.isMorning
                                                    ? 'rgba(30, 27, 75, 0.15), rgba(30, 27, 75, 0.6)'
                                                    : 'rgba(30, 27, 75, 0.15), rgba(30, 27, 75, 0.6)';
                                                return (
                                                    <div
                                                        className={`${styles.twilightOverlay} ${sleepCoverage.isStart ? styles.twilightStart : ''}`}
                                                        style={{
                                                            top: `${sleepCoverage.top}px`,
                                                            height: `${sleepCoverage.height}px`,
                                                            backgroundImage: `linear-gradient(${gradientDir}, ${gradientColors})`,
                                                            backgroundSize: `100% ${sleepCoverage.totalHeight}px`,
                                                            backgroundPosition: `0 ${-gradientOffset}px`
                                                        }}
                                                    />
                                                );
                                            })()}
                                            {/* Activity blocks (exclude sleep) */}
                                            {getBlocksForCell(dayIndex, hour)
                                                .filter(({ activity }) => activity.category !== 'sleep')
                                                .map(({ activity, slot, top, height }) => (
                                                    <div
                                                        key={`${activity.id}-${slot.startTime}`}
                                                        className={`${styles.activityBlock} ${height < 20 ? styles.tiny : ''} ${slot.days.some(d => hasConflict(activity, slot, d)) ? styles.conflict : ''}`}
                                                        style={{
                                                            backgroundColor: activity.color,
                                                            top: `${top}px`,
                                                            height: `${height}px`,
                                                            color: '#fff'
                                                        }}
                                                        onClick={() => handleEdit(activity)}
                                                        title={`${activity.name}\n${slot.startTime} - ${slot.endTime}`}
                                                    >
                                                        {activity.name}
                                                    </div>
                                                ))}
                                            {/* Flex blocks (unscheduled hours filling empty space) */}
                                            {(() => {
                                                const flexBlocks = getFlexBlocksForCell(dayIndex, hour);
                                                if (flexBlocks.length === 0) return null;

                                                // Stack flex blocks at bottom of remaining space
                                                let offset = 0;
                                                return flexBlocks.map((fb, idx) => {
                                                    const height = (fb.minutes / 60) * 40;
                                                    const top = offset;
                                                    offset += height;
                                                    return (
                                                        <div
                                                            key={`flex-${fb.activity.id}-${idx}`}
                                                            className={styles.flexBlock}
                                                            style={{
                                                                backgroundColor: fb.activity.color,
                                                                top: `${40 - offset}px`,
                                                                height: `${height}px`
                                                            }}
                                                            title={`${fb.activity.name} (flex): ${fb.minutes}min`}
                                                        >
                                                            {height > 15 && fb.activity.name}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className={styles.sidebar}>
                    <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                        + Add Activity
                    </button>

                    {/* Export buttons */}
                    <div className={styles.exportButtons}>
                        <button className={styles.exportButton} onClick={importJSON} title="Import from JSON backup">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                            </svg>
                            Import
                        </button>
                        <button className={styles.exportButton} onClick={exportJSON} title="Export as JSON (for backup)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            JSON
                        </button>
                        <button className={styles.exportButton} onClick={exportICS} title="Export as ICS (for Google Calendar, etc.)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Calendar
                        </button>
                    </div>

                    {/* Category filters */}
                    <div className={styles.categoryFilters}>
                        <button
                            className={`${styles.categoryFilter} ${!filterCategory ? styles.active : ''}`}
                            onClick={() => setFilterCategory(null)}
                        >
                            All
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`${styles.categoryFilter} ${filterCategory === cat ? styles.active : ''}`}
                                onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Activity list */}
                    <div className={styles.activityList}>
                        {activities.length === 0 ? (
                            <div className={styles.emptyState}>
                                No activities yet. Click "Add Activity" to get started!
                            </div>
                        ) : (
                            activities
                                .filter(a => !filterCategory || a.category === filterCategory)
                                .map(activity => (
                                    <div key={activity.id} className={styles.activityCard}>
                                        <span className={styles.activityCategory}>{activity.category}</span>
                                        <div className={styles.activityHeader}>
                                            <div className={styles.colorDot} style={{ backgroundColor: activity.color }} />
                                            <span className={styles.activityName}>{activity.name}</span>
                                        </div>
                                        <div className={styles.activityHours}>
                                            {(() => {
                                                const scheduled = getScheduledHours(activity);
                                                const flexible = activity.unscheduledHours || 0;
                                                const total = calculateHours(activity);
                                                if (flexible > 0 && scheduled > 0) {
                                                    return <>{scheduled.toFixed(1)}h + <span className={styles.flexibleBadge}>{flexible.toFixed(1)}h flex</span> = {total.toFixed(1)}h/wk</>;
                                                } else if (flexible > 0) {
                                                    return <><span className={styles.flexibleBadge}>{flexible.toFixed(1)}h flex</span>/wk</>;
                                                } else {
                                                    return <>{total.toFixed(1)} hours/week</>;
                                                }
                                            })()}
                                        </div>
                                        <div className={styles.activityTimes}>
                                            {activity.timeSlots.map((slot, i) => (
                                                <div key={i}>
                                                    {slot.days.map(d => DAYS[d].slice(0, 2)).join(', ')}: {slot.startTime} - {slot.endTime}
                                                </div>
                                            ))}
                                        </div>
                                        <div className={styles.activityActions}>
                                            <button className={styles.iconButton} onClick={() => handleEdit(activity)} title="Edit">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button className={`${styles.iconButton} ${styles.deleteIcon}`} onClick={() => handleDelete(activity.id)} title="Delete">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <ActivityModal
                    activity={editingActivity}
                    onSave={handleSave}
                    onClose={() => { setIsModalOpen(false); setEditingActivity(null); }}
                />
            )}
        </main>
    );
}

// Activity Modal Component
function ActivityModal({
    activity,
    onSave,
    onClose
}: {
    activity: Activity | null;
    onSave: (activity: Activity) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(activity?.name || '');
    const [color, setColor] = useState(activity?.color || COLORS[0]);
    const [category, setCategory] = useState<Activity['category']>(activity?.category || 'academic');
    const [unscheduledHours, setUnscheduledHours] = useState(activity?.unscheduledHours || 0);
    const [requiresCommute, setRequiresCommute] = useState(activity?.requiresCommute || false);
    const [isFallback, setIsFallback] = useState(activity?.isFallback || false);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(
        activity?.timeSlots || [{ days: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '10:00' }]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        // Allow saving if there are time slots OR unscheduled hours (or both)
        const filteredSlots = timeSlots.filter(s => s.days.length > 0);
        if (filteredSlots.length === 0 && unscheduledHours <= 0) return;
        onSave({
            id: activity?.id || '',
            name: name.trim(),
            color,
            category,
            timeSlots: filteredSlots,
            unscheduledHours: unscheduledHours,
            requiresCommute: filteredSlots.length > 0 ? requiresCommute : false,
            isFallback: filteredSlots.length > 0 ? isFallback : false
        });
    };

    const updateTimeSlot = (index: number, updates: Partial<TimeSlot>) => {
        setTimeSlots(prev => prev.map((slot, i) => i === index ? { ...slot, ...updates } : slot));
    };

    const toggleDay = (slotIndex: number, day: number) => {
        setTimeSlots(prev => prev.map((slot, i) => {
            if (i !== slotIndex) return slot;
            const days = slot.days.includes(day)
                ? slot.days.filter(d => d !== day)
                : [...slot.days, day].sort();
            return { ...slot, days };
        }));
    };

    const addTimeSlot = () => {
        setTimeSlots(prev => [...prev, { days: [], startTime: '09:00', endTime: '10:00' }]);
    };

    const removeTimeSlot = (index: number) => {
        setTimeSlots(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>
                    {activity ? 'Edit Activity' : 'Add Activity'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Name</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g., School, Robotics, Sleep"
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Category</label>
                        <select
                            className={styles.select}
                            value={category}
                            onChange={e => setCategory(e.target.value as Activity['category'])}
                        >
                            <option value="academic">Academic</option>
                            <option value="extracurricular">Extracurricular</option>
                            <option value="personal">Personal</option>
                            <option value="sleep">Sleep</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Color</label>
                        <div className={styles.colorPicker}>
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`${styles.colorOption} ${color === c ? styles.selected : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Time Slots Section */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Scheduled Times (optional)</label>
                        {timeSlots.map((slot, slotIndex) => (
                            <div key={slotIndex} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {DAYS.map((day, dayIndex) => (
                                        <label key={day} className={styles.dayCheckbox}>
                                            <input
                                                type="checkbox"
                                                checked={slot.days.includes(dayIndex)}
                                                onChange={() => toggleDay(slotIndex, dayIndex)}
                                            />
                                            {day.slice(0, 2)}
                                        </label>
                                    ))}
                                </div>
                                <div className={styles.timeSlotRow}>
                                    <div className={styles.timeInputs}>
                                        <input
                                            type="time"
                                            className={styles.timeInput}
                                            value={slot.startTime}
                                            onChange={e => updateTimeSlot(slotIndex, { startTime: e.target.value })}
                                        />
                                        <span style={{ color: 'var(--color-text-secondary)' }}>to</span>
                                        <input
                                            type="time"
                                            className={styles.timeInput}
                                            value={slot.endTime}
                                            onChange={e => updateTimeSlot(slotIndex, { endTime: e.target.value })}
                                        />
                                    </div>
                                    {timeSlots.length > 1 && (
                                        <button
                                            type="button"
                                            className={styles.removeTimeSlot}
                                            onClick={() => removeTimeSlot(slotIndex)}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button type="button" className={styles.addTimeSlot} onClick={addTimeSlot}>
                            + Add another time slot
                        </button>

                        {/* Commute checkbox */}
                        <label
                            className={`${styles.commuteCheckbox} ${requiresCommute ? styles.checked : ''}`}
                            style={{ marginTop: '1rem' }}
                        >
                            <input
                                type="checkbox"
                                checked={requiresCommute}
                                onChange={e => setRequiresCommute(e.target.checked)}
                            />
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                                </svg>
                                Requires commute (auto-add travel time)
                            </span>
                        </label>
                        <label
                            className={`${styles.commuteCheckbox} ${isFallback ? styles.checked : ''}`}
                            style={{ marginTop: '0.5rem' }}
                        >
                            <input
                                type="checkbox"
                                checked={isFallback}
                                onChange={e => setIsFallback(e.target.checked)}
                            />
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                                </svg>
                                Fallback only (hide if other activities exist)
                            </span>
                        </label>
                    </div>

                    {/* Additional Hours Section */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Additional Hours per Week (optional)</label>
                        <div className={styles.hoursInput}>
                            <input
                                type="number"
                                className={styles.input}
                                value={unscheduledHours || ''}
                                onChange={e => setUnscheduledHours(parseFloat(e.target.value) || 0)}
                                placeholder="e.g., 5"
                                min="0"
                                max="168"
                                step="0.5"
                            />
                            <span className={styles.hoursLabel}>hours / week</span>
                        </div>
                        <p className={styles.hoursHint}>
                            Extra time that counts toward totals but won&apos;t show on the calendar.
                        </p>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveButton}>
                            {activity ? 'Save Changes' : 'Add Activity'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
