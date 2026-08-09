// frontend-web/src/App.tsx

import { FormEvent, useMemo, useState } from "react";
import "./App.css";
import { api, profileApi } from "./lib/api";

type AuthMode = "login" | "signup";

type ExperienceLevel =
  | "student"
  | "entry"
  | "mid"
  | "senior"
  | "lead"
  | "";

type Profile = {
  experience_level: ExperienceLevel;
  target_roles: string[];
  target_company_types: string[];
  linkedin_url: string;
  github_url: string;
  project_links: string[];
  preparing_specific_role: boolean;
  company_name: string;
  job_title: string;
  job_description_text: string;
};

type AuthForm = {
  full_name: string;
  email: string;
  password: string;
};

const ROLE_OPTIONS = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Scientist",
  "Data Analyst",
  "ML Engineer",
  "DevOps Engineer",
  "Cybersecurity Engineer",
  "Product Manager",
];

const COMPANY_TYPES = [
  "Product",
  "Startup",
  "FAANG / Big Tech",
  "Service",
  "Fintech",
  "Consulting",
  "Government",
  "Remote-first",
];

const DEFAULT_PROFILE: Profile = {
  experience_level: "",
  target_roles: [],
  target_company_types: [],
  linkedin_url: "",
  github_url: "",
  project_links: [],
  preparing_specific_role: false,
  company_name: "",
  job_title: "",
  job_description_text: "",
};

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [authForm, setAuthForm] = useState<AuthForm>({
    full_name: "",
    email: "",
    password: "",
  });

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedProfile, setSavedProfile] = useState<unknown>(null);

  const readiness = useMemo(() => {
    let score = 18;

    if (profile.experience_level) score += 12;
    if (profile.target_roles.length) score += 16;
    if (profile.target_company_types.length) score += 12;
    if (profile.linkedin_url) score += 8;
    if (profile.github_url) score += 8;
    if (profile.project_links.length) score += 10;

    if (profile.preparing_specific_role) {
      score += 8;
      if (profile.company_name) score += 4;
      if (profile.job_title) score += 4;
    }

    return Math.min(score, 100);
  }, [profile]);

  const updateAuth = (key: keyof AuthForm, value: string) => {
    setAuthForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateProfile = <K extends keyof Profile>(
    key: K,
    value: Profile[K],
  ) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleArrayValue = (
    key: "target_roles" | "target_company_types",
    value: string,
  ) => {
    setProfile((current) => {
      const values = current[key];

      return {
        ...current,
        [key]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      };
    });
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (authMode === "signup") {
        await api.signup({
          full_name: authForm.full_name,
          email: authForm.email,
          password: authForm.password,
        });
      } else {
        await api.login({
          email: authForm.email,
          password: authForm.password,
        });
      }

      setAuthenticated(true);
      setSuccess(
        authMode === "signup"
          ? "Identity created. Configure your interview profile."
          : "Identity verified. Continue configuring your profile.",
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSavedProfile(null);

    if (!profile.experience_level) {
      setError("Select your experience level.");
      return;
    }

    if (profile.target_roles.length === 0) {
      setError("Select at least one target role.");
      return;
    }

    if (profile.target_company_types.length === 0) {
      setError("Select at least one company type.");
      return;
    }

    if (
      profile.preparing_specific_role &&
      (!profile.company_name.trim() ||
        !profile.job_title.trim() ||
        !profile.job_description_text.trim())
    ) {
      setError(
        "Company name, job title, and job description are required for a specific-role preparation.",
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...profile,
        project_links: profile.project_links
          .map((link) => link.trim())
          .filter(Boolean),
      };

      const result = await profileApi.upsertProfile(payload);

      setSavedProfile(result);
      setSuccess("Profile synchronized successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <div className="hud-grid" />
      <div className="scanline" />

      <Sidebar />

      <main className="main">
        <Topbar authenticated={authenticated} />

        <div className="content">
          <Hero
            authenticated={authenticated}
            readiness={readiness}
            onPrimary={() => {
              document
                .getElementById("interaction-panel")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <KpiRow readiness={readiness} />

          <section
            className="workspace-grid"
            id="interaction-panel"
            aria-label="InterviewAI workspace"
          >
            <div className="interaction-column">
              {!authenticated ? (
                <AuthPanel
                  mode={authMode}
                  form={authForm}
                  loading={loading}
                  error={error}
                  success={success}
                  onModeChange={(mode) => {
                    setAuthMode(mode);
                    setError("");
                    setSuccess("");
                  }}
                  onChange={updateAuth}
                  onSubmit={handleAuth}
                />
              ) : (
                <ProfilePanel
                  profile={profile}
                  readiness={readiness}
                  loading={loading}
                  error={error}
                  success={success}
                  savedProfile={savedProfile}
                  onChange={updateProfile}
                  onToggle={toggleArrayValue}
                  onSubmit={handleProfileSubmit}
                />
              )}
            </div>

            <aside className="telemetry-column">
              <ReadinessCard readiness={readiness} authenticated={authenticated} />

              <SystemCard />

              <div className="terminal-card">
                <div className="terminal-header">
                  <span className="terminal-dot active" />
                  <span className="terminal-dot" />
                  <span className="terminal-dot" />
                  <span className="terminal-title">AI_CORE / STATUS</span>
                </div>

                <div className="terminal-body">
                  <div>
                    <span className="terminal-muted">&gt;</span> neural engine
                    <span className="terminal-green"> ONLINE</span>
                  </div>
                  <div>
                    <span className="terminal-muted">&gt;</span> interview
                    matrix
                    <span className="terminal-green"> READY</span>
                  </div>
                  <div>
                    <span className="terminal-muted">&gt;</span> candidate
                    profile
                    <span
                      className={
                        authenticated
                          ? "terminal-green"
                          : "terminal-warning"
                      }
                    >
                      {authenticated ? " SYNCED" : " WAITING"}
                    </span>
                  </div>
                  <div>
                    <span className="terminal-muted">&gt;</span> response
                    analysis
                    <span className="terminal-green"> ARMED</span>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-orb">
          <span />
          <span />
          <span />
        </div>

        <div>
          <div className="brand-name">INTERVIEW<span>AI</span></div>
          <div className="brand-subtitle">CO-PILOT SYSTEM</div>
        </div>
      </div>

      <div className="sidebar-line" />

      <nav className="nav" aria-label="Primary navigation">
        <NavItem active icon="⌂" label="Command Center" />
        <NavItem icon="◈" label="Mock Interview" />
        <NavItem icon="◎" label="Practice Lab" />
        <NavItem icon="◌" label="Analytics" />
      </nav>

      <div className="sidebar-bottom">
        <div className="version">
          <span className="status-dot" />
          SYSTEM OPERATIONAL
        </div>

        <div className="sidebar-profile">
          <div className="avatar">AI</div>
          <div>
            <strong>AI CO-PILOT</strong>
            <span>Neural interview engine</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} type="button">
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
      {active && <span className="nav-active-line" />}
    </button>
  );
}

function Topbar({ authenticated }: { authenticated: boolean }) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>INTERVIEWAI</span>
        <i>/</i>
        <strong>COMMAND CENTER</strong>
      </div>

      <div className="topbar-actions">
        <div className="system-time">
          <span className="live-dot" />
          LIVE SYSTEM
        </div>

        <div className="top-status">
          <span className={authenticated ? "online" : "idle"} />
          {authenticated ? "IDENTITY VERIFIED" : "AWAITING IDENTITY"}
        </div>

        <button className="icon-button" type="button" aria-label="Notifications">
          ◇
        </button>
      </div>
    </header>
  );
}

function Hero({
  authenticated,
  readiness,
  onPrimary,
}: {
  authenticated: boolean;
  readiness: number;
  onPrimary: () => void;
}) {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          AI-DRIVEN INTERVIEW INTELLIGENCE
        </div>

        <h1>
          Become the candidate
          <br />
          <span>they remember.</span>
        </h1>

        <p>
          A personal AI command center that turns interview preparation into a
          measurable advantage.
        </p>

        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={onPrimary}>
            <span>{authenticated ? "Configure Profile" : "Initialize Co-Pilot"}</span>
            <b>↗</b>
          </button>

          <button className="secondary-button" type="button" onClick={onPrimary}>
            Explore system
            <span>↓</span>
          </button>
        </div>
      </div>

      <div className="hero-visual">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orbit orbit-three" />

        <div className="hologram">
          <div className="hologram-core">
            <div className="core-inner">
              <span className="core-label">READINESS</span>
              <strong>{readiness}</strong>
              <small>/ 100</small>
            </div>
          </div>

          <div className="holo-ring ring-a" />
          <div className="holo-ring ring-b" />
          <div className="holo-ring ring-c" />

          <div className="float-label label-top">
            <span>AI SIGNAL</span>
            <strong>ACTIVE</strong>
          </div>

          <div className="float-label label-bottom">
            <span>PREPARATION</span>
            <strong>{readiness > 65 ? "STABLE" : "BUILDING"}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function KpiRow({ readiness }: { readiness: number }) {
  return (
    <section className="kpi-grid" aria-label="Interview preparation metrics">
      <KpiCard
        index="01"
        label="ATS COMPATIBILITY"
        value="86"
        unit="%"
        trend="+12%"
        description="Resume signal strength"
      />

      <KpiCard
        index="02"
        label="MOCK PROGRESS"
        value="64"
        unit="%"
        trend="+8%"
        description="Interview simulation"
      />

      <KpiCard
        index="03"
        label="WEAK TOPICS"
        value="07"
        unit=""
        trend="-03"
        description="Priority learning nodes"
      />

      <KpiCard
        index="04"
        label="NEXT MILESTONE"
        value={readiness >= 70 ? "READY" : "BUILD"}
        unit=""
        trend="AI"
        description="Candidate readiness"
        special
      />
    </section>
  );
}

function KpiCard({
  index,
  label,
  value,
  unit,
  trend,
  description,
  special = false,
}: {
  index: string;
  label: string;
  value: string;
  unit: string;
  trend: string;
  description: string;
  special?: boolean;
}) {
  return (
    <article className="kpi-card">
      <div className="kpi-top">
        <span>{index}</span>
        <span className="kpi-trend">{trend}</span>
      </div>

      <div className={`kpi-value ${special ? "kpi-special" : ""}`}>
        {value}
        {unit && <small>{unit}</small>}
      </div>

      <div className="kpi-label">{label}</div>
      <div className="kpi-description">{description}</div>

      <div className="kpi-scan" />
    </article>
  );
}

function AuthPanel({
  mode,
  form,
  loading,
  error,
  success,
  onModeChange,
  onChange,
  onSubmit,
}: {
  mode: AuthMode;
  form: AuthForm;
  loading: boolean;
  error: string;
  success: string;
  onModeChange: (mode: AuthMode) => void;
  onChange: (key: keyof AuthForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="panel">
      <PanelHeader
        code="AUTH.01"
        title="Identity Initialization"
        description="Create or access your InterviewAI candidate identity."
      />

      <div className="auth-switch">
        <button
          type="button"
          className={mode === "signup" ? "selected" : ""}
          onClick={() => onModeChange("signup")}
        >
          CREATE IDENTITY
        </button>
        <button
          type="button"
          className={mode === "login" ? "selected" : ""}
          onClick={() => onModeChange("login")}
        >
          EXISTING IDENTITY
        </button>
      </div>

      <form className="form" onSubmit={onSubmit}>
        {mode === "signup" && (
          <Field
            label="FULL NAME"
            name="full_name"
            value={form.full_name}
            placeholder="Enter your full name"
            onChange={(value) => onChange("full_name", value)}
            required
          />
        )}

        <Field
          label="EMAIL ADDRESS"
          name="email"
          type="email"
          value={form.email}
          placeholder="candidate@domain.com"
          onChange={(value) => onChange("email", value)}
          required
        />

        <Field
          label="ACCESS PASSWORD"
          name="password"
          type="password"
          value={form.password}
          placeholder="••••••••••••"
          onChange={(value) => onChange("password", value)}
          required
        />

        <Feedback error={error} success={success} />

        <button className="submit-button" type="submit" disabled={loading}>
          <span>{loading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS"}</span>
          <b>{loading ? "◌" : "→"}</b>
        </button>
      </form>

      <div className="panel-footer">
        <span>SECURITY PROTOCOL</span>
        <span className="footer-value">ENCRYPTED / AI-READY</span>
      </div>
    </section>
  );
}

function ProfilePanel({
  profile,
  readiness,
  loading,
  error,
  success,
  savedProfile,
  onChange,
  onToggle,
  onSubmit,
}: {
  profile: Profile;
  readiness: number;
  loading: boolean;
  error: string;
  success: string;
  savedProfile: unknown;
  onChange: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  onToggle: (
    key: "target_roles" | "target_company_types",
    value: string,
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="panel">
      <PanelHeader
        code="PROFILE.02"
        title="Candidate Calibration"
        description="Give the AI the signals it needs to build your preparation matrix."
      />

      <form className="form" onSubmit={onSubmit}>
        <div className="section-label">
          <span>01</span>
          EXPERIENCE VECTOR
        </div>

        <div className="select-grid">
          {[
            ["student", "STUDENT"],
            ["entry", "ENTRY"],
            ["mid", "MID LEVEL"],
            ["senior", "SENIOR"],
            ["lead", "LEAD"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={`choice-card ${
                profile.experience_level === value ? "selected" : ""
              }`}
              onClick={() =>
                onChange("experience_level", value as ExperienceLevel)
              }
            >
              <span className="choice-index">0{value === "student" ? 1 : value === "entry" ? 2 : value === "mid" ? 3 : value === "senior" ? 4 : 5}</span>
              {label}
            </button>
          ))}
        </div>

        <div className="section-label">
          <span>02</span>
          TARGET ROLES
        </div>

        <div className="tag-grid">
          {ROLE_OPTIONS.map((role) => (
            <button
              type="button"
              key={role}
              className={`tag-button ${
                profile.target_roles.includes(role) ? "selected" : ""
              }`}
              onClick={() => onToggle("target_roles", role)}
            >
              <span>{profile.target_roles.includes(role) ? "✓" : "+"}</span>
              {role}
            </button>
          ))}
        </div>

        <div className="section-label">
          <span>03</span>
          TARGET ENVIRONMENT
        </div>

        <div className="tag-grid">
          {COMPANY_TYPES.map((companyType) => (
            <button
              type="button"
              key={companyType}
              className={`tag-button ${
                profile.target_company_types.includes(companyType)
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                onToggle("target_company_types", companyType)
              }
            >
              <span>
                {profile.target_company_types.includes(companyType)
                  ? "✓"
                  : "+"}
              </span>
              {companyType}
            </button>
          ))}
        </div>

        <div className="section-label">
          <span>04</span>
          DIGITAL FOOTPRINT
        </div>

        <div className="two-column">
          <Field
            label="LINKEDIN URL"
            name="linkedin_url"
            value={profile.linkedin_url}
            placeholder="linkedin.com/in/yourname"
            onChange={(value) => onChange("linkedin_url", value)}
          />

          <Field
            label="GITHUB URL"
            name="github_url"
            value={profile.github_url}
            placeholder="github.com/yourname"
            onChange={(value) => onChange("github_url", value)}
          />
        </div>

        <Field
          label="PROJECT LINKS"
          name="project_links"
          value={profile.project_links.join(", ")}
          placeholder="project-one.com, github.com/project-two"
          onChange={(value) =>
            onChange(
              "project_links",
              value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
        />

        <div className="specific-role-card">
          <div>
            <span className="specific-code">ROLE TARGETING</span>
            <strong>Preparing for a specific position?</strong>
            <p>
              Enable deep role analysis using the company's actual job
              description.
            </p>
          </div>

          <button
            type="button"
            className={`toggle ${profile.preparing_specific_role ? "on" : ""}`}
            onClick={() =>
              onChange(
                "preparing_specific_role",
                !profile.preparing_specific_role,
              )
            }
            aria-pressed={profile.preparing_specific_role}
          >
            <span />
          </button>
        </div>

        {profile.preparing_specific_role && (
          <div className="role-fields">
            <div className="two-column">
              <Field
                label="COMPANY"
                name="company_name"
                value={profile.company_name}
                placeholder="Company name"
                onChange={(value) => onChange("company_name", value)}
                required
              />

              <Field
                label="JOB TITLE"
                name="job_title"
                value={profile.job_title}
                placeholder="Target position"
                onChange={(value) => onChange("job_title", value)}
                required
              />
            </div>

            <label className="field textarea-field">
              <span>JOB DESCRIPTION</span>
              <textarea
                value={profile.job_description_text}
                placeholder="Paste the job description here..."
                onChange={(event) =>
                  onChange("job_description_text", event.target.value)
                }
                required
              />
            </label>
          </div>
        )}

        <Feedback error={error} success={success} />

        <button className="submit-button" type="submit" disabled={loading}>
          <span>{loading ? "SYNCHRONIZING..." : "SYNC PROFILE"}</span>
          <b>{loading ? "◌" : "→"}</b>
        </button>
      </form>

      {savedProfile && (
        <div className="json-output">
          <div className="json-header">
            <span>PROFILE RESPONSE</span>
            <span className="json-live">● SAVED</span>
          </div>

          <pre>{JSON.stringify(savedProfile, null, 2)}</pre>
        </div>
      )}

      <div className="panel-footer">
        <span>READINESS INDEX</span>
        <span className="footer-value">{readiness}% CALIBRATED</span>
      </div>
    </section>
  );
}

function PanelHeader({
  code,
  title,
  description,
}: {
  code: string;
  title: string;
  description: string;
}) {
  return (
    <div className="panel-header">
      <div className="panel-code">{code}</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  placeholder,
  type = "text",
  required = false,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field" htmlFor={name}>
      <span>{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
      <i />
    </label>
  );
}

function Feedback({
  error,
  success,
}: {
  error: string;
  success: string;
}) {
  if (!error && !success) return null;

  return (
    <div className={`feedback ${error ? "error" : "success"}`}>
      <span>{error ? "!" : "✓"}</span>
      <div>
        <strong>{error ? "SYSTEM NOTICE" : "SYSTEM CONFIRMATION"}</strong>
        <p>{error || success}</p>
      </div>
    </div>
  );
}

function ReadinessCard({
  readiness,
  authenticated,
}: {
  readiness: number;
  authenticated: boolean;
}) {
  const circumference = 2 * Math.PI * 72;
  const dashOffset = circumference - (readiness / 100) * circumference;

  return (
    <article className="readiness-card">
      <div className="card-kicker">
        <span>AI READINESS ENGINE</span>
        <span className="pulse-mark" />
      </div>

      <div className="readiness-visual">
        <svg viewBox="0 0 180 180">
          <circle
            className="readiness-track"
            cx="90"
            cy="90"
            r="72"
          />
          <circle
            className="readiness-progress"
            cx="90"
            cy="90"
            r="72"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashOffset,
            }}
          />
        </svg>

        <div className="readiness-number">
          <strong>{readiness}</strong>
          <span>READINESS</span>
        </div>
      </div>

      <div className="readiness-copy">
        <strong>
          {authenticated
            ? readiness >= 70
              ? "Profile signal is strong."
              : "Calibration in progress."
            : "Your interview intelligence awaits."}
        </strong>
        <p>
          {authenticated
            ? "Complete more profile signals to improve AI personalization."
            : "Initialize your identity to unlock personalized preparation."}
        </p>
      </div>

      <div className="signal-bars">
        {[30, 52, 42, 72, 60, 88, 76, 94, 81, 100, 86, 92].map(
          (height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ),
        )}
      </div>
    </article>
  );
}

function SystemCard() {
  return (
    <article className="system-card">
      <div className="system-card-header">
        <span>NEURAL NETWORK</span>
        <span className="network-status">CONNECTED</span>
      </div>

      <div className="network">
        <div className="network-node node-center">AI</div>
        <div className="network-node node-one">CV</div>
        <div className="network-node node-two">IQ</div>
        <div className="network-node node-three">HR</div>
        <div className="network-node node-four">ATS</div>

        <div className="network-line line-one" />
        <div className="network-line line-two" />
        <div className="network-line line-three" />
        <div className="network-line line-four" />
      </div>

      <div className="system-stats">
        <div>
          <span>MODEL</span>
          <strong>IA-4.2</strong>
        </div>
        <div>
          <span>LATENCY</span>
          <strong>24ms</strong>
        </div>
        <div>
          <span>UPTIME</span>
          <strong>99.9%</strong>
        </div>
      </div>
    </article>
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "The operation could not be completed. Please try again.";
}

export default App;