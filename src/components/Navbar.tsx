import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    Tycho Young
                </Link>

                <div className={styles.links}>
                    <Link href="/" className={styles.link}>Home</Link>
                    <Link href="/projects" className={styles.link}>Projects</Link>
                    <Link href="/about" className={styles.link}>About</Link>
                    <Link href="/photos" className={styles.link}>Photos</Link>
                    <Link href="/contact" className={styles.button}>Contact</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
