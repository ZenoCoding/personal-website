import { blogs } from "@/data/blogs";
import Link from "next/link";
import styles from "./blog.module.css";

export const metadata = {
    title: "Writing | Tycho Young",
    description: "Essays, reporting, and engineering notes by Tycho Young.",
};

export default function BlogIndex() {
    const sortedBlogs = [...blogs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <main className={styles.page}>
            <div className={styles.indexContainer}>
                <header className={styles.indexHeader}>
                    <h1 className={styles.indexTitle}>Writing</h1>
                    <p className={styles.intro}>
                        Essays, reporting, and engineering notes.
                    </p>
                </header>

                <div className={styles.postGrid}>
                    {sortedBlogs.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className={styles.postLink}
                        >
                            <article className={styles.card}>
                                <div className={styles.cardBody}>
                                    <div className={styles.meta}>
                                        <time>{post.date}</time>
                                        {post.tags && post.tags.length > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{post.tags[0]}</span>
                                            </>
                                        )}
                                    </div>

                                    <h2 className={styles.cardTitle}>
                                        {post.title}
                                    </h2>

                                    <p className={styles.cardDescription}>
                                        {post.description}
                                    </p>

                                    <div className={styles.readPost}>
                                        Read Post <span className={styles.arrow}>→</span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
