import Link from "next/link";
import styles from "./page.module.css";

const plannedEvents = [
  {
    id: 1,
    title: "Ferry Building Farmers Market",
    time: "10:00 AM",
    endTime: "12:00 PM",
    date: "Saturday, Mar 15",
    location: "Ferry Building, San Francisco, CA",
    tag: "Food",
    price: "Free",
    description:
      "One of San Francisco's most beloved outdoor markets. Browse over 100 local vendors offering fresh produce, artisan foods, and handmade goods along the Embarcadero waterfront.",
    tips: "Arrive early for the best selection. Try the Blue Bottle Coffee and Acme Bread Company stalls.",
  },
  {
    id: 2,
    title: "Golden Gate Park Art Walk",
    time: "12:30 PM",
    endTime: "2:30 PM",
    date: "Saturday, Mar 15",
    location: "Golden Gate Park, San Francisco, CA",
    tag: "Outdoor",
    price: "Free",
    description:
      "A self-guided walk through Golden Gate Park's outdoor sculptures and installations. The park features rotating public art from local and international artists.",
    tips: "Wear comfortable shoes. The walk covers about 2 miles across the park's main paths.",
  },
  {
    id: 3,
    title: "SFMOMA Guided Tour",
    time: "3:00 PM",
    endTime: "5:00 PM",
    date: "Saturday, Mar 15",
    location: "151 3rd St, San Francisco, CA",
    tag: "Art",
    price: "$25",
    description:
      "A 2-hour guided tour through SFMOMA's permanent collection and current exhibitions, led by a knowledgeable docent. Covers modern and contemporary art across seven floors.",
    tips: "Tours depart from the main lobby. Book tickets online to skip the line.",
  },
  {
    id: 4,
    title: "Jazz Night at The Blue Room",
    time: "8:00 PM",
    endTime: "10:00 PM",
    date: "Saturday, Mar 15",
    location: "The Blue Room, San Francisco, CA",
    tag: "Music",
    price: "$25",
    description:
      "Live jazz performance featuring a rotating lineup of local and visiting musicians. The Blue Room is one of SF's most intimate jazz venues with a full cocktail bar.",
    tips: "Doors open at 7:30 PM. Reservations recommended on weekends.",
  },
];

export default function PlannedPage() {
  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div className={styles.headerContent}>
          <p className={styles.eyebrow}>Your Itinerary</p>
          <h1 className={styles.title}>Saturday in San Francisco</h1>
          <p className={styles.subtitle}>
            {plannedEvents.length} activities · {plannedEvents[0].date}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/planned/edit" className={styles.secondaryBtn}>Edit Plan</Link>
          <button className={styles.primaryBtn}>Export Calendar</button>
        </div>
      </section>

      <div className={styles.layout}>
        {/* Timeline */}
        <section className={styles.timeline}>
          {plannedEvents.map((event, i) => (
            <div key={event.id} className={styles.timelineItem}>
              <div className={styles.timelineLeft}>
                <span className={styles.timelineTime}>{event.time}</span>
                {i < plannedEvents.length - 1 && (
                  <div className={styles.timelineLine} />
                )}
              </div>

              <article className={styles.eventCard}>
                <div className={styles.cardTop}>
                  <span className={styles.tag}>{event.tag}</span>
                  <span className={styles.price}>{event.price}</span>
                </div>

                <h2 className={styles.eventTitle}>{event.title}</h2>

                <div className={styles.eventMeta}>
                  <span>{event.time} – {event.endTime}</span>
                  <span>{event.location}</span>
                </div>

                <p className={styles.description}>{event.description}</p>

                <div className={styles.tips}>
                  <span className={styles.tipsLabel}>Tips</span>
                  <p>{event.tips}</p>
                </div>
              </article>
            </div>
          ))}
        </section>

        {/* Summary sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Plan Summary</h3>

            <div className={styles.summaryList}>
              {plannedEvents.map((event) => (
                <div key={event.id} className={styles.summaryItem}>
                  <span className={styles.summaryTime}>{event.time}</span>
                  <span className={styles.summaryName}>{event.title}</span>
                </div>
              ))}
            </div>

            <div className={styles.divider} />

            <div className={styles.totalCost}>
              <span>Estimated Cost</span>
              <span className={styles.costAmount}>$50+</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
