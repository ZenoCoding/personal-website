import { blogs } from "@/data/blogs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../blog.module.css";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = blogs.find((p) => p.slug === slug);
    if (!post) {
        return {
            title: "Post Not Found | Tycho Young"
        };
    }
    return {
        title: `${post.title} | Tycho Young`,
        description: post.description,
    };
}

export async function generateStaticParams() {
    return blogs.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;
    const post = blogs.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <main className={styles.page}>
            <article className={styles.article}>
                <Link
                    href="/blog"
                    className={styles.backLink}
                >
                    <ArrowLeft className={styles.backIcon} />
                    Back to Writing
                </Link>

                <header className={styles.articleHeader}>
                    <div className={styles.meta}>
                        <time>{post.date}</time>
                        {post.tags?.map((tag) => (
                            <span key={tag} className={styles.tag}>
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className={styles.articleTitle}>
                        {post.title}
                    </h1>
                    <p className={styles.description}>
                        {post.description}
                    </p>
                </header>

                <div className={styles.blogContent}>
                    {post.content}
                </div>
            </article>
        </main>
    );
}
