import type { Metadata } from "next";
import Link from "next/link";
import styles from "../Students.module.css";

export const metadata: Metadata = {
    title: "Java Homework | FRC Programming",
    description: "Java homework for [PRO] students, due Monday, September 28: parameters, return values, boolean conditions, and helper methods.",
    robots: { index: false, follow: false },
};

const sections = [
    {
        title: "1. Parameters and return values",
        problems: [
            { name: "sumDouble", id: "p154485" },
            { name: "diff21", id: "p116624" },
            { name: "intMax", id: "p101887" },
        ],
    },
    {
        title: "2. Boolean conditions",
        problems: [
            { name: "sleepIn", id: "p187868" },
            { name: "monkeyTrouble", id: "p181646" },
            { name: "makes10", id: "p182873" },
        ],
    },
    {
        title: "3. Combining conditions",
        problems: [
            { name: "parrotTrouble", id: "p140449" },
            { name: "icyHot", id: "p192082" },
            { name: "in1020", id: "p144535" },
            { name: "posNeg", id: "p159227" },
        ],
    },
];

export default function JavaHomeworkPage() {
    return <main className={styles.page}><article className={styles.container}>
        <Link className={styles.back} href="/students">← Programming lessons</Link>
        <header className={styles.header}>
            <h1 className={styles.title}>Java homework</h1>
            <p className={styles.subtitle}>For [PRO] students learning Java. Due <time dateTime="2026-09-28">Monday, September 28</time>.</p>
        </header>
        {sections.map(section => <section className={styles.section} key={section.title}>
            <h2>{section.title}</h2>
            <ul>
                {section.problems.map(problem => <li key={problem.id}>
                    <a href={`https://codingbat.com/prob/${problem.id}`}>{problem.name}</a>
                </li>)}
            </ul>
        </section>)}
        <section className={styles.section}>
            <h2>Write your own methods</h2>
            <p>Write your own methods below your solution for these two problems:</p>
            <ul>
                <li><strong>in1020:</strong> Write <code>isInRange</code>, which takes one integer and returns whether it is between 10 and 20, inclusive. Use it in your solution.</li>
                <li><strong>intMax:</strong> Write <code>larger</code>, which takes two integers and returns the larger value. Use it to find the largest of the three inputs.</li>
            </ul>
        </section>
        <footer className={styles.footer}><Link href="/students">← Programming lessons</Link></footer>
    </article></main>;
}
