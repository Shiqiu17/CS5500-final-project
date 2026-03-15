"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import styles from "./page.module.css";

const features = [
  "Smart recommendations",
  "Event discovery",
  "Generated itineraries",
  "Calendar export",
];

type PlannerFormData = {
  location: string;
  date: string;
  timeRange: string;
  budget: string;
  preference: string;
  interests: string;
};

type PlannerRequestPayload = {
  location: string;
  date: string;
  timeRange: string;
  budget: number | null;
  preference: string;
  interests: string[];
};

type ItineraryActivity = {
  id: string;
  time: string;
  location: string;
  activity: string;
  activityType: string;
  price: number | null;
  info: string;
  website?: string;
};

type ItineraryResponse = {
  title: string;
  date: string;
  city: string;
  summary: string;
  activities: ItineraryActivity[];
};

export default function HomePage() {
  const [formData, setFormData] = useState<PlannerFormData>({
    location: "",
    date: "",
    timeRange: "",
    budget: "",
    preference: "Mixed",
    interests: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ItineraryResponse | null>(null);
  const [savedActivityIds, setSavedActivityIds] = useState<string[]>([]);
  const [isLoggedIn] = useState(false);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function buildPayload(data: PlannerFormData): PlannerRequestPayload {
    return {
      location: data.location.trim(),
      date: data.date,
      timeRange: data.timeRange.trim(),
      budget: data.budget === "" ? null : Number(data.budget),
      preference: data.preference,
      interests: data.interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
  }

  function formatPrice(price: number | null) {
    if (price === null) return "N/A";
    if (price === 0) return "Free";
    return `$${price}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = buildPayload(formData);

    try {
      console.log("Planner payload:", payload);

      const mockResponse: ItineraryResponse = {
        title: `Plan for ${payload.location || "Your Day"}`,
        date: payload.date,
        city: payload.location || "Selected city",
        summary:
          "A personalized itinerary generated from your preferences, budget, and interests.",
        activities: [
          {
            id: "1",
            time: "10:00 AM",
            location: "Blue Bottle Coffee",
            activity: "Coffee and breakfast",
            activityType: "Food",
            price: 18,
            info: "A casual breakfast stop with coffee and light options.",
            website: "https://example.com/coffee",
          },
          {
            id: "2",
            time: "12:30 PM",
            location: payload.location || "Downtown area",
            activity: "Explore a local market",
            activityType: "Market",
            price: 0,
            info: "A walkable stop with vendors, snacks, and local shops.",
            website: "https://example.com/market",
          },
          {
            id: "3",
            time: "3:00 PM",
            location: payload.location || "Park district",
            activity: "Afternoon outdoor activity",
            activityType: payload.preference,
            price: payload.budget ? Math.min(payload.budget, 30) : 25,
            info: "A flexible activity selected from your preferences and time range.",
            website: "https://example.com/activity",
          },
        ],
      };

      setResult(mockResponse);
      setSavedActivityIds([]);

      // TODO: Replace this with real API call
      // const response = await fetch("http://localhost:8000/api/plan", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(payload),
      // });
      //
      // if (!response.ok) {
      //   throw new Error("Failed to generate itinerary");
      // }
      //
      // const data: ItineraryResponse = await response.json();
      // setResult(data);
      // setSavedActivityIds([]);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Something went wrong while generating the itinerary.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleToggleSave(activity: ItineraryActivity) {
    if (!isLoggedIn) {
      alert("Please log in to save activities.");
      return;
    }

    const isSaved = savedActivityIds.includes(activity.id);

    if (isSaved) {
      console.log("Remove saved activity:", activity.id);

      // TODO: backend api call

      setSavedActivityIds((prev) =>
        prev.filter((savedId) => savedId !== activity.id),
      );
      return;
    }

    const savePayload = {
      id: activity.id,
      date: result?.date ?? "",
      city: result?.city ?? "",
      time: activity.time,
      location: activity.location,
      activity: activity.activity,
      activityType: activity.activityType,
      price: activity.price,
      info: activity.info,
      website: activity.website ?? "",
    };

    console.log("Save activity:", savePayload);

    // TODO: backend api call

    setSavedActivityIds((prev) => [...prev, activity.id]);
  }

  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>AI Activity Planner</div>

          <h1 className={styles.title}>
            Plan your free time with less effort.
          </h1>

          <p className={styles.subtitle}>
            Discover activities and generate a clean itinerary based on your
            preferences.
          </p>

          <div className={styles.featureList}>
            {features.map((feature) => (
              <span key={feature} className={styles.featurePill}>
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <p className={styles.formEyebrow}>Start Planning</p>
            <h2>Create Your Plan</h2>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="Enter city or area"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className={styles.twoColumn}>
              <div className={styles.fieldGroup}>
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="timeRange">Time Range</label>
                <input
                  id="timeRange"
                  name="timeRange"
                  type="text"
                  placeholder="10:00 AM - 8:00 PM"
                  value={formData.timeRange}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.twoColumn}>
              <div className={styles.fieldGroup}>
                <label htmlFor="budget">Budget</label>
                <input
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder="50"
                  min="0"
                  value={formData.budget}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="preference">Preference</label>
                <select
                  id="preference"
                  name="preference"
                  value={formData.preference}
                  onChange={handleChange}
                >
                  <option>Indoor</option>
                  <option>Outdoor</option>
                  <option>Mixed</option>
                </select>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="interests">Interests</label>
              <input
                id="interests"
                name="interests"
                type="text"
                placeholder="Food, art, music, nature"
                value={formData.interests}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Preparing..." : "Generate Itinerary"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {result && (
        <section className={styles.resultSection}>
          <div className={styles.resultHeader}>
            <p className={styles.formEyebrow}>Generated Itinerary</p>
            <h2 className={styles.resultTitle}>{result.title}</h2>
            <p className={styles.resultSubtitle}>{result.summary}</p>
          </div>

          <div className={styles.resultMeta}>
            <span className={styles.metaPill}>{result.date || "No date"}</span>
            <span className={styles.metaPill}>{result.city || "No city"}</span>
            <span className={styles.metaPill}>
              {result.activities.length} activities
            </span>
          </div>

          <div className={styles.resultList}>
            {result.activities.map((activity) => {
              const isSaved = savedActivityIds.includes(activity.id);

              return (
                <article key={activity.id} className={styles.resultCard}>
                  <div className={styles.resultTime}>{activity.time}</div>

                  <div className={styles.resultContent}>
                    <div className={styles.resultTopRow}>
                      <div>
                        <h3>{activity.activity}</h3>
                        <p className={styles.resultCategory}>
                          {activity.activityType}
                        </p>
                      </div>

                      <div className={styles.resultRight}>
                        <span className={styles.resultCost}>
                          {formatPrice(activity.price)}
                        </span>

                        <button
                          type="button"
                          className={
                            isSaved ? styles.savedButton : styles.saveButton
                          }
                          onClick={() => handleToggleSave(activity)}
                        >
                          {!isLoggedIn
                            ? "Log in to save"
                            : isSaved
                              ? "Remove"
                              : "Save"}
                        </button>
                      </div>
                    </div>

                    <p className={styles.resultAddress}>
                      <span>Location:</span> {activity.location}
                    </p>

                    <p className={styles.resultDescription}>{activity.info}</p>

                    {activity.website && (
                      <a
                        href={activity.website}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.websiteLink}
                      >
                        Visit website
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
