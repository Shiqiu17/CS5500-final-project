import Link from "next/link";
import styles from "./MainNav.module.css";

export default function MainNav() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          YourBrand
        </Link>
        <nav className={styles.nav}>
          <Link href="/" className={styles.link}>
            Home
          </Link>
          <Link href="/planner" className={styles.link}>
            Planner
          </Link>
          <Link href="/saved" className={styles.link}>
            Saved
          </Link>
          <Link href="/itinerary" className={styles.link}>
            History
          </Link>
          <Link href="/login" className={styles.link}>
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}