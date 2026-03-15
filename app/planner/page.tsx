"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const recommendedEvents = [
  {
    id: 1,
    title: "Ferry Building Farmers Market",
    time: "10:00 AM",
    endTime: "12:00 PM",
    duration: "2 hrs",
    location: "Ferry Building, SF",
    tag: "Food",
    price: "Free",
  },
  {
    id: 2,
    title: "Golden Gate Park Art Walk",
    time: "11:00 AM",
    endTime: "1:00 PM",
    duration: "2 hrs",
    location: "Golden Gate Park, SF",
    tag: "Outdoor",
    price: "Free",
  },
  {
    id: 3,
    title: "Jazz Night at The Blue Room",
    time: "8:00 PM",
    endTime: "10:00 PM",
    duration: "2 hrs",
    location: "The Blue Room, SF",
    tag: "Music",
    price: "$25",
  },
  {
    id: 4,
    title: "SFMOMA Guided Tour",
    time: "2:00 PM",
    endTime: "4:00 PM",
    duration: "2 hrs",
    location: "SFMOMA, SF",
    tag: "Art",
    price: "$25",
  },
  {
    id: 5,
    title: "Chinatown Food Tour",
    time: "12:30 PM",
    endTime: "2:30 PM",
    duration: "2 hrs",
    location: "Chinatown, SF",
    tag: "Food",
    price: "$45",
  },
];

type Event = (typeof recommendedEvents)[0];

export default function PlannerPage() {
  const [selected, setSelected] = useState<Event[]>([]);
  const router = useRouter();

  const toggle = (event: Event) => {
    setSelected((prev) =>
      prev.find((e) => e.id === event.id)
        ? prev.filter((e) => e.id !== event.id)
        : [...prev, event]
    );
  };

  const isSelected = (id: number) => selected.some((e) => e.id === id);

  const sorted = [...selected].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Plan Builder</p>
        <h1 className={styles.title}>Build Your Day</h1>
        <p className={styles.subtitle}>
          Select activities to combine into your personal itinerary.
        </p>
      </section>

      <div className={styles.layout}>
        {/* Left: Event List */}
        <section className={styles.eventList}>
          <h2 className={styles.sectionTitle}>Recommended Activities</h2>
          {recommendedEvents.map((event) => (
            <article
              key={event.id}
              className={`${styles.eventCard} ${isSelected(event.id) ? styles.eventCardSelected : ""}`}
              onClick={() => toggle(event)}
            >
              <div className={styles.checkbox}>
                {isSelected(event.id) && <span className={styles.checkmark}>✓</span>}
              </div>
              <div className={styles.eventInfo}>
                <div className={styles.eventTop}>
                  <span className={styles.tag}>{event.tag}</span>
                  <span className={styles.price}>{event.price}</span>
                </div>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <div className={styles.eventMeta}>
                  <span>{event.time} – {event.endTime}</span>
                  <span>{event.location}</span>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Right: Your Plan */}
        <section className={styles.planPanel}>
          <div className={styles.planHeader}>
            <h2 className={styles.sectionTitle}>Your Plan</h2>
            <span className={styles.selectedCount}>{selected.length} selected</span>
          </div>

          {sorted.length === 0 ? (
            <div className={styles.emptyPlan}>
              <p>Select activities on the left to build your plan.</p>
            </div>
          ) : (
            <div className={styles.timeline}>
              {sorted.map((event, i) => (
                <div key={event.id} className={styles.timelineItem}>
                  <div className={styles.timelineLeft}>
                    <span className={styles.timelineTime}>{event.time}</span>
                    {i < sorted.length - 1 && <div className={styles.timelineLine} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <h4 className={styles.timelineTitle}>{event.title}</h4>
                    <p className={styles.timelineMeta}>{event.duration} · {event.location}</p>
                    <button
                      className={styles.removeBtn}
                      onClick={(e) => { e.stopPropagation(); toggle(event); }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sorted.length > 0 && (
            <button className={styles.saveBtn} onClick={() => router.push("/planned")}>Save Plan</button>
          )}
        </section>
      </div>
    </main>
  );
}
