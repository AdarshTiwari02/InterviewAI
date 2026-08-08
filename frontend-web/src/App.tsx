import { FormEvent, useMemo, useState } from "react";
import { api, profileApi } from "./lib/api";
import type {
  AuthResponse,
  ExperienceLevel,
  UserProfilePayload,
  UserProfileResponse,
} from "./lib/api";
import "./App.css";

const ROLE_OPTIONS = [
  "Software Engineer",
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "ML Engineer",
  "DevOps",
  "SRE",
];

const COMPANY_TYPE_OPTIONS = [
  "Service-Based",
  "Product-Based",
  "FinTech",
  "Networking",
  "Cloud",
  "Startup",
];

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function App() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState<AuthResponse | null>(null);

  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("fresher");
  const [targetRoles, setTargetRoles] = useState<string[]>(["Software Engineer"]);
  const [targetCompanyTypes, setTargetCompanyTypes] = useState<string[]>(["Product-Based"]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [projectLinksCsv, setProjectLinksCsv] = useState("");
  const [preparingSpecificRole, setPreparingSpecificRole] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState<UserProfileResponse | null>(null);

  const projectLinksPreview = useMemo(() => splitCsv(projectLinksCsv), [projectLinksCsv]);

  async function onAuthSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setProfileSaved(null);

    try {
      const response =
        mode === "signup"
          ? await api.signup({ full_name: fullName, email, password })
          : await api.login({ email, password });

      setUser(response);
      localStorage.setItem("interviewai_user", JSON.stringify(response));
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  }

  function toggleSelection(value: string, selected: string[], setter: (v: string[]) => void) {
    if (selected.includes(value)) {
      const next = selected.filter((v) => v !== value);
      if (next.length > 0) setter(next);
      return;
    }
    setter([...selected, value]);
  }

  async function onProfileSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setProfileLoading(true);
    setProfileError("");
    setProfileSaved(null);

    const payload: UserProfilePayload = {
      experience_level: experienceLevel,
      target_roles: targetRoles,
      target_company_types: targetCompanyTypes,
      linkedin_url: linkedinUrl || null,
      github_url: githubUrl || null,
      project_links: splitCsv(projectLinksCsv),
      preparing_specific_role: preparingSpecificRole,
      company_name: preparingSpecificRole ? companyName || null : null,
      job_title: preparingSpecificRole ? jobTitle || null : null,
      job_description_text: preparingSpecificRole ? jobDescriptionText || null : null,
    };

    try {
      const saved = await profileApi.upsertProfile(user.user_id, payload);
      setProfileSaved(saved);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setProfileLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "28px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>InterviewAI</h1>
      <p>MVP Onboarding</p>

      {!user ? (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={() => setMode("signup")} disabled={mode === "signup"}>
              Sign up
            </button>
            <button onClick={() => setMode("login")} disabled={mode === "login"}>
              Login
            </button>
          </div>

          <form onSubmit={onAuthSubmit} style={{ display: "grid", gap: 10 }}>
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
            <button type="submit" disabled={authLoading}>
              {authLoading ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
            </button>
          </form>

          {authError && <p style={{ color: "crimson" }}>{authError}</p>}
        </>
      ) : (
        <>
          <p>
            Logged in as <strong>{user.full_name}</strong> ({user.email})
          </p>

          <form onSubmit={onProfileSubmit} style={{ display: "grid", gap: 12 }}>
            <label>
              Experience level
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              >
                <option value="student_intern">Student/Intern</option>
                <option value="fresher">Fresher (0-1 yrs)</option>
                <option value="mid_level">Mid-Level (2-5 yrs)</option>
                <option value="senior">Senior (5+ yrs)</option>
                <option value="lead_architect">Lead/Architect (10+ yrs)</option>
              </select>
            </label>

            <div>
              <p style={{ marginBottom: 6 }}>Target roles</p>
              {ROLE_OPTIONS.map((role) => (
                <label key={role} style={{ display: "inline-block", marginRight: 12 }}>
                  <input
                    type="checkbox"
                    checked={targetRoles.includes(role)}
                    onChange={() => toggleSelection(role, targetRoles, setTargetRoles)}
                  />{" "}
                  {role}
                </label>
              ))}
            </div>

            <div>
              <p style={{ marginBottom: 6 }}>Target company types</p>
              {COMPANY_TYPE_OPTIONS.map((type) => (
                <label key={type} style={{ display: "inline-block", marginRight: 12 }}>
                  <input
                    type="checkbox"
                    checked={targetCompanyTypes.includes(type)}
                    onChange={() =>
                      toggleSelection(type, targetCompanyTypes, setTargetCompanyTypes)
                    }
                  />{" "}
                  {type}
                </label>
              ))}
            </div>

            <input
              placeholder="LinkedIn URL (optional)"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
            <input
              placeholder="GitHub URL (optional)"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
            <input
              placeholder="Project links CSV (optional)"
              value={projectLinksCsv}
              onChange={(e) => setProjectLinksCsv(e.target.value)}
            />
            {projectLinksPreview.length > 0 && (
              <small>Parsed project links: {projectLinksPreview.join(" | ")}</small>
            )}

            <label>
              <input
                type="checkbox"
                checked={preparingSpecificRole}
                onChange={(e) => setPreparingSpecificRole(e.target.checked)}
              />{" "}
              Preparing for a specific role
            </label>

            {preparingSpecificRole && (
              <>
                <input
                  placeholder="Company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required={preparingSpecificRole}
                />
                <input
                  placeholder="Job title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required={preparingSpecificRole}
                />
                <textarea
                  placeholder="Paste full JD text"
                  value={jobDescriptionText}
                  onChange={(e) => setJobDescriptionText(e.target.value)}
                  rows={6}
                  required={preparingSpecificRole}
                />
              </>
            )}

            <button type="submit" disabled={profileLoading}>
              {profileLoading ? "Saving..." : "Save Profile"}
            </button>
          </form>

          {profileError && <p style={{ color: "crimson" }}>{profileError}</p>}
          {profileSaved && (
            <pre style={{ marginTop: 16, padding: 12, background: "#f5f5f5", overflow: "auto" }}>
              {JSON.stringify(profileSaved, null, 2)}
            </pre>
          )}
        </>
      )}
    </main>
  );
}

export default App;