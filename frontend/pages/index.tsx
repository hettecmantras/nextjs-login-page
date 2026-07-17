import { FormEvent, ChangeEvent, useState } from "react";
import Head from "next/head";

type Status = "idle" | "loading" | "success" | "error";

interface FormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

const initialFormState: FormState = {
  email: "",
  password: "",
  rememberMe: false,
};

const validateEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function LoginPage() {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<"email" | "password", string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [apiMessage, setApiMessage] = useState("");

  const isLoading = status === "loading";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "email" || name === "password") {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors: typeof errors = {};
    if (!formData.email.trim()) {
      validationErrors.email = "Email is required.";
    } else if (!validateEmail(formData.email)) {
      validationErrors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      validationErrors.password = "Password is required.";
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setStatus("idle");
      setApiMessage("");
      return;
    }

    try {
      setStatus("loading");
      setApiMessage("");
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to sign in.");
      }
      setStatus("success");
      setApiMessage(payload.message);
      setErrors({});
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      setStatus("error");
      setApiMessage(error instanceof Error ? error.message : "Unable to reach the server.");
    }
  };

  return (
    <>
      <Head>
        <title>Sign in | Next.js Login</title>
        <meta name="description" content="Simple login form built with Next.js" />
      </Head>
      <div className="page">
        <main className="card">
          <p className="eyebrow">Secure Access</p>
          <h1>Sign in</h1>
          <p>Enter your credentials to continue to the secure dashboard.</p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                className={errors.email ? "input-error" : ""}
                disabled={isLoading}
                autoComplete="email"
              />
              <p role="alert" className="helper-text">
                {errors.email ?? "\u00a0"}
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
                className={errors.password ? "input-error" : ""}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <p role="alert" className="helper-text">
                {errors.password ?? "\u00a0"}
              </p>
            </div>
            <div className="checkbox-row">
              <label>
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                Remember me
              </label>
              <a href="#" aria-label="Forgot password">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="button"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          {apiMessage && (
            <p
              className={`status-message ${status === "success" ? "success" : "error"}`}
              role="status"
              aria-live="polite"
            >
              {apiMessage}
            </p>
          )}
        </main>
      </div>
    </>
  );
}
