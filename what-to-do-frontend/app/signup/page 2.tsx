"use client";

import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import styles from "./page.module.css";

// Route through Next.js proxy to avoid browser-side CORS issues.
const SIGNUP_ENDPOINT = "/api/auth/register";

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
  const router = useRouter();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [environment, setEnvironment] = useState("mixed");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [accessibility, setAccessibility] = useState("");
  const [otherRestrictions, setOtherRestrictions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
    if (name === "environment") setEnvironment(value);
    if (name === "dietaryRestrictions") setDietaryRestrictions(value);
    if (name === "accessibility") setAccessibility(value);
    if (name === "otherRestrictions") setOtherRestrictions(value);
    setErrorMessage(null);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (name in next) delete next[name as keyof typeof next];
      return next;
    });
  }

  function handleInterestChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setInterests((prev) =>
      event.target.checked
        ? [...prev, value]
        : prev.filter((i) => i !== value),
    );
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const nextFieldErrors: typeof fieldErrors = {};
    if (!email.trim()) nextFieldErrors.email = "Email is required.";
    if (!password) nextFieldErrors.password = "Password is required.";
    if (!confirmPassword) nextFieldErrors.confirmPassword = "Confirm password is required.";
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({
        confirmPassword: "Passwords do not match.",
      });
      return;
    }

    if (password.length < 8) {
      setFieldErrors({
        password: "Password must be at least 8 characters.",
      });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    // Backend expects UserCreate: username, email, password, name (optional)
    const username = email.trim().split("@")[0] || email.trim() || "user";
    const payload = {
      username,
      email: email.trim(),
      password,
      name: null as string | null,
    };

    try {
      const response = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail[0]?.msg ?? "Sign up failed"
              : "Sign up failed. Please try again.";
        setErrorMessage(message);
        return;
      }
      if (data.access_token && data.user) {
        setAuth({
          user: {
            id: String(data.user.id),
            username: data.user.username,
            email: data.user.email,
          },
          token: data.access_token,
        });
        router.push("/");
        router.refresh();
        return;
      }
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Signup request failed:", error);
      setErrorMessage("Network error. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

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

          <form className={styles.form} onSubmit={handleSubmit}>
            {errorMessage && (
              <div className={styles.errorMessage} role="alert">
                {errorMessage}
              </div>
            )}
            {/* --- Account (required) --- */}
            <div className={styles.sectionLabel}>Account</div>
            <div
              className={`${styles.fieldGroup} ${fieldErrors.email ? styles.fieldGroupError : ""}`}
            >
              <label htmlFor="email">Email <span className={styles.required}>*</span></label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <span id="email-error" className={styles.fieldError} role="alert">
                  {fieldErrors.email}
                </span>
              )}
            </div>
            <div
              className={`${styles.fieldGroup} ${fieldErrors.password ? styles.fieldGroupError : ""}`}
            >
              <label htmlFor="password">Password <span className={styles.required}>*</span></label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={password}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
              />
              {fieldErrors.password && (
                <span id="password-error" className={styles.fieldError} role="alert">
                  {fieldErrors.password}
                </span>
              )}
            </div>
            <div
              className={`${styles.fieldGroup} ${fieldErrors.confirmPassword ? styles.fieldGroupError : ""}`}
            >
              <label htmlFor="confirmPassword">Confirm password <span className={styles.required}>*</span></label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
              />
              {fieldErrors.confirmPassword && (
                <span id="confirmPassword-error" className={styles.fieldError} role="alert">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            {/* --- Preferences (hobbies / interests) --- */}
            <div className={styles.sectionLabel}>Preferences — what do you enjoy?</div>
            <p className={styles.sectionHint}>We’ll use this to suggest events and activities.</p>
            <div className={styles.checkboxGrid}>
              {INTEREST_OPTIONS.map((interest) => (
                <label key={interest} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="interests"
                    value={interest}
                    className={styles.checkbox}
                    checked={interests.includes(interest)}
                    onChange={handleInterestChange}
                    disabled={isSubmitting}
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>

            {/* --- Restrictions / event preferences --- */}
            <div className={styles.sectionLabel}>Event preferences & restrictions</div>
            <p className={styles.sectionHint}>Indoor/outdoor, diet, accessibility, etc.</p>
            <div className={styles.fieldGroup}>
              <label htmlFor="environment">Environment</label>
              <select
                id="environment"
                name="environment"
                value={environment}
                onChange={handleChange}
                disabled={isSubmitting}
              >
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
                value={dietaryRestrictions}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="accessibility">Accessibility needs</label>
              <input
                id="accessibility"
                type="text"
                name="accessibility"
                placeholder="e.g. Wheelchair accessible, none"
                value={accessibility}
                onChange={handleChange}
                disabled={isSubmitting}
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
                value={otherRestrictions}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
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
