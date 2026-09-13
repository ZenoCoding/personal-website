import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../Students.module.css";
import { JavaLesson, IntakeLesson, ElevatorProject } from "../GuidedLessons";

const projects = {
    java: { title: "Java foundations", stage: "Base → Java Familiar", intro: "Finish the rules for a two-player tic-tac-toe game." },
    "intake-practice": { title: "Practice an intake on your laptop", stage: "Java Familiar → Subsystem Ready", intro: "Make the rollers start, reverse, and stop in response to buttons and a piece sensor." },
    elevator: { title: "Project: Elevator subsystem", stage: "After the intake", intro: "Move to a height, find home, and report what the elevator is doing." },
};
type Project = keyof typeof projects;
function isProject(value: string): value is Project { return Object.hasOwn(projects, value); }
export function generateStaticParams() { return Object.keys(projects).map(project => ({ project })); }
export async function generateMetadata({ params }: { params: Promise<{ project: string }> }): Promise<Metadata> {
    const { project } = await params;
    return { title: `${isProject(project) ? projects[project].title : "Project not found"} | FRC Programming`, robots: { index: false, follow: false } };
}
export default async function ProjectPage({ params }: { params: Promise<{ project: string }> }) {
    const { project } = await params;
    if (!isProject(project)) notFound();
    const item = projects[project];
    return <main className={styles.page}><article className={styles.container}>
        <Link className={styles.back} href="/students">← FRC Programming</Link>
        <header className={styles.header}>
            <p className={styles.eyebrow}>{item.stage}</p>
            <h1 className={styles.title}>{item.title}</h1><p className={styles.subtitle}>{item.intro}</p>
        </header>
        {project === "java" ? <JavaLesson /> : project === "intake-practice" ? <IntakeLesson /> : <ElevatorProject />}
        <footer className={styles.footer}><Link href="/students">← All projects</Link></footer>
    </article></main>;
}
