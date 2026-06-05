import { blogs } from "@/data/blogs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../blog.module.css";

interface Props {
    params: Promise<{ slug: string }>;
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
        <main className="min-h-screen pt-32 pb-20">
            <article className="container max-w-3xl">
                <Link
                    href="/blog"
                    className="inline-flex items-center text-secondary hover:text-primary mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Writing
                </Link>

                <header className="mb-12">
                    <div className="flex items-center gap-3 text-sm text-secondary mb-4">
                        <time>{post.date}</time>
                        {post.tags?.map((tag) => (
                            <span key={tag} className="px-2 py-1 rounded-full bg-secondary/10 text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <p className="text-xl text-secondary leading-relaxed">
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
