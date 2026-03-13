import styles from "./page.module.css";

const itineraryItems = [
  {
    time: "09:30 AM",
    title: "Coffee and light breakfast",
    description: "Start the day at a nearby cafe with a relaxed morning setup.",
    tag: "Food",
  },
  {
    time: "11:00 AM",
    title: "Outdoor walk and local exploration",
    description:
      "Visit a park, waterfront, or neighborhood spot that matches the user preference.",
    tag: "Outdoor",
  },
  {
    time: "01:30 PM",
    title: "Lunch reservation",
    description:
      "Choose a place based on cuisine preference, budget, and distance.",
    tag: "Dining",
  },
  {
    time: "03:30 PM",
    title: "Weekend event or activity",
    description:
      "Attend a selected event pulled from event sources and ranked by fit.",
    tag: "Event",
  },
  {
    time: "06:30 PM",
    title: "Dinner and evening plan",
    description: "Wrap up the day with a social or relaxing activity nearby.",
    tag: "Evening",
  },
];

export default function ItineraryPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Weekend Planner</p>
          <h1>Your Suggested Itinerary</h1>
          <p className={styles.description}>
            This page can display ranked activities, timing, and a structured
            plan generated from user preferences.
          </p>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Plan Summary</span>
          <h2>Saturday in San Francisco</h2>
          <p>
            Outdoor-focused, medium budget, walkable schedule, food included.
          </p>
        </div>
      </section>

      <section className={styles.contentGrid}>
        <aside className={styles.filterCard}>
          <h3>Filters</h3>

          <div className={styles.filterGroup}>
            <label>Location</label>
            <input type="text" placeholder="Enter city" />
          </div>

          <div className={styles.filterGroup}>
            <label>Time Range</label>
            <input type="text" placeholder="Saturday 10:00 AM - 8:00 PM" />
          </div>

          <div className={styles.filterGroup}>
            <label>Preference</label>
            <select defaultValue="Outdoor">
              <option>Outdoor</option>
              <option>Indoor</option>
              <option>Mixed</option>
            </select>
          </div>

          <button className={styles.actionButton}>Regenerate Plan</button>
        </aside>

        <section className={styles.timelineCard}>
          <div className={styles.timelineHeader}>
            <div>
              <p className={styles.eyebrow}>Generated Schedule</p>
              <h3>Daily Timeline</h3>
            </div>

            <button className={styles.secondaryButton}>Export ICS</button>
          </div>

          <div className={styles.timeline}>
            {itineraryItems.map((item) => (
              <article
                key={`${item.time}-${item.title}`}
                className={styles.item}
              >
                <div className={styles.time}>{item.time}</div>

                <div className={styles.itemContent}>
                  <div className={styles.itemTopRow}>
                    <h4>{item.title}</h4>
                    <span className={styles.tag}>{item.tag}</span>
                  </div>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
