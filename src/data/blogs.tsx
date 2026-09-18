import { ReactNode } from "react";
import SotmArticle from "@/components/blog/SotmArticle";
import journalism from "./journalism.json";

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    description: string;
    content: ReactNode;
    tags?: string[];
    image?: string;
    byline?: string;
    publication?: { label: string; url: string };
}

export const blogs: BlogPost[] = [
    {
        slug: "shooting-on-the-move",
        title: "Shooting on the Move: An Iterative Solution",
        date: "Feb 1, 2026",
        description: "A moving robot changes a ball’s trajectory. Compensating for that motion changes its flight time. Here’s how to solve the circular dependency with an iterative shot model.",
        tags: ["Robotics", "Simulation", "Math", "FRC"],
        image: "/photos/shooting_sim.png",
        content: <SotmArticle />,
    },
    {
        slug: "you-dont-know-the-news",
        title: "You Don’t Know the News. It’s a Problem.",
        date: "Nov 5, 2025",
        description: "Social media can make us feel informed without helping us understand.",
        tags: ["Opinion"],
        byline: "Tycho Young",
        publication: {
            label: "Originally published in The Yellow Pages",
            url: "https://www.typ.news/posts/2025-11-05_You_Don_t_Know_the_News_It_s_a_Problem",
        },
        content: <>{journalism.news.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</>,
    },
    {
        slug: "mr-betcher-teaching-as-an-art",
        title: "Mr. Betcher: Teaching as an Art",
        date: "Apr 1, 2026",
        description: "On reading, pottery, and helping students learn to think for themselves.",
        tags: ["Profile"],
        byline: "Sarah Wu and Tycho Young",
        publication: {
            label: "Originally published in The Yellow Pages",
            url: "https://www.typ.news/posts/2026-04-01_mr_betcher_teaching_as_an_art",
        },
        content: <>{journalism.betcher.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</>,
    },
    {
        slug: "bifu-in-the-lunchroom",
        title: "BIFU in the Lunchroom",
        date: "2025",
        description: "D&D, soccer, studying, and the small routines that fill a school lunch break.",
        tags: ["Student Life"],
        byline: "Tycho Young",
        publication: {
            label: "Written for The Yellow Pages",
            url: "https://www.typ.news",
        },
        content: <>{journalism.lunchroom.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</>,
    },
];
