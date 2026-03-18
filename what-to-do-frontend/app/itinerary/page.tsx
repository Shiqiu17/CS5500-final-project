"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import { useAuth } from "../contexts/AuthContext";

// All client-side fetches go through the Next.js rewrite proxy at /api/*.
const API_BASE_URL = "/api";

type HistoryItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  summary: string;
  preference: "Indoor" | "Outdoor" | "Mixed";
};

type SavedEventApiItem = {
  id: number;
  user_id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  tag: string;
  price: string;
  saved_at: string;
};

function getAuthHeaders(token: string | null): Record<string, string> {
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function mapTagToPreference(tag: string): "Indoor" | "Outdoor" | "Mixed" {
  const normalized = tag.toLowerCase();

  if (normalized.includes("indoor")) {
    return "Indoor";
  }

  if (normalized.includes("outdoor")) {
    return "Outdoor";
  }

  return "Mixed";
}

export default function ItineraryPage() {
  const { isLoggedIn, isLoading, token } = useAuth();

  const [search, setSearch] = useState("");
  const [preferenceFilter, setPreferenceFilter] = useState("All");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadItineraries() {
      if (!isLoggedIn || !token) {
        setItems([]);
        return;
      }

      setIsFetching(true);

      try {
        const response = await fetch(`${API_BASE_URL}/saved`, {
          method: "GET",
          headers: {
            ...getAuthHeaders(token),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch saved itineraries");
        }

        const data: SavedEventApiItem[] = await response.json();

        const mappedItems: HistoryItem[] = data.map((item) => ({
          id: String(item.id),
          title: item.title,
          date: item.date,
          location: item.location,
          summary: `${item.time} • ${item.tag} • ${item.price}`,
          preference: mapTagToPreference(item.tag),
        }));

        setItems(mappedItems);
      } catch (error) {
        console.error("Failed to load itineraries:", error);
        setItems([]);
      } finally {
        setIsFetching(false);
      }
    }

    if (!isLoading) {
      loadItineraries();
    }
  }, [isLoggedIn, isLoading, token]);

  async function handleDeleteItinerary(itemId: string) {
    if (!token) {
      alert("Please log in to delete saved plans.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this saved itinerary?",
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingId(itemId);

    try {
      const response = await fetch(`${API_BASE_URL}/saved/${itemId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(token),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete saved itinerary");
      }

      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Failed to delete itinerary:", error);
      alert("Something went wrong while deleting the itinerary.");
    } finally {
      setIsDeletingId(null);
    }
  }

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

          {!isLoggedIn ? (
            <div className={styles.emptyState}>
              <h3>No saved itineraries</h3>
              <p>Please log in to view your saved plans.</p>
            </div>
          ) : isLoading || isFetching ? (
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
              {filteredItems.map((item) => {
                const isDeleting = isDeletingId === item.id;

                return (
                  <article key={item.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div>
                        <h3>{item.title}</h3>
                        <p className={styles.summary}>{item.summary}</p>
                      </div>

                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleDeleteItinerary(item.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>

                    <div className={styles.metaRow}>
                      <span className={styles.metaPill}>{item.date}</span>
                      <span className={styles.metaPill}>{item.location}</span>
                      <span className={styles.metaPill}>{item.preference}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
