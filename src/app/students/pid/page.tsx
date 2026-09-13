import type { Metadata } from "next";
import Link from "next/link";
import styles from "../Students.module.css";

export const metadata: Metadata = {
    title: "Understanding PID Control | FRC Programming",
    description: "Selected WPILib readings and interactive tuning walkthroughs.",
    robots: { index: false, follow: false },
};

const intro = "https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/";

export default function PIDPage() {
    return <main className={styles.page}><article className={styles.container}>
        <Link className={styles.back} href="/students">← Programming lessons</Link>
        <header className={styles.header}>
            <h1 className={styles.title}>Understanding PID control</h1>
            <p className={styles.subtitle}>WPILib readings and tuning walkthroughs. The interactive exercises run in your browser.</p>
        </header>
        <section className={styles.section}>
            <h2>Start here</h2>
            <ol>
                <li><a href={`${intro}introduction-to-pid.html`}>Introduction to PID</a></li>
                <li><a href={`${intro}tutorial-intro.html`}>How to use the controls tuning tutorials</a></li>
            </ol>
        </section>
        <section className={styles.section}>
            <h2>Work through the tuning exercises</h2>
            <ol>
                <li><a href={`${intro}tuning-flywheel.html`}>Flywheel velocity controller</a></li>
                <li><a href={`${intro}tuning-turret.html`}>Turret position controller</a></li>
                <li><a href={`${intro}tuning-vertical-arm.html`}>Vertical arm position controller</a></li>
                <li><a href={`${intro}tuning-elevator.html`}>Elevator with motion profiling</a></li>
            </ol>
        </section>
        <section className={styles.section}>
            <h2>When you write the code</h2>
            <p><a href="https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/pidcontroller.html">PID Control in WPILib</a></p>
        </section>
        <footer className={styles.footer}><Link href="/students/projects/elevator">Elevator subsystem project →</Link></footer>
    </article></main>;
}
