import { FormEvent, useState } from "react";
import { api } from "./lib/api";
import type { AuthResponse } from "./lib/api";
import "./App.css";

function App() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AuthResponse | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response =
        mode === "signup"
          ? await api.signup({ full_name: fullName, email, password })
          : await api.login({ email, password });

      setResult(response);
      localStorage.setItem("interviewai_user", JSON.stringify(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>InterviewAI</h1>
      <p>MVP Auth Test</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setMode("signup")} disabled={mode === "signup"}>
          Sign up
        </button>
        <button onClick={() => setMode("login")} disabled={mode === "login"}>
          Login
        </button>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        {mode === "signup" && (
          <input
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
        </button>
      </form>

      {error && <p style={{ color: "crimson", marginTop: 16 }}>{error}</p>}

      {result && (
        <pre style={{ marginTop: 16, padding: 12, background: "#f5f5f5", overflow: "auto" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}

export default App;