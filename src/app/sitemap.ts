import { MetadataRoute } from 'next';
import { blogs } from '@/data/blogs';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://tychoyoung.com'; // Replace with actual domain if different

    // Static pages
    const routes = ['', '/about', '/photos', '/blog'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // Dynamic blog posts
    const blogRoutes = blogs.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date).toISOString().split('T')[0],
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...blogRoutes];
}
