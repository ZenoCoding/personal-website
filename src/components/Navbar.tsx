'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();

        if (pathname === '/') {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', `#${id}`);
            }
        } else {
            router.push(`/#${id}`);
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    Tycho Young
                </Link>

                <div className={styles.links}>
                    <Link href="/" className={styles.link}>Home</Link>
                    <a href="#projects" onClick={(e) => handleScroll(e, 'projects')} className={styles.link}>Projects</a>
                    <a href="#about" onClick={(e) => handleScroll(e, 'about')} className={styles.link}>About</a>
                    <Link href="/photos" className={styles.link}>Photos</Link>
                    <a href="#contact" onClick={(e) => handleScroll(e, 'contact')} className={styles.button}>Contact</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
