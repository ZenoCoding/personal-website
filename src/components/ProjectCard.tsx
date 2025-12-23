import Link from 'next/link';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
    title: string;
    description: string;
    tags: string[];
    demoLink?: string;
    repoLink?: string;
    color?: string; // Optional accent color
}

const ProjectCard = ({ title, description, tags, demoLink, repoLink, color }: ProjectCardProps) => {
    return (
        <div className={styles.card}>
            <div className={styles.imagePlaceholder} style={{ background: color || 'linear-gradient(135deg, #333, #111)' }} />

            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>

                <div className={styles.tags}>
                    {tags.map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                </div>

                <div className={styles.links}>
                    {demoLink && <Link href={demoLink} className={styles.link} target="_blank">Live Demo</Link>}
                    {repoLink && <Link href={repoLink} className={styles.link} target="_blank">GitHub</Link>}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
