
import ProjectCard from '@/components/ProjectCard';
import styles from './Projects.module.css';
import { portfolio, type Project } from '@/data/portfolio';

function ProjectGrid({ projects }: { projects: Project[] }) {
    return (
        <div className={styles.grid}>
            {projects.map((project) => (
                <ProjectCard
                    key={project.title}
                    title={project.title}
                    description={project.description}
                    tags={project.tags}
                    demoLink={project.link}
                    image={project.image}
                    repoLink={project.repo}
                    date={project.date}
                    paperLink={project.paper}
                    imagePosition={project.imagePosition}
                />
            ))}
        </div>
    );
}

export default function Projects() {
    return (
        <section id="projects" className={styles.section}>
            <div className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>Work</h1>
                    <p className={styles.subtitle}>
                        A selection of my contributions, projects, and roles.
                    </p>
                </header>

                {/* Experience (Mission Log) */}
                <div className={styles.subSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Experience</h2>
                        <div className={styles.line} />
                    </div>

                    <div className={styles.timeline}>
                        {portfolio.experience.map((role, index) => (
                            <div key={index} className={`${styles.timelineItem} ${role.featured ? styles.featured : ''}`}>
                                <div className={styles.timelineMarker} />
                                <div className={styles.timelineCard}>
                                    <div className={styles.roleHeader}>
                                        <h3 className={styles.role}>{role.role}</h3>
                                        <span className={styles.company}>{role.company}</span>
                                    </div>
                                    <div className={styles.timelineMeta}>
                                        <span>{role.date}</span>
                                        <span>{'//'}</span>
                                        <span>{role.location}</span>
                                    </div>
                                    <div className={styles.timelineDesc}>
                                        {role.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Projects (System Modules) */}
                <div className={styles.subSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Selected Projects</h2>
                        <div className={styles.line} />
                    </div>

                    <ProjectGrid projects={portfolio.projects.filter((project) => project.featured && !project.hidden)} />
                    <details className={styles.archive}>
                        <summary>More projects</summary>
                        <ProjectGrid projects={portfolio.projects.filter((project) => !project.featured && !project.hidden)} />
                    </details>
                </div>
            </div>
        </section>
    );
}
