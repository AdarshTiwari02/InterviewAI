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
    <div className="app-root">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-grid" />

      <aside className="sidebar glass">
        <div className="brand">
          <span className="brand-dot" />
          <div>
            <h2>InterviewAI</h2>
            <p>Co-Pilot</p>
          </div>
        </div>
        <nav>
          <button className="nav-btn active">Dashboard</button>
          <button className="nav-btn">Mock Interview</button>
          <button className="nav-btn">Practice</button>
          <button className="nav-btn">Analytics</button>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar glass">
          <div>
            <h1>Futuristic Interview Prep</h1>
            <p>Personalized AI path, realistic simulations, and deep analytics.</p>
          </div>
          <div className="status-chip">MVP Build • Live</div>
        </header>

        <section className="hero glass">
          <div>
            <h2>Land your dream role with AI precision</h2>
            <p>
              Build your profile, generate a role-specific blueprint, and practice with
              high-signal feedback loops.
            </p>
            <div className="hero-actions">
              <button className="primary-btn">Start Journey</button>
              <button className="ghost-btn">Watch Demo</button>
            </div>
          </div>
          <div className="hero-metric">
            <div className="ring">
              <span>82</span>
            </div>
            <p>Readiness Score</p>
          </div>
        </section>

        <section className="cards-row">
          <article className="mini-card glass">
            <h3>ATS Match</h3>
            <p className="value">76%</p>
          </article>
          <article className="mini-card glass">
            <h3>Mock Progress</h3>
            <p className="value">2/4 Rounds</p>
          </article>
          <article className="mini-card glass">
            <h3>Focus Topics</h3>
            <p className="value">DBMS, OS</p>
          </article>
          <article className="mini-card glass">
            <h3>Next Milestone</h3>
            <p className="value">System Design</p>
          </article>
        </section>

        {!user ? (
          <section className="panel glass">
            <div className="panel-header">
              <h3>{mode === "signup" ? "Create your account" : "Welcome back"}</h3>
              <div className="switch">
                <button onClick={() => setMode("signup")} className={mode === "signup" ? "on" : ""}>
                  Sign up
                </button>
                <button onClick={() => setMode("login")} className={mode === "login" ? "on" : ""}>
                  Login
                </button>
              </div>
            </div>

            <form onSubmit={onAuthSubmit} className="form-grid">
              {mode === "signup" && (
                <input
                  className="input"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              )}
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="input"
                type="password"
                placeholder="Password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <button className="primary-btn" type="submit" disabled={authLoading}>
                {authLoading ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
              </button>
            </form>
            {authError && <p className="error">{authError}</p>}
          </section>
        ) : (
          <section className="panel glass">
            <div className="panel-header">
              <h3>Onboarding Profile Wizard</h3>
              <p className="muted">
                Logged in as <strong>{user.full_name}</strong> ({user.email})
              </p>
            </div>

            <form onSubmit={onProfileSubmit} className="form-grid">
              <label className="label">
                Experience level
                <select
                  className="input"
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
                <p className="label-title">Target roles</p>
                <div className="chip-wrap">
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`chip ${targetRoles.includes(role) ? "chip-on" : ""}`}
                      onClick={() => toggleSelection(role, targetRoles, setTargetRoles)}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="label-title">Target company types</p>
                <div className="chip-wrap">
                  {COMPANY_TYPE_OPTIONS.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`chip ${targetCompanyTypes.includes(type) ? "chip-on" : ""}`}
                      onClick={() =>
                        toggleSelection(type, targetCompanyTypes, setTargetCompanyTypes)
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <input
                className="input"
                placeholder="LinkedIn URL (optional)"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
              <input
                className="input"
                placeholder="GitHub URL (optional)"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <input
                className="input"
                placeholder="Project links CSV (optional)"
                value={projectLinksCsv}
                onChange={(e) => setProjectLinksCsv(e.target.value)}
              />
              {projectLinksPreview.length > 0 && (
                <small className="muted">Parsed project links: {projectLinksPreview.join(" | ")}</small>
              )}

              <label className="toggle">
                <input
                  type="checkbox"
                  checked={preparingSpecificRole}
                  onChange={(e) => setPreparingSpecificRole(e.target.checked)}
                />
                <span>Preparing for a specific role</span>
              </label>

              {preparingSpecificRole && (
                <>
                  <input
                    className="input"
                    placeholder="Company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                  <input
                    className="input"
                    placeholder="Job title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                  />
                  <textarea
                    className="input"
                    placeholder="Paste full JD text"
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                    rows={5}
                    required
                  />
                </>
              )}

              <button className="primary-btn" type="submit" disabled={profileLoading}>
                {profileLoading ? "Saving..." : "Save Profile"}
              </button>
            </form>

            {profileError && <p className="error">{profileError}</p>}
            {profileSaved && (
              <pre className="json-view">{JSON.stringify(profileSaved, null, 2)}</pre>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;