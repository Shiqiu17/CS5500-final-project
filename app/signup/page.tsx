import Link from "next/link";
import styles from "./page.module.css";

const INTEREST_OPTIONS = [
  "Food & dining",
  "Art & culture",
  "Music & nightlife",
  "Nature & outdoors",
  "Sports & fitness",
  "Shopping",
  "History & museums",
  "Photography",
];

const ENVIRONMENT_OPTIONS = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "mixed", label: "Mixed" },
];

export default function SignUpPage() {
  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>What To Do</div>
          <h1 className={styles.title}>
            Create your account.
          </h1>
          <p className={styles.subtitle}>
            Set up your profile and preferences so we can recommend better activities and itineraries.
          </p>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <p className={styles.formEyebrow}>Get started</p>
            <h2>Sign up</h2>
          </div>

          <form className={styles.form}>
            {/* --- Account --- */}
            <div className={styles.sectionLabel}>Account</div>
            <div className={styles.fieldGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </div>

            {/* --- Preferences (hobbies / interests) --- */}
            <div className={styles.sectionLabel}>Preferences — what do you enjoy?</div>
            <p className={styles.sectionHint}>We’ll use this to suggest events and activities.</p>
            <div className={styles.checkboxGrid}>
              {INTEREST_OPTIONS.map((interest) => (
                <label key={interest} className={styles.checkboxLabel}>
                  <input type="checkbox" name="interests" value={interest} className={styles.checkbox} />
                  <span>{interest}</span>
                </label>
              ))}
            </div>

            {/* --- Restrictions / event preferences --- */}
            <div className={styles.sectionLabel}>Event preferences & restrictions</div>
            <p className={styles.sectionHint}>Indoor/outdoor, diet, accessibility, etc.</p>
            <div className={styles.fieldGroup}>
              <label htmlFor="environment">Environment</label>
              <select id="environment" name="environment">
                {ENVIRONMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="diet">Dietary restrictions</label>
              <input
                id="diet"
                type="text"
                name="dietaryRestrictions"
                placeholder="e.g. Vegetarian, gluten-free, none"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="accessibility">Accessibility needs</label>
              <input
                id="accessibility"
                type="text"
                name="accessibility"
                placeholder="e.g. Wheelchair accessible, none"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="otherRestrictions">Other restrictions or notes</label>
              <textarea
                id="otherRestrictions"
                name="otherRestrictions"
                rows={3}
                placeholder="Anything we should avoid or prioritize when suggesting events?"
                className={styles.textarea}
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryButton}>
                Create account
              </button>
            </div>
          </form>

          <p className={styles.loginHint}>
            Already have an account? <Link href="/login" className={styles.loginLink}>Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}