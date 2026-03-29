"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import styles from "./page.module.css";
import { useAuth } from "./contexts/AuthContext";

// Base URL for all backend API calls (proxied through Next.js to avoid CORS)
const API_BASE_URL = "/api";

// Key used to persist the itinerary form state and results across page refreshes
const ITINERARY_STORAGE_KEY = "planner_home_itinerary";

// Feature highlights shown on the left hero panel
const features = ["Smart recommendations", "Event discovery", "Generated itineraries", "Calendar export"];

// Static list of major US cities used for location autocomplete suggestions.
// Entries follow the format "City, STATE_ABBR" so the UI can split and style them separately.
const US_CITIES = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC",
  "Indianapolis, IN", "San Francisco, CA", "Seattle, WA", "Denver, CO", "Nashville, TN",
  "Oklahoma City, OK", "El Paso, TX", "Washington, DC", "Las Vegas, NV", "Louisville, KY",
  "Memphis, TN", "Portland, OR", "Baltimore, MD", "Milwaukee, WI", "Albuquerque, NM",
  "Tucson, AZ", "Fresno, CA", "Sacramento, CA", "Mesa, AZ", "Kansas City, MO",
  "Atlanta, GA", "Omaha, NE", "Colorado Springs, CO", "Raleigh, NC", "Long Beach, CA",
  "Virginia Beach, VA", "Minneapolis, MN", "Tampa, FL", "New Orleans, LA", "Arlington, TX",
  "Bakersfield, CA", "Honolulu, HI", "Anaheim, CA", "Aurora, CO", "Santa Ana, CA",
  "Corpus Christi, TX", "Riverside, CA", "St. Louis, MO", "Lexington, KY", "Pittsburgh, PA",
  "Stockton, CA", "Anchorage, AK", "Cincinnati, OH", "St. Paul, MN", "Greensboro, NC",
  "Toledo, OH", "Newark, NJ", "Plano, TX", "Henderson, NV", "Orlando, FL",
  "Lincoln, NE", "Jersey City, NJ", "Chandler, AZ", "St. Petersburg, FL", "Laredo, TX",
  "Norfolk, VA", "Madison, WI", "Durham, NC", "Lubbock, TX", "Winston-Salem, NC",
  "Garland, TX", "Glendale, AZ", "Hialeah, FL", "Reno, NV", "Baton Rouge, LA",
  "Irvine, CA", "Chesapeake, VA", "Irving, TX", "Scottsdale, AZ", "North Las Vegas, NV",
  "Fremont, CA", "Gilbert, AZ", "San Bernardino, CA", "Birmingham, AL", "Rochester, NY",
  "Richmond, VA", "Spokane, WA", "Des Moines, IA", "Montgomery, AL", "Modesto, CA",
  "Fayetteville, NC", "Tacoma, WA", "Shreveport, LA", "Fontana, CA", "Moreno Valley, CA",
  "Glendale, CA", "Akron, OH", "Huntington Beach, CA", "Little Rock, AR", "Columbus, GA",
  "Augusta, GA", "Grand Rapids, MI", "Oxnard, CA", "Tallahassee, FL", "Providence, RI",
  "Huntsville, AL", "Worcester, MA", "Knoxville, TN", "Brownsville, TX", "Santa Clarita, CA",
  "Garden Grove, CA", "Oceanside, CA", "Fort Lauderdale, FL", "Chattanooga, TN", "Tempe, AZ",
  "Salt Lake City, UT", "Cape Coral, FL", "Syracuse, NY", "Eugene, OR", "Peoria, AZ",
  "Springfield, MO", "Fort Wayne, IN", "Rockford, IL", "Jackson, MS", "Alexandria, VA",
  "Hayward, CA", "Cary, NC", "Lancaster, CA", "Salinas, CA", "Palmdale, CA",
  "Sunnyvale, CA", "Pomona, CA", "Escondido, CA", "Kansas City, KS", "Pasadena, TX",
  "Torrance, CA", "Paterson, NJ", "Bridgeport, CT", "McAllen, TX", "Savannah, GA",
  "Hartford, CT", "Surprise, AZ", "Macon, GA", "Killeen, TX", "Clarksville, TN",
  "Boston, MA", "Miami, FL", "Detroit, MI", "El Monte, CA", "Roseville, CA",
  "Flint, MI", "Warren, MI", "Mesquite, TX", "Pasadena, CA", "Orange, CA",
  "Fullerton, CA", "Dayton, OH", "Waco, TX", "Hampton, VA", "West Valley City, UT",
  "Columbia, SC", "Sterling Heights, MI", "Olathe, KS", "New Haven, CT", "Sioux Falls, SD",
  "Cedar Rapids, IA", "Coral Springs, FL", "Thousand Oaks, CA", "Visalia, CA", "Concord, CA",
  "Elizabeth, NJ", "Stamford, CT", "Roseville, CA", "Athens, GA", "Columbia, MO",
  "Lafayette, LA", "Gainesville, FL", "Peoria, IL", "Rancho Cucamonga, CA", "Santa Rosa, CA",
];

// Shape of the controlled form on this page
type PlannerFormData = { location: string; date: string; timeRange: string; budget: string; preference: string; interests: string; };

// Shape of the request body sent to the backend recommendations endpoint
type PlannerRequestPayload = { city: string; interests: string; budget: number; dateRange: string; dayStartTime: string; dayEndTime: string; };

// Raw item returned by the backend /events/recommendations endpoint
type RecommendationApiItem = { name: string; description: string; location: string; category: string; estimated_cost: number; duration_minutes: number; indoor: boolean; tags: string[]; source: string; event_url: string; start_time: string; start_time_as_ampm: string; end_time: string; end_time_as_ampm: string; verified: boolean; };

// Normalized activity used for rendering result cards
type ItineraryActivity = { id: string; time: string; location: string; activity: string; activityType: string; price: number | null; info: string; website?: string; };

// Full itinerary displayed after generation
type ItineraryResponse = { title: string; date: string; city: string; summary: string; activities: ItineraryActivity[]; };

// Response from POST /saved after saving an activity
type SavedEventResponse = { id: number; user_id: number; title: string; date: string; time: string; location: string; tag: string; price: string; saved_at: string; };

// State shape that gets persisted to sessionStorage so the page survives a refresh
type PersistedHomeState = { formData: PlannerFormData; result: ItineraryResponse | null; savedActivityIds: string[]; savedRecordIds: Record<string, number>; };

const initialFormData: PlannerFormData = { location: "", date: "", timeRange: "", budget: "", preference: "Mixed", interests: "" };

// Attach the JWT bearer token to API requests that require authentication
function getAuthHeaders(token: string | null): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// Parse a free-text time range like "10:00 AM - 8:00 PM" into start/end strings
function parseTimeRange(timeRange: string) {
  const [rawStart = "", rawEnd = ""] = timeRange.split("-");
  return { dayStartTime: rawStart.trim(), dayEndTime: rawEnd.trim() };
}

// Map raw backend items to the simpler ItineraryActivity shape used for rendering
function normalizeRecommendations(items: RecommendationApiItem[]): ItineraryActivity[] {
  return items.map((item, index) => ({
    // Combine name + time + index to create a stable unique id per activity
    id: `${item.name}-${item.start_time}-${index}`,
    time: item.start_time_as_ampm || item.start_time || "TBD",
    location: item.location, activity: item.name, activityType: item.category,
    price: typeof item.estimated_cost === "number" ? item.estimated_cost : null,
    info: item.description, website: item.event_url || undefined,
  }));
}

// Build the ItineraryResponse wrapper that gets rendered in the results section
function buildResult(payload: PlannerRequestPayload, activities: ItineraryActivity[]): ItineraryResponse {
  return { title: `Plan for ${payload.city || "Your Day"}`, date: payload.dateRange, city: payload.city || "Selected city", summary: "A personalized itinerary generated from your preferences.", activities };
}

export default function HomePage() {
  const { isLoggedIn, isLoading, token, user } = useAuth();
  const [formData, setFormData] = useState<PlannerFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ItineraryResponse | null>(null);
  const [savedActivityIds, setSavedActivityIds] = useState<string[]>([]);
  const [savedRecordIds, setSavedRecordIds] = useState<Record<string, number>>({});
  const [hasHydrated, setHasHydrated] = useState(false);
  // When true, the next generation skips ALL saved preferences and sends an empty interests string
  const [ignorePreferences, setIgnorePreferences] = useState(false);

  // City autocomplete state
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1); // -1 means nothing is highlighted
  const cityInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  // On first render, rehydrate state from sessionStorage so the form and results survive a refresh
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ITINERARY_STORAGE_KEY);
      if (!raw) { setHasHydrated(true); return; }
      const parsed: PersistedHomeState = JSON.parse(raw);
      setFormData(parsed.formData ?? initialFormData);
      setResult(parsed.result ?? null);
      setSavedActivityIds(parsed.savedActivityIds ?? []);
      setSavedRecordIds(parsed.savedRecordIds ?? {});
    } catch { sessionStorage.removeItem(ITINERARY_STORAGE_KEY); }
    finally { setHasHydrated(true); }
  }, []);

  // Auto-fill the interests field from the user's saved signup preferences
  // only when the field is still empty — never overwrites something the user typed
  useEffect(() => {
    if (!isLoggedIn || !user?.preferences) return;
    setFormData((prev) => {
      const savedInterests = user.preferences?.interests?.join(", ") ?? "";
      const savedEnv = user.preferences?.environment ?? "Mixed";
      return {
        ...prev,
        interests: prev.interests.trim() === "" ? savedInterests : prev.interests,
        preference: prev.preference === "Mixed" ? (savedEnv === "indoor" ? "Indoor" : savedEnv === "outdoor" ? "Outdoor" : "Mixed") : prev.preference,
      };
    });
  }, [isLoggedIn, user]);

  // Persist the current form + results to sessionStorage whenever they change
  useEffect(() => {
    if (!hasHydrated) return;
    sessionStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify({ formData, result, savedActivityIds, savedRecordIds }));
  }, [hasHydrated, formData, result, savedActivityIds, savedRecordIds]);

  // Close the city dropdown when the user clicks anywhere outside the input or the list
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityInputRef.current && !cityInputRef.current.contains(e.target as Node) &&
          suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowCitySuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter US_CITIES by the typed value (case-insensitive substring match) and show up to 8 results
  function handleLocationChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, location: value }));
    if (value.trim().length >= 1) {
      const lower = value.toLowerCase();
      const filtered = US_CITIES.filter((c) => c.toLowerCase().includes(lower)).slice(0, 8);
      setCitySuggestions(filtered);
      setShowCitySuggestions(filtered.length > 0);
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
    setActiveSuggestion(-1);
  }

  // Fill the location field with the selected city and close the dropdown
  function handleCitySelect(city: string) {
    setFormData((prev) => ({ ...prev, location: city }));
    setShowCitySuggestions(false);
    setCitySuggestions([]);
    setActiveSuggestion(-1);
  }

  // Keyboard navigation: ArrowDown/Up moves highlight, Enter confirms, Escape closes
  function handleLocationKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showCitySuggestions || citySuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, citySuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      handleCitySelect(citySuggestions[activeSuggestion]);
    } else if (e.key === "Escape") {
      setShowCitySuggestions(false);
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function formatPrice(price: number | null) {
    if (price === null) return "N/A";
    if (price === 0) return "Free";
    return `$${price}`;
  }

  /**
   * Build the request payload for itinerary generation.
   *
   * Priority order for interests:
   *  1. If "Ignore preferences" is active  → send empty string (no filter)
   *  2. If the user typed something in the form field → use that
   *  3. Otherwise fall back to the interests saved at signup
   */
  function buildPayload(): PlannerRequestPayload {
    const { dayStartTime, dayEndTime } = parseTimeRange(formData.timeRange);
    if (ignorePreferences) {
      return { city: formData.location.trim(), interests: "", budget: formData.budget === "" ? 0 : Number(formData.budget), dateRange: formData.date, dayStartTime, dayEndTime };
    }
    const effectiveInterests = formData.interests.trim() !== "" ? formData.interests.trim() : user?.preferences?.interests?.join(", ") ?? "";
    return { city: formData.location.trim(), interests: effectiveInterests, budget: formData.budget === "" ? 0 : Number(formData.budget), dateRange: formData.date, dayStartTime, dayEndTime };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const payload = buildPayload();
    try {
      const response = await fetch(`${API_BASE_URL}/events/recommendations?provider=openai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: payload.city, interests: payload.interests, budget: payload.budget, date_range: payload.dateRange, day_start_time: payload.dayStartTime, day_end_time: payload.dayEndTime }),
      });
      if (!response.ok) throw new Error("Failed to generate itinerary");
      const data: RecommendationApiItem[] = await response.json();
      const activities = normalizeRecommendations(data);
      setResult(buildResult(payload, activities));
      setSavedActivityIds([]); setSavedRecordIds({});
    } catch (error) {
      console.error("Submit error:", error);
      alert("Something went wrong while generating the itinerary.");
    } finally { setIsSubmitting(false); }
  }

  async function handleToggleSave(activity: ItineraryActivity) {
    if (isLoading) return;
    if (!isLoggedIn) { alert("Please log in to save activities."); return; }
    const isSaved = savedActivityIds.includes(activity.id);
    if (isSaved) {
      const savedRecordId = savedRecordIds[activity.id];
      if (!savedRecordId) { alert("Could not find the saved record id."); return; }
      try {
        const response = await fetch(`${API_BASE_URL}/saved/${savedRecordId}`, { method: "DELETE", headers: { ...getAuthHeaders(token) } });
        if (!response.ok) throw new Error("Failed to delete");
        setSavedActivityIds((prev) => prev.filter((id) => id !== activity.id));
        setSavedRecordIds((prev) => { const next = { ...prev }; delete next[activity.id]; return next; });
      } catch { alert("Something went wrong while removing the saved activity."); }
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/saved`, {
        method: "POST", headers: { "Content-Type": "application/json", ...getAuthHeaders(token) },
        body: JSON.stringify({ title: activity.activity, date: result?.date ?? "", time: activity.time, location: activity.location, tag: activity.activityType, price: activity.price === null ? "N/A" : activity.price === 0 ? "Free" : String(activity.price) }),
      });
      if (!response.ok) throw new Error("Failed to save");
      const savedData: SavedEventResponse = await response.json();
      setSavedActivityIds((prev) => [...prev, activity.id]);
      setSavedRecordIds((prev) => ({ ...prev, [activity.id]: savedData.id }));
    } catch { alert("Something went wrong while saving the activity."); }
  }

  const hasSavedPreferences = isLoggedIn && !!user?.preferences?.interests?.length;

  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>AI Activity Planner</div>
          <h1 className={styles.title}>Plan your free time with less effort.</h1>
          <p className={styles.subtitle}>Discover activities and generate a clean itinerary based on your preferences.</p>
          <div className={styles.featureList}>{features.map((f) => <span key={f} className={styles.featurePill}>{f}</span>)}</div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formHeader}><p className={styles.formEyebrow}>Start Planning</p><h2>Create Your Plan</h2></div>

          {hasSavedPreferences && (
            <div className={ignorePreferences ? styles.prefPanelIgnore : styles.prefPanel}>
              <div className={styles.prefPanelHeader}>
                <span className={ignorePreferences ? styles.prefStatusOff : styles.prefStatusOn}>
                  {ignorePreferences ? "✕  Generating without preferences" : "✓  Using your saved preferences"}
                </span>
                <button
                  type="button"
                  className={ignorePreferences ? styles.prefRestoreBtn : styles.prefIgnoreBtn}
                  onClick={() => setIgnorePreferences((v) => !v)}
                >
                  {ignorePreferences ? "↩ Use my preferences" : "Ignore all my previous preference"}
                </button>
              </div>

              {/* Before row — always shown, greyed out when ignored */}
              <div className={ignorePreferences ? styles.prefRowFaded : styles.prefRow}>
                <span className={styles.prefRowLabel}>Interests</span>
                <div className={styles.prefTags}>
                  {user?.preferences?.interests?.map((interest) => (
                    <span key={interest} className={ignorePreferences ? styles.prefTagOff : styles.prefTagOn}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {(user?.preferences?.environment && user.preferences.environment !== "mixed") && (
                <div className={ignorePreferences ? styles.prefRowFaded : styles.prefRow}>
                  <span className={styles.prefRowLabel}>Environment</span>
                  <span className={ignorePreferences ? styles.prefTagOff : styles.prefTagOn}>
                    {user.preferences.environment}
                  </span>
                </div>
              )}

              {/* After row — only shown when ignored */}
              {ignorePreferences && (
                <div className={styles.prefRowAfter}>
                  <span className={styles.prefRowLabel}>Will use</span>
                  <span className={styles.prefTagNone}>No preferences — open itinerary</span>
                </div>
              )}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* City input with autocomplete */}
            <div className={styles.fieldGroup}>
              <label htmlFor="location">Location</label>
              <div className={styles.cityInputWrapper}>
                <input
                  ref={cityInputRef}
                  id="location" name="location" type="text"
                  placeholder="Enter city or area"
                  value={formData.location}
                  onChange={handleLocationChange}
                  onKeyDown={handleLocationKeyDown}
                  onFocus={() => { if (citySuggestions.length > 0) setShowCitySuggestions(true); }}
                  autoComplete="off"
                />
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <ul ref={suggestionsRef} className={styles.citySuggestions} role="listbox">
                    {citySuggestions.map((city, i) => (
                      <li
                        key={city}
                        role="option"
                        aria-selected={i === activeSuggestion}
                        className={`${styles.citySuggestionItem} ${i === activeSuggestion ? styles.citySuggestionActive : ""}`}
                        onMouseDown={() => handleCitySelect(city)}
                        onMouseEnter={() => setActiveSuggestion(i)}
                      >
                        <span className={styles.cityName}>{city.split(",")[0]}</span>
                        <span className={styles.cityState}>{city.split(",")[1]}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className={styles.twoColumn}>
              <div className={styles.fieldGroup}><label htmlFor="date">Date</label><input id="date" name="date" type="date" value={formData.date} onChange={handleChange} /></div>
              <div className={styles.fieldGroup}><label htmlFor="timeRange">Time Range</label><input id="timeRange" name="timeRange" type="text" placeholder="10:00 AM - 8:00 PM" value={formData.timeRange} onChange={handleChange} /></div>
            </div>
            <div className={styles.twoColumn}>
              <div className={styles.fieldGroup}><label htmlFor="budget">Budget ($)</label><input id="budget" name="budget" type="number" placeholder="50" min="0" value={formData.budget} onChange={handleChange} /></div>
              <div className={styles.fieldGroup}><label htmlFor="preference">Preference</label><select id="preference" name="preference" value={formData.preference} onChange={handleChange}><option>Indoor</option><option>Outdoor</option><option>Mixed</option></select></div>
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="interests">Interests{hasSavedPreferences && !ignorePreferences && formData.interests.trim() === "" && <span className={styles.prefHint}> (using your saved preferences)</span>}</label>
              <input id="interests" name="interests" type="text" placeholder={hasSavedPreferences && !ignorePreferences ? `Saved: ${user?.preferences?.interests?.join(", ") ?? ""}` : "Food, art, music, nature"} value={formData.interests} onChange={handleChange} />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>{isSubmitting ? "Preparing..." : "Generate Itinerary"}</button>
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
            <span className={styles.metaPill}>{result.activities.length} activities</span>
          </div>
          <div className={styles.resultList}>
            {result.activities.map((activity) => {
              const isSaved = savedActivityIds.includes(activity.id);
              return (
                <article key={activity.id} className={styles.resultCard}>
                  <div className={styles.resultTime}>{activity.time}</div>
                  <div className={styles.resultContent}>
                    <div className={styles.resultTopRow}>
                      <div><h3>{activity.activity}</h3><p className={styles.resultCategory}>{activity.activityType}</p></div>
                      <div className={styles.resultRight}>
                        <span className={styles.resultCost}>{formatPrice(activity.price)}</span>
                        <button type="button" className={isSaved ? styles.savedButton : styles.saveButton} onClick={() => handleToggleSave(activity)}>
                          {!isLoggedIn ? "Log in to save" : isSaved ? "Remove" : "Save"}
                        </button>
                      </div>
                    </div>
                    <p className={styles.resultAddress}><span>Location:</span> {activity.location}</p>
                    <p className={styles.resultDescription}>{activity.info}</p>
                    {activity.website && <a href={activity.website} target="_blank" rel="noreferrer" className={styles.websiteLink}>Visit website</a>}
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
