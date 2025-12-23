export const portfolio = {
    personalInfo: {
        name: "Tycho Young",
        tagline: "Student at BASIS Independent Fremont; Co Executive Director at FIRE",
        location: "Fremont, California, United States",
        role: "Co Executive Director",
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
    },
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
            role: "Co Executive Director",
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
            title: "MathGPT",
            description: "Discord application that combines CAS and LLMs to enhance mathematical problem solving.",
            tags: ["Python", "LLMs", "CAS", "Discord API"],
            featured: true,
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
        baking: "Cookies with Mom (Winter Break essentials).",
    },
    photos: [
        {
            url: "/photos/sunset_hills.jpg",
            caption: "Golden hour hiking at Vargas Plateau.",
            title: "Vargas Plateau",
            date: "Nov 2025",
            details: "Hiking with my cousins who came up for Thanksgiving. We stopped at the peak to take pictures. This was shot on an iPhone—capturing the stunning sky gradient that lasted for hours over the hills, freshly green from the rain."
        },
        {
            url: "/photos/cookie.jpeg",
            caption: "Chocolate Chip Crinkle Cookies baked at home.",
            title: "Winter Baking",
            date: "Dec 2025",
            details: "The perfect winter comfort food. These were a little scary to make, but the crinkly, chewy, cookie texture is 100% worth it."
        },
        {
            url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=2669&auto=format&fit=crop",
            caption: "Alt-F4 (FRC 9470) - 2024 Season",
            title: "Alt-F4",
            date: "Mar 2024",
            details: "Our 2024 competition robot for the FIRST Robotics 'Crescendo' game. Features a high-speed note shooter and swerve drive for omnidirectional movement. I led the autonomous pathfinding code."
        },
        {
            url: "https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=2670&auto=format&fit=crop",
            caption: "First competition match",
            title: "Silicon Valley Regional",
            date: "Feb 2024",
            details: "The tension before the first match is unmatched. We spent weeks debugging loop times and motor controllers, but watching it drive flawlessly on the field made it all worth it."
        },
        {
            url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2670&auto=format&fit=crop",
            caption: "Web Development",
            title: "Late Night Code",
            date: "Jan 2024",
            details: "Building the architecture for a new React project. There's something peaceful about coding at 2 AM when the world is quiet and it's just you and the logic."
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
