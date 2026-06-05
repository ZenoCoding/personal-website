import AboutSection from "@/components/sections/About";

export const metadata = {
    title: "About | Tycho Young",
    description: "Learn more about Tycho Young - student, developer, and robotics leader.",
};

export default function AboutPage() {
    return (
        <main>
            <div className="grid-bg" />
            <AboutSection />
        </main>
    );
}
