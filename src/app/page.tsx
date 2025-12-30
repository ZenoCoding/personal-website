
import Hero from "@/components/Hero";
import Projects from "@/components/sections/Projects";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import SectionNavigation from "@/components/SectionNavigation";

export default function Home() {
  return (
    <main>
      <SectionNavigation />
      <Hero />
      <Projects />
      <About />
      <Contact />
    </main>
  );
}
