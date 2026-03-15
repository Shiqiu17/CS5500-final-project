"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type AuthUser = {
  id: string;
} | null;

type HistoryItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  summary: string;
  preference: "Indoor" | "Outdoor" | "Mixed";
};

export default function ItineraryPage() {
  const [search, setSearch] = useState("");
  const [preferenceFilter, setPreferenceFilter] = useState("All");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Replace this with real auth state later
  const [user] = useState<AuthUser>({
    id: "user_123",
  });

  useEffect(() => {
    async function loadItineraries() {
      if (!user?.id) {
        setItems([]);
        return;
      }

      setIsLoading(true);

      try {
        // TODO: Replace this with real API call to fetch itineraries for the user
        // const response = await fetch(`/api/itineraries?userId=${user.id}`);
        // if (!response.ok) {
        //   throw new Error("Failed to fetch itineraries");
        // }
        // const data: HistoryItem[] = await response.json();
        // setItems(data);

        const mockData: HistoryItem[] = [
          {
            id: "1",
            title: "Weekend Plan in San Francisco",
            date: "2026-03-14",
            location: "San Francisco",
            summary: "Outdoor-focused day with food, art, and scenic stops.",
            preference: "Outdoor",
          },
          {
            id: "2",
            title: "Sunday Plan in Berkeley",
            date: "2026-03-21",
            location: "Berkeley",
            summary: "Relaxed indoor and cafe itinerary with flexible timing.",
            preference: "Indoor",
          },
          {
            id: "3",
            title: "Day Plan in Palo Alto",
            date: "2026-03-28",
            location: "Palo Alto",
            summary: "Nature walk, lunch stop, and evening activity.",
            preference: "Mixed",
          },
          {
            id: "4",
            title: "Saturday Plan in San Jose",
            date: "2026-04-04",
            location: "San Jose",
            summary: "Museum visit, lunch, and evening downtown walk.",
            preference: "Mixed",
          },
        ];

        setItems(mockData);
      } catch (error) {
        console.error("Failed to load itineraries:", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadItineraries();
  }, [user]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.summary.toLowerCase().includes(search.toLowerCase());

      const matchesPreference =
        preferenceFilter === "All" || item.preference === preferenceFilter;

      return matchesSearch && matchesPreference;
    });
  }, [items, search, preferenceFilter]);

  return (
    <main className={styles.page}>
      <section className={styles.headerSection}>
        <p className={styles.eyebrow}>Itinerary History</p>
        <h1 className={styles.title}>Your saved plans</h1>
        <p className={styles.subtitle}>
          Browse previously generated itineraries and filter them by keyword or
          preference.
        </p>
      </section>

      <section className={styles.contentGrid}>
        <aside className={styles.filterCard}>
          <h2 className={styles.filterTitle}>Filters</h2>

          <div className={styles.fieldGroup}>
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search by title"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="preference">Preference</label>
            <select
              id="preference"
              value={preferenceFilter}
              onChange={(event) => setPreferenceFilter(event.target.value)}
            >
              <option value="All">All</option>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <button
            type="button"
            className={styles.resetButton}
            onClick={() => {
              setSearch("");
              setPreferenceFilter("All");
            }}
          >
            Reset Filters
          </button>
        </aside>

        <section className={styles.listSection}>
          <div className={styles.resultsHeader}>
            <h2>Results</h2>
            <span className={styles.resultsCount}>
              {filteredItems.length} plan{filteredItems.length === 1 ? "" : "s"}
            </span>
          </div>

          {!user ? (
            <div className={styles.emptyState}>
              <h3>No saved itineraries</h3>
              <p>Please log in to view your saved plans.</p>
            </div>
          ) : isLoading ? (
            <div className={styles.emptyState}>
              <h3>Loading itineraries</h3>
              <p>Please wait while your saved plans are loading.</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No itineraries found</h3>
              <p>Try changing your filters or search terms.</p>
            </div>
          ) : (
            <div className={styles.cardList}>
              {filteredItems.map((item) => (
                <article key={item.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <h3>{item.title}</h3>
                      <p className={styles.summary}>{item.summary}</p>
                    </div>
                  </div>

                  <div className={styles.metaRow}>
                    <span className={styles.metaPill}>{item.date}</span>
                    <span className={styles.metaPill}>{item.location}</span>
                    <span className={styles.metaPill}>{item.preference}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
