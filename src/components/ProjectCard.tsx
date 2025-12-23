import Link from 'next/link';
import styles from './ProjectCard.module.css';
import { Github, FileText, ExternalLink, Box } from 'lucide-react';

interface ProjectCardProps {
    title: string;
    description: string;
    tags: string[];
    demoLink?: string;
    repoLink?: string;
    color?: string; // Optional accent color
    image?: string;
    date?: string;
    paperLink?: string;
}

const ProjectCard = ({ title, description, tags, demoLink, repoLink, paperLink, color, image, date }: ProjectCardProps) => {
    return (
        <div className={styles.card}>
            <div className={styles.imagePlaceholder} style={{ background: color || 'linear-gradient(135deg, #333, #111)' }}>
                {image && <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>

            <div className={styles.content}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 className={styles.title} style={{ marginBottom: 0 }}>{title}</h3>
                    {date && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>{date}</span>}
                </div>
                <p className={styles.description}>{description}</p>

                <div className={styles.tags}>
                    {tags.map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                </div>

                <div className={styles.links}>
                    {demoLink && (
                        <Link href={demoLink} className={styles.link} target="_blank">
                            {demoLink.includes('onshape.com') ? (
                                <>
                                    <Box size={14} style={{ marginRight: '4px' }} />
                                    View CAD
                                </>
                            ) : (
                                <>
                                    <ExternalLink size={14} style={{ marginRight: '4px' }} />
                                    Live Demo
                                </>
                            )}
                        </Link>
                    )}
                    {repoLink && (
                        <Link href={repoLink} className={styles.link} target="_blank">
                            <Github size={14} style={{ marginRight: '4px' }} />
                            GitHub
                        </Link>
                    )}
                    {paperLink && (
                        <Link href={paperLink} className={styles.link} target="_blank">
                            <FileText size={14} style={{ marginRight: '4px' }} />
                            {paperLink.includes('notion.site') ? 'Read Explainer' : 'Read Paper'}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
