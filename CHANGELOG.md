# Hotel Service Project – Comprehensive Change Log

This document records all notable changes made to the Hotel Service project during the recent development and troubleshooting cycle.

Dates covered: 2025-09-17 to 2025-09-18


## 1) AI Provider Migration (OpenAI → Google Gemini)

- Updated dependency manifest
  - File: `requirements.txt`
  - Changes:
    - Removed: `openai`
    - Added: `google-generativeai>=0.3.0`
  - Why: Migrate model provider to Google Gemini 1.5 Flash
  - Impact: Backend AI calls now go through Google Generative AI SDK.

- Rewrote AI service integration
  - File: `backend/app/services/ai_services.py`
  - Changes: Replaced OpenAI client and chat-completions with Gemini `GenerativeModel('gemini-1.5-flash')` and `generate_content()`
  - Why: Align code with Gemini APIs and prompt format
  - Impact: AI responses originate from Gemini; no OpenAI key usage needed.

- Environment variables
  - Files:
    - `backend/.env`: `GEMINI_API_KEY` added
    - `/.env` (root): kept `VITE_GEMINI_API_KEY` for frontend only
  - Why: Separate backend and frontend envs; remove duplication
  - Impact: Clearer separation; fewer configuration surprises.


## 2) Supabase Configuration & Environment Hygiene

- Initial addition of backend envs in root `.env`, then consolidation
  - Files:
    - `/.env` (root): initially contained `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY` (backend)
    - Later edited to keep only frontend vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`, `VITE_GEMINI_API_KEY`
    - `backend/.env`: canonical location for backend `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`
  - Why: Ensure `load_dotenv()` in backend picks up correct file; avoid duplication/conflicts
  - Impact: Backend resolves envs from `backend/.env`; frontend resolves from root `.env`.


## 3) Admin Authentication Flow – New Endpoint & Simplification

- Added a dedicated Admin Login endpoint
  - File: `backend/app/routes/admin.py`
  - Changes:
    - New models: `AdminLoginRequest`, `AdminLoginResponse`
    - New endpoint: `POST /admin/login`
    - Import: `create_admin_session`
  - Why: Frontend calls `/admin/login` directly; clearer separation from guest login
  - Impact: Admin auth handled consistently in the admin router.

- Simplified guest auth route to guest-only
  - File: `backend/app/routes/auth.py`
  - Changes:
    - `LoginRequest` now only includes `room_number`, `guest_name`
    - `LoginResponse` only returns guest session data
    - Endpoint `POST /auth/login` now handles guest login only
    - Removed admin-branch logic and import of `create_admin_session`
  - Why: Avoid dual-path complexity and duplication (admin now uses `/admin/login`)
  - Impact: Cleaner responsibilities; fewer chances of endpoint mismatches.


## 4) Admin Session Handling – Demo Mode and Fixes

- Align `create_admin_session` and `verify_session_token`
  - File: `backend/app/services/db_services.py`
  - Changes:
    - `create_admin_session(...)` temporarily forced to demo mode (no DB dependency) and returns `demo_admin_token_*` for `admin/admin123`
    - `verify_session_token(...)` also forced to demo mode to accept `demo_admin_token_*` as valid admin sessions
    - Removed transient debug `print()` statements after verification
  - Why: Supabase admin tables not yet provisioned; enforce consistent behavior to unblock dashboard
  - Impact: Admin dashboard works end-to-end in demo mode. Replace demo mode with real DB checks later (see "Next Steps").

- Notes for production revert:
  - In `db_services.py`, replace `if True:` with the original checks and implement Supabase-backed verification:
    - `create_admin_session`: remove demo `if True` block and use hashed password check against `admin_users`
    - `verify_session_token`: remove demo `if True` block and query `admin_sessions` joined to `admin_users`
  - Ensure DB tables exist and run seed script (see `backend/setup_supabase.py`).


## 5) Frontend Authentication – Response Shape Fix

- Adjust admin login response parsing
  - File: `src/components/LoginForm.tsx`
  - Changes:
    - Admin path now reads: `username: data.username`, `fullName: data.full_name`, `role: data.role`
    - Previously expected `data.user.username` which didn’t match backend response
  - Why: Align with actual backend payload from `/admin/login`
  - Impact: Admin info populates correctly and grants access to `AdminDashboard`.


## 6) API Authorization – Dashboard 401 Fixes

- Verified and fixed 401 Unauthorized on admin dashboard
  - Files:
    - `backend/app/services/db_services.py`: force demo verification accepting `demo_admin_token_*`
    - `src/components/AdminDashboard.tsx`: already sending `Authorization: Bearer <sessionToken>` headers for all admin routes
  - Why: Token generated in demo mode must also be accepted by verification path
  - Impact: Endpoints `/admin/dashboard`, `/admin/requests`, `/admin/staff` return 200 OK.


## 7) Endpoint Consistency – Guest Routes

- Confirmed guest endpoints
  - File: `backend/app/routes/guest.py`
  - Endpoints present: `GET /guest/my-requests`, `GET /guest/requests/status`
  - Why: Guest UI depends on consistent route naming; earlier confusion resolved by using `my-requests` path
  - Impact: Guest status fetch works as expected.


## 8) Redundant Code & File Cleanup

- Frontend components
  - Removed: `src/components/LoginForm_old.tsx`, `src/components/LoginForm_new.tsx`
  - Kept: `src/components/LoginForm.tsx` as the single source of truth
  - Why: Avoid confusion and duplication

- Backend unused routes
  - Removed: `backend/app/routes/history.py`, `backend/app/routes/request.py` (not included in `app/main.py`)
  - Why: Unused and unreferenced routes

- Development/test files
  - Removed: `test_gemini.py`
  - Why: Local validation script not needed in repo

- Documentation
  - Retained: `ADMIN_DASHBOARD_COMPLETE.md`, `GEMINI_MIGRATION_COMPLETE.md`
  - Why: Useful project documentation; not removed.


## 9) Developer Experience & Reliability

- Cache resets and dev server stability
  - Actions: Cleared `node_modules/.cache` and `.vite`, restarted Vite dev server when TS referenced deleted files
  - Why: TypeScript/Vite caching can hold stale references
  - Impact: Clean TypeScript program state, dev server works reliably

- Port conflicts
  - Observed: Vite switched from 5173 → 5174 when 5173 in use
  - Impact: No functional issue; update the accessed URL accordingly.


## 10) Validation & Smoke Tests

- Backend quick tests (manual):
  - `POST /admin/login` with `admin/admin123` → 200 + token `demo_admin_token_*`
  - `GET /admin/dashboard` with `Authorization: Bearer <token>` → 200 with stats
  - `GET /admin/requests` with auth → 200
  - `GET /admin/staff` with auth → 200

- Frontend:
  - Login page: Guest and Admin tabs
  - Admin login renders `AdminDashboard` with stats and tabs


## Next Steps (Recommended)

1. Provision Supabase tables
   - Run/complete `backend/setup_supabase.py` or SQL migration: `admin_users`, `admin_sessions`, `staff_members`, `service_requests`
   - Seed at least one admin user; store SHA-256 hashed password (as implemented in code)

2. Remove demo mode
   - In `db_services.py`, restore DB-backed logic in both `create_admin_session` and `verify_session_token`
   - Re-test `/admin/*` routes with real tokens from `admin_sessions`

3. Lock env management
   - Keep backend secrets strictly in `backend/.env`
   - Frontend stays with `/.env` for `VITE_*` only

4. Document operational runbook
   - Small README section for: starting backend, starting frontend, required env vars, and common troubleshooting (ports, caches)

---

If you want this changelog split by commit or converted into a `Keep a Changelog` format with versions, I can help reformat it and generate version tags (e.g., `0.2.0 – Admin Dashboard Auth Fixes`).
