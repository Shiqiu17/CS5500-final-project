import styles from "./page.module.css";

const savedEvents = [
  {
    id: 1,
    title: "Jazz Night at The Blue Room",
    date: "Sat, Mar 15",
    time: "8:00 PM",
    location: "San Francisco, CA",
    tag: "Music",
    price: "$25",
  },
  {
    id: 2,
    title: "Ferry Building Farmers Market",
    date: "Sun, Mar 16",
    time: "10:00 AM",
    location: "San Francisco, CA",
    tag: "Food",
    price: "Free",
  },
  {
    id: 3,
    title: "Golden Gate Park Art Walk",
    date: "Sat, Mar 22",
    time: "11:00 AM",
    location: "San Francisco, CA",
    tag: "Outdoor",
    price: "Free",
  },
];

export default function SavedPage() {
  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <p className={styles.eyebrow}>My Collection</p>
          <h1 className={styles.title}>Saved Events</h1>
          <p className={styles.subtitle}>
            Events you've bookmarked for later.
          </p>
        </div>
        <div className={styles.count}>
          <span className={styles.countNumber}>{savedEvents.length}</span>
          <span className={styles.countLabel}>saved</span>
        </div>
      </section>

      {savedEvents.length === 0 ? (
        <section className={styles.empty}>
          <h2>No saved events yet</h2>
          <p>When you save events from your itinerary, they'll appear here.</p>
        </section>
      ) : (
        <section className={styles.grid}>
          {savedEvents.map((event) => (
            <article key={event.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.tag}>{event.tag}</span>
                <button className={styles.removeBtn} aria-label="Remove from saved">✕</button>
              </div>
              <h3 className={styles.cardTitle}>{event.title}</h3>
              <div className={styles.cardMeta}>
                <span>{event.date} · {event.time}</span>
                <span>{event.location}</span>
                <span>{event.price}</span>
              </div>
              <button className={styles.viewBtn}>View Details</button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
