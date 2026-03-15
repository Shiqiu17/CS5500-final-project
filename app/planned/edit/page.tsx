"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const initialEvents = [
  {
    id: 1,
    title: "Ferry Building Farmers Market",
    time: "10:00 AM",
    endTime: "12:00 PM",
    location: "Ferry Building, San Francisco, CA",
    tag: "Food",
    price: "Free",
  },
  {
    id: 2,
    title: "Golden Gate Park Art Walk",
    time: "12:30 PM",
    endTime: "2:30 PM",
    location: "Golden Gate Park, San Francisco, CA",
    tag: "Outdoor",
    price: "Free",
  },
  {
    id: 3,
    title: "SFMOMA Guided Tour",
    time: "3:00 PM",
    endTime: "5:00 PM",
    location: "151 3rd St, San Francisco, CA",
    tag: "Art",
    price: "$25",
  },
  {
    id: 4,
    title: "Jazz Night at The Blue Room",
    time: "8:00 PM",
    endTime: "10:00 PM",
    location: "The Blue Room, San Francisco, CA",
    tag: "Music",
    price: "$25",
  },
];

type Event = (typeof initialEvents)[0];

export default function EditPlanPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const router = useRouter();

  const remove = (id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setEvents((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === events.length - 1) return;
    setEvents((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Edit Itinerary</p>
          <h1 className={styles.title}>Modify Your Plan</h1>
          <p className={styles.subtitle}>Remove or reorder activities.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.cancelBtn} onClick={() => router.push("/planned")}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={() => router.push("/planned")}>
            Save Changes
          </button>
        </div>
      </section>

      {events.length === 0 ? (
        <div className={styles.empty}>
          <h2>No activities in your plan</h2>
          <p>Go back to the planner to add activities.</p>
          <button className={styles.saveBtn} onClick={() => router.push("/planner")}>
            Go to Planner
          </button>
        </div>
      ) : (
        <section className={styles.list}>
          {events.map((event, i) => (
            <article key={event.id} className={styles.card}>
              <div className={styles.orderControls}>
                <button
                  className={styles.orderBtn}
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  aria-label="Move up"
                >
                  ▲
                </button>
                <span className={styles.orderNumber}>{i + 1}</span>
                <button
                  className={styles.orderBtn}
                  onClick={() => moveDown(i)}
                  disabled={i === events.length - 1}
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>

              <div className={styles.cardInfo}>
                <div className={styles.cardTop}>
                  <span className={styles.tag}>{event.tag}</span>
                  <span className={styles.price}>{event.price}</span>
                </div>
                <h3 className={styles.cardTitle}>{event.title}</h3>
                <div className={styles.cardMeta}>
                  <span>{event.time} – {event.endTime}</span>
                  <span>{event.location}</span>
                </div>
              </div>

              <button
                className={styles.removeBtn}
                onClick={() => remove(event.id)}
              >
                Remove
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
