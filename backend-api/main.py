from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(title="InterviewAI Backend API", version="0.1.0")


# ---------- Enums ----------
class ExperienceLevel(str, Enum):
    STUDENT_INTERN = "student_intern"
    FRESHER = "fresher"
    MID_LEVEL = "mid_level"
    SENIOR = "senior"
    LEAD_ARCHITECT = "lead_architect"


# ---------- In-memory stores (MVP only) ----------
users_store = {}
profiles_store = {}


# ---------- Schemas ----------
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    user_id: UUID
    email: EmailStr
    full_name: str
    access_token: str
    token_type: str = "bearer"


class UserProfileUpsertRequest(BaseModel):
    experience_level: ExperienceLevel
    target_roles: List[str] = Field(min_items=1)
    target_company_types: List[str] = Field(min_items=1)
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    project_links: List[str] = Field(default_factory=list)
    preparing_specific_role: bool = False
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_description_text: Optional[str] = None


class UserProfileResponse(BaseModel):
    user_id: UUID
    experience_level: ExperienceLevel
    target_roles: List[str]
    target_company_types: List[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    project_links: List[str]
    preparing_specific_role: bool
    company_name: Optional[str]
    job_title: Optional[str]
    job_description_text: Optional[str]


# ---------- Health ----------
@app.get("/health")
def health():
    return {"status": "ok"}


# ---------- Auth ----------
@app.post("/auth/signup", response_model=AuthResponse)
def signup(payload: SignupRequest):
    if payload.email in users_store:
        raise HTTPException(status_code=409, detail="User already exists")

    user_id = uuid4()
    users_store[payload.email] = {
        "user_id": user_id,
        "email": payload.email,
        "full_name": payload.full_name,
        "password": payload.password,  # TODO: hash password in DB-backed implementation
    }

    return AuthResponse(
        user_id=user_id,
        email=payload.email,
        full_name=payload.full_name,
        access_token=f"dev-token-{user_id}",
    )


@app.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    user = users_store.get(payload.email)
    if not user or user["password"] != payload.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return AuthResponse(
        user_id=user["user_id"],
        email=user["email"],
        full_name=user["full_name"],
        access_token=f"dev-token-{user['user_id']}",
    )


# ---------- Profile ----------
@app.put("/profiles/{user_id}", response_model=UserProfileResponse)
def upsert_profile(user_id: UUID, payload: UserProfileUpsertRequest):
    if payload.preparing_specific_role:
        if not payload.company_name or not payload.job_title or not payload.job_description_text:
            raise HTTPException(
                status_code=422,
                detail="company_name, job_title, and job_description_text are required when preparing_specific_role is true",
            )

    profile = {
        "user_id": user_id,
        **payload.model_dump(),
    }
    profiles_store[str(user_id)] = profile
    return UserProfileResponse(**profile)


@app.get("/profiles/{user_id}", response_model=UserProfileResponse)
def get_profile(user_id: UUID):
    profile = profiles_store.get(str(user_id))
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return UserProfileResponse(**profile)