import Link from "next/link";
import styles from "./MainNav.module.css";

export default function MainNav() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          What To Do
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.link}>
            Home
          </Link>
          <Link href="/itinerary" className={styles.link}>
            Itinerary
          </Link>
        </nav>
      </div>
    </header>
  );
}
