export interface Project {
    title: string;
    description: string;
    tags: string[];
    date?: string;
    featured?: boolean;
    image?: string;
    link?: string;
    repo?: string;
    paper?: string;
}

export const portfolio: {
    personalInfo: any;
    socials: any;
    about: any;
    gear: any[];
    education: any[];
    experience: any[];
    projects: Project[];
    skills: string[];
    honors: any[];
    now: any;
    photos: any[];
    testScores: any[];
} = {
    personalInfo: {
        name: "Tycho Young",
        tagline: "Student at BASIS Independent Fremont; Executive Director at Fremont Institute of Robotics Education",
        location: "Fremont, California, United States",
        role: "Executive Director",
        availability: "Open to Summer Intern roles",
        email: "tychoyoung@gmail.com",
    },
    socials: {
        github: "https://github.com/zenocoding",
        linkedin: "https://linkedin.com/in/tycho-young", // Placeholder
    },
    about: {
        bio: "I’m a highly motivated high school student with a strong foundation in software engineering seeking an internship to apply and further develop skills in computer science or AI. I’ve built numerous self-directed projects including MathGPT, a Discord application that combines CAS and LLMs to enhance both. I have strong teamwork, communication, problem-solving, and analytical skills.",
        interests: ["Artificial Intelligence", "Robotics", "Game Development", "Mathematics"],
        headshot: "/photos/head.jpeg",
    },
    gear: [
        { name: "Sony Alpha 6400", type: "Camera" },
        { name: "18-135mm f/3.5-5.6", type: "Lens" }
    ],
    education: [
        {
            school: "BASIS Independent Fremont",
            degree: "High School Diploma",
            date: "Aug 2020 – 2027",
            grade: "11",
            gpa: "4.86",
        },
    ],
    experience: [
        {
            role: "Executive Director",
            company: "Fremont Institute of Robotics Education (FIRE)",
            date: "Aug 2023 – Present",
            location: "Fremont, CA (Hybrid)",
            description:
                "Led STEM education for 50+ students via FIRST Robotics Team 9470. Oversaw training operations, coordinated teamwork to build industrial-sized robots under tight deadlines, and managed fundraising totaling over $60,000.",
            featured: true,
        },
        {
            role: "Game Developer",
            company: "Artix Network",
            date: "Apr 2023 – Jan 2024",
            location: "Remote",
            description:
                "Collaborated with game designers to prototype and implement Java-based game ideas. Translated rough concepts into polished experiences with creative technical solutions.",
            featured: false,
        },
    ],
    projects: [
        {
            title: "Infinite Newton's Cradle",
            description: "A physics demonstration built using Onshape, Breadboard, Arduino, Electromagnets, and basic wiring.",
            tags: ["OnShape", "Arduino", "Electronics", "Physics"],
            date: "Late 2025 - Present",
            featured: false,
        },
        {
            title: "6-Axis Robot Arm",
            description: "Designed and built from scratch using OnShape and 3D printing. Features stepper motors, custom gearboxes, and inverse kinematics control via Klipper.",
            tags: ["OnShape", "Klipper", "Inverse Kinematics", "CNC Machining"],
            image: "/photos/robot_arm.jpg",
            link: "https://cad.onshape.com/documents/4ccfdf4d735854a05c4ab1ac/w/4130b2d9f3bfeb0af790be04/e/e61e094f6d8f847682f9a1c3?renderMode=0&uiState=694b11b9ccf122f7f5b2851f",
            date: "Summer 2025",
            featured: true,
        },
        {
            title: "NHS Garden",
            description: "Wooden garden structure designed in OnShape for NHS. Currently in construction, involving woodworking and assembly.",
            tags: ["OnShape", "Woodworking", "Construction"],
            image: "/photos/nhs_garden.jpg",
            link: "https://cad.onshape.com/documents/d40331c4ca14aaefedf84c09/w/2cfd7cd89fdb87fb8aaa51e5/e/5ba7f069968f848ebc826ba7",
            date: "Aug 2025 - Present",
            featured: true,
        },
        {
            title: "The Yellow Pages",
            description: "A custom full-stack news platform built with Next.js and Firebase. Features a React-based UI, Firestore for real-time article management, and Google Auth for secure student contributions.",
            tags: ["Next.js", "React", "Firestore"],
            link: "https://typ.news",
            repo: "https://github.com/ZenoCoding/yellowpageswebsite",
            image: "/photos/typ.png",
            date: "2024 - Present",
            featured: true,
        },
        {
            title: "AP Physics 1 Spring Energy Project",
            description: "A computational physics project analyzing spring energy conservation and mechanics.",
            tags: ["Python", "Physics", "Computational Modeling"],
            repo: "https://github.com/ZenoCoding/AP-Physics-1",
            paper: "https://github.com/ZenoCoding/AP-Physics-1/blob/master/spring-work-energy/analysis.md",
            image: "/photos/spring_analysis.png",
            date: "May 2024",
            featured: false,
        },
        {
            title: "Dodgeball Minigame",
            description: "A Minecraft minigame prototype with instantiated worlds, queuing systems, and powerups.",
            tags: ["Java", "Minecraft API", "System Design"],
            date: "Early 2024",
            featured: false,
        },
        {
            title: "EMPATH",
            description: "An experiment to prove AI can experience emotion using a chain of LLMs analogous to the human brain. Early implementation of RAG with Pinecone.",
            tags: ["Python", "LangChain", "Pinecone", "RAG"],
            repo: "https://github.com/ZenoCoding/EMPATH",
            paper: "https://tychoyoung.notion.site/EMPATH-5b60a6d427934605b320adc0e909ec47?source=copy_link",
            image: "/photos/empath.png",
            date: "Summer 2023",
            featured: true,
        },
        {
            title: "MathGPT",
            description: "Discord application that combines CAS and LLMs to enhance mathematical problem solving.",
            tags: ["Python", "LLMs", "CAS", "Discord API"],
            repo: "https://github.com/ZenoCoding/MathGPT",
            paper: "https://docs.google.com/document/d/1JSRx4ArHnNyaepVnzyYovBO3OSKnY3CnBVWS2KlXrAw/edit?usp=sharing",
            image: "/photos/mathgpt.png",
            date: "May 2023",
            featured: true,
        },
        {
            title: "EvoCraft",
            description: "Custom Minecraft server plugin using OOP to allow user-defined items, abilities, and bossfights.",
            tags: ["Java", "Minecraft API", "OOP"],
            repo: "https://github.com/ZenoCoding/EvoCraft",
            date: "2022 - 2023",
            featured: false,
        },
    ],
    skills: [
        "Project Management",
        "Team Leadership",
        "Game Design",
        "Java",
        "Python",
        "Software Engineering",
        "AI/ML",
    ],
    honors: [
        {
            title: "International Second Place",
            award: "Quill and Scroll Gallup Awards",
            date: "Aug 2025",
            description:
                "Awarded to student publication “The Yellow Pages” for excellence in journalism and quality reporting.",
        },
        {
            title: "AP Scholar with Distinction",
            award: "College Board",
            date: "Jul 2025",
            description:
                "Granted to students with an average AP score ≥ 3.5 and scores of 3+ on five or more exams.",
        },
        {
            title: "Distinguished Honor Roll",
            award: "BASIS Independent Fremont",
            date: "Jun 2025",
            description:
                "Overall average greater than 95% for the entire school year.",
        },
        {
            title: "Finalist & Alliance Captain",
            award: "Northern California Regional Invitational (FIRST)",
            date: "May 2025",
            description:
                "Awarded to the finalist team at the Northern California Regional Invitational.",
        },
        {
            title: "Student of the Year (Chinese III)",
            award: "BASIS Independent Fremont",
            date: "May 2025",
            description:
                "Awarded to one student in the entire school for subject excellence in Chinese III.",
        },
        {
            title: "Autonomous Award",
            award: "Pinnacles Regional (FIRST)",
            date: "Feb 2025",
            description:
                "Awarded for consistent, reliable, high-performance robot operation during autonomous actions.",
        },
        {
            title: "AP Scholar with Honor",
            award: "College Board",
            date: "Jul 2024",
            description:
                "Granted to students with an average AP score ≥ 3.25 and scores of 3+ on four or more exams.",
        },
        {
            title: "Student of the Year (AP Physics 1)",
            award: "BASIS Independent Fremont",
            date: "May 2024",
            description:
                "Awarded to one student in the entire school for subject excellence in AP Physics 1.",
        },
        {
            title: "Rookie Inspiration Award",
            award: "East Bay Regional (FIRST)",
            date: "Apr 2024",
            description:
                "Celebrates outstanding success in advancing respect and appreciation for engineering within the school and community.",
        },
        {
            title: "Finalist",
            award: "Silicon Valley Regional (FIRST)",
            date: "Feb 2024",
            description:
                "Awarded to the finalist team at the Silicon Valley Regional.",
        },
        {
            title: "Rookie Inspiration Award",
            award: "Silicon Valley Regional (FIRST)",
            date: "Feb 2024",
            description:
                "Celebrates outstanding success in advancing respect and appreciation for engineering within the school and community.",
        },
    ],
    now: {
        status: "Winter Break & Ramp-up Mode",
        location: "Fremont, CA",
        focus: [
            {
                label: "Physics",
                description: "Grinding USAPhO mechanics (Kevin Zhou's handouts are gold).",
            },
            {
                label: "Newspaper",
                description: "Managing the student paper. Graphic design is slow, but meaningful work.",
            },
            {
                label: "Meta-Learning",
                description: "Learning to use AI tools for web dev without losing the 'learning' part.",
            },
            {
                label: "Robotics",
                description: "Prepping for the upcoming FRC season. Things are about to get busy.",
            },
        ],
        reading: [
            { title: "The Three Body Problem", author: "Cixin Liu", status: "reading" },
            { title: "The Character of Physical Law", author: "Richard Feynman", status: "reading" },
            { title: "Shoe Dog", author: "Phil Knight", status: "finished" },
            { title: "One Way", author: "S.J. Morden", status: "finished" },
        ],
        baking: "Cookies with Mama (Winter Break essentials).",
        coolStuff: [
            { title: "Cursed Units", url: "https://www.youtube.com/watch?v=kkfIXUjkYqE", type: "video" },
            { title: "Power Laws", url: "https://www.youtube.com/watch?v=HBluLfX2F_k", type: "video" }
        ],
    },
    photos: [
        {
            url: "/photos/DSC05780.jpeg",
            caption: "afternoon glow on the east coast",
            title: "Road Trip Glow",
            date: "Summer 2025",
            location: "South Carolina",
            details: "Road trips have always been a core part of our family—something about being stuck with people in the car for hours on end, singing songs, bickering with siblings, having conversations and playing games, is just magical."
        },
        {
            url: "/photos/DSC03966.jpeg",
            caption: "reefscape robot in motion",
            title: "Reefscape Action",
            date: "Apr 2025",
            location: "Berkeley, CA",
            details: "Capturing our 2025 robot in motion at the East Bay Regional. The blurred background highlights the speed and precision needed for the Reefscape game."
        },
        {
            url: "/photos/DSC04293.jpeg",
            caption: "discussing leadership",
            title: "The Interview",
            date: "Apr 2025",
            location: "Berkeley, CA",
            details: "I was really nervous leading up to talking in front of everybody, but when I actually did it, I found it natural to speak about my experiences as a leader and as a representative of the team that I had created."
        },
        {
            url: "/photos/news_tabs.jpg",
            caption: "the attention economy",
            title: "You Don't Know the News",
            date: "Nov 2025",
            location: "Digital Landscape",
            link: "https://www.typ.news/posts/2025-11-05_You_Don_t_Know_the_News_It_s_a_Problem",
            details: "\"These days, people don't know the news. They read headlines and envelop themselves in social media feedback loops that support their own worldviews... when we ignore the news, we shut out other human experiences, we shut out other perspectives, and as a result, we shut out our empathy.\""
        },
        {
            url: "/photos/twilight_silhouettes.jpg",
            caption: "finding beauty in darkness",
            title: "Twilight Haze",
            date: "Nov 2025",
            location: "Fremont, CA",
            details: "Sometimes life can feel dramatic, with clouds filling the sky, and dark colors setting as if they portend rain. The weight of it all can feel crushing. A little haze is necessary, however, to create texture and deep color that can make a sunset that much more beautiful."
        },
        {
            url: "/photos/boston_reflection.jpg",
            caption: "urban textures upside down",
            title: "Reflected Reality",
            date: "June 2025",
            location: "Boston, MA",
            details: "What is most obviously reality may in fact be a faceitous.... I'm not really sure what the metaphor is here, I just like puddle photos."
        },
        {
            url: "/photos/sunset_hills.jpg",
            caption: "golden hour at vargas plateau",
            title: "Vargas Plateau",
            date: "Nov 2025",
            location: "Fremont, CA",
            details: "Hiking with my cousins who came up for Thanksgiving. We stopped at the peak to take pictures. This was shot on an iPhone—capturing the stunning sky gradient that lasted for hours over the hills, freshly green from the rain."
        },
        {
            url: "/photos/cookie.jpeg",
            caption: "homemade chocolate chip crinkle cookies",
            title: "Winter Baking",
            date: "Dec 2025",
            location: "Fremont, CA",
            details: "The perfect winter comfort food. These were a little scary to make, but the crinkly, chewy, cookie texture is 100% worth it."
        },

    ],
    testScores: [
        { name: "SAT", score: "1550", date: "Oct 2025" },
        { name: "AP Calculus BC", score: "5", date: "May 2025" },
        { name: "AP English Language & Composition", score: "5", date: "May 2025" },
        { name: "AP Macroeconomics", score: "5", date: "May 2025" },
        { name: "AP Microeconomics", score: "5", date: "May 2025" },
        { name: "AP Physics 1", score: "5", date: "May 2025" },
        { name: "AP Physics 2", score: "5", date: "May 2025" },
        { name: "AP US History", score: "5", date: "May 2025" },
        { name: "AP Calculus AB", score: "5", date: "May 2024" },
        { name: "AP Computer Science A", score: "5", date: "May 2024" },
        { name: "AP US Government & Politics", score: "5", date: "May 2024" },
    ],
};
