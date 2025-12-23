import ProjectCard from '@/components/ProjectCard';
import styles from './projects.module.css';
import { portfolio } from '@/data/portfolio';

export default function Projects() {
    return (
        <main className={styles.main}>
            <div className="grid-bg" />
            <div className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>Work</h1>
                    <p className={styles.subtitle}>
                        A selection of my contributions, projects, and roles.
                    </p>
                </header>

                {/* Experience (Mission Log) */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Experience</h2>
                        <div className={styles.line} />
                    </div>

                    <div className={styles.timeline}>
                        {portfolio.experience.map((role, index) => (
                            <div key={index} className={`${styles.timelineItem} ${role.featured ? styles.featured : ''}`}>
                                <div className={styles.timelineMarker} />
                                <div className={styles.roleHeader}>
                                    <h3 className={styles.role}>{role.role}</h3>
                                    <span className={styles.company}>{role.company}</span>
                                </div>
                                <div className={styles.timelineMeta}>
                                    <span>{role.date}</span>
                                    <span>//</span>
                                    <span>{role.location}</span>
                                </div>
                                <div className={styles.timelineDesc}>
                                    {role.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Projects (System Modules) */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Featured Projects</h2>
                        <div className={styles.line} />
                    </div>

                    <div className={styles.grid}>
                        {portfolio.projects.map((project, index) => (
                            <ProjectCard
                                key={index}
                                title={project.title}
                                description={project.description}
                                tags={project.tags}
                                demoLink="#" // Placeholder
                                repoLink="#" // Placeholder
                            />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
