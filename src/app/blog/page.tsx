import { blogs } from "@/data/blogs";
import Link from "next/link";

export default function BlogIndex() {
    const sortedBlogs = [...blogs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <main className="min-h-screen pt-32 pb-20">
            <div className="container">
                <header className="mb-16">
                    <h1 className="text-4xl font-bold mb-4">Writing</h1>
                    <p className="text-secondary max-w-2xl">
                        Thoughts, updates, and explorations in engineering and design.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedBlogs.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group block"
                        >
                            <article className="glass p-6 rounded-2xl h-full transition-all duration-300 group-hover:bg-white/5 group-hover:-translate-y-1">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center gap-2 text-sm text-secondary mb-4">
                                        <time>{post.date}</time>
                                        {post.tags && post.tags.length > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{post.tags[0]}</span>
                                            </>
                                        )}
                                    </div>

                                    <h2 className="text-xl font-bold mb-3 group-hover:text-accent-primary transition-colors">
                                        {post.title}
                                    </h2>

                                    <p className="text-secondary mb-6 flex-grow">
                                        {post.description}
                                    </p>

                                    <div className="flex items-center text-sm font-medium text-accent-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        Read Post <span className="ml-1">→</span>
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
