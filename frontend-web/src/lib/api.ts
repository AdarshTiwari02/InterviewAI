const API_BASE_URL = "http://127.0.0.1:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export type SignupPayload = {
  email: string;
  password: string;
  full_name: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user_id: string;
  email: string;
  full_name: string;
  access_token: string;
  token_type: "bearer";
};

export const api = {
  signup: (payload: SignupPayload) =>
    request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
export type ExperienceLevel =
  | "student_intern"
  | "fresher"
  | "mid_level"
  | "senior"
  | "lead_architect";

export type UserProfilePayload = {
  experience_level: ExperienceLevel;
  target_roles: string[];
  target_company_types: string[];
  linkedin_url?: string | null;
  github_url?: string | null;
  project_links: string[];
  preparing_specific_role: boolean;
  company_name?: string | null;
  job_title?: string | null;
  job_description_text?: string | null;
};

export type UserProfileResponse = UserProfilePayload & {
  user_id: string;
};

export const profileApi = {
  upsertProfile: (userId: string, payload: UserProfilePayload) =>
    request<UserProfileResponse>(`/profiles/${userId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  getProfile: (userId: string) =>
    request<UserProfileResponse>(`/profiles/${userId}`),
};