import { Metadata } from "next";
import Link from "next/link";
import styles from "./Students.module.css";

export const metadata: Metadata = {
    title: "Student Resources | Tycho Young",
    description: "Private resources for students.",
    robots: { index: false, follow: false },
};

export default function StudentsPage() {
    const resources = [
        {
            title: "Lesson: Building an Intake Subsystem",
            description:
                "Learn to write a WPILib subsystem with Motion Magic arm control and roller motors. Includes interactive exercises with hidden solutions.",
            link: "/students/intake",
            type: "Lesson",
        },
    ];

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Student Resources</h1>
                    <p className={styles.subtitle}>
                        Access lesson materials, assignments, and extra reading.
                    </p>
                </header>

                <section className={styles.grid}>
                    {resources.map((res, i) => (
                        <Link href={res.link} key={i} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>{res.title}</h3>
                                <span className={styles.badge}>{res.type}</span>
                            </div>
                            <p className={styles.cardDescription}>{res.description}</p>
                            <span className={styles.cardLink}>
                                View Lesson <span>→</span>
                            </span>
                        </Link>
                    ))}
                </section>

                <footer className={styles.footer}>
                    <Link href="/" className={styles.backLink}>
                        <span>←</span>
                        <span>Back to Home</span>
                    </Link>
                </footer>
            </div>
        </main>
    );
}
