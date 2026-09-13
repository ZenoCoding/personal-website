import { Metadata } from "next";
import Link from "next/link";
import styles from "./Students.module.css";

export const metadata: Metadata = {
    title: "FRC Programming Lessons | Student Resources",
    description: "Java, command-based programming, and robot subsystem walkthroughs.",
    robots: { index: false, follow: false },
};

const lessons = [
    { stage: "Start here if you are new to Java", title: "Java foundations", href: "/students/projects/java", description: "Finish a tic-tac-toe game: reject illegal moves, detect a win, and handle a draw." },
    { stage: "Java Familiar · Walkthrough", title: "WPILib Commands in Practice", href: "/students/commands", description: "Make a button run an intake, stop it on release, and handle a second command interrupting it." },
    { stage: "Java Familiar · Walkthrough", title: "Building an Intake Subsystem", href: "/students/intake", description: "Write the motor setup, read the piece sensor, and build a command that collects and stows. Starter code and solutions are included." },
    { stage: "Companion exercise · No hardware needed", title: "Practice an intake on your laptop", href: "/students/projects/intake-practice", description: "Run the intake exercises with keyboard buttons and a sensor value you change on the dashboard." },
    { stage: "WPILib readings and walkthroughs", title: "Understanding PID control", href: "/students/pid", description: "Read the PID introduction and try the interactive tuning exercises." },
    { stage: "After the intake · Project", title: "Elevator subsystem", href: "/students/projects/elevator", description: "Write an elevator subsystem with position control, homing, and telemetry." },
];

export default function StudentsPage() {
    return <main className={styles.page}><div className={styles.container}>
        <header className={styles.header}>
            <h1 className={styles.title}>Programming lessons</h1>
            <p className={styles.subtitle}>Start with a lesson you can follow. When you get stuck, bring the code and the part that confused you—we can work through it together.</p>
        </header>
        <nav className={styles.projects} aria-label="Programming lessons">
            {lessons.map(lesson => <Link className={styles.project} key={lesson.href} href={lesson.href}>
                <span className={styles.eyebrow}>{lesson.stage}</span>
                <h2>{lesson.title} <span aria-hidden="true">→</span></h2>
                <p>{lesson.description}</p>
            </Link>)}
        </nav>
        <section className={styles.section}>
            <h2>Choosing an intake lesson</h2>
            <p>For the intake, choose the laptop lesson if you are working at home. Use the hardware walkthrough when you are ready to write the motor configuration; its physical checks will need a robot.</p>
        </section>
        <section className={styles.section}>
            <h2>Then build together</h2>
            <p>Finish the elevator project and review it with a mentor, then pick a Hightide clone feature with a teammate.</p>
        </section>
        <footer className={styles.footer}><Link href="/">← Back to Home</Link></footer>
    </div></main>;
}
