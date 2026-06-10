# Boki — System Design & Coding Constraints

> **This document is the single source of truth for all engineering constraints governing the Boki project.**
> Every contributor (human or AI) must read and follow these rules before writing any code.
>
> Last updated: 2026-06-10

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Global Engineering Principles](#2-global-engineering-principles)
3. [Backend Constraints (Java)](#3-backend-constraints-java)
4. [Database Constraints (PostgreSQL)](#4-database-constraints-postgresql)
5. [Authentication & Verification Flow](#5-authentication--verification-flow)
6. [Frontend Constraints (Next.js + React Native)](#6-frontend-constraints-nextjs--react-native)
7. [UI/UX Design Principles](#7-uiux-design-principles)
8. [Code Quality](#8-code-quality)
9. [Extensibility](#9-extensibility)
10. [Output Requirements](#10-output-requirements)
11. [Failure Handling](#11-failure-handling)
12. [Version Control (Git)](#12-version-control-git)
13. [AI Response Constraints](#13-ai-response-constraints)

---

## 1. System Overview

Boki is a full-featured book marketplace application:

- Users can **register**, **login**, **buy/sell books**
- Must support **OAuth** (Google, Facebook)
- Must enforce **phone number verification** after login
- Must support **email flows** (verification, reset password)
- Must be **scalable to mobile** (React Native)

### Tech Stack

| Layer        | Technology                            |
|--------------|---------------------------------------|
| Backend      | Java (Spring Boot)                    |
| Frontend Web | Next.js                               |
| Mobile       | React Native                          |
| Database     | PostgreSQL                            |
| Auth / OTP   | Firebase Authentication               |
| Email        | External provider API (NOT raw SMTP)  |

---

## 2. Global Engineering Principles

- Code must be **clean**, **readable**, and **modular**
- Follow **SOLID** principles
- Avoid over-engineering but ensure **scalability**
- Every component must be **replaceable** and **testable**
- No hidden logic — **everything explicit**

---

## 3. Backend Constraints (Java)

### 3.1 Architecture

Use **Clean Architecture** combined with **Hexagonal Architecture** (Ports & Adapters).

### 3.2 Layer Structure

#### Domain Layer (core business logic)

- Entities
- Value Objects
- Domain Services
- Domain Interfaces (Ports)

#### Application Layer (use cases)

- Use Cases / Application Services
- DTOs
- Interfaces for external systems (Ports)

#### Infrastructure Layer (adapters)

- Database (JPA / SQL)
- External APIs (Firebase, Email service)
- Security (JWT, OAuth)
- Implementations of Ports

#### Interface Layer (delivery)

- REST Controllers
- Request/Response mapping

### 3.3 Core Principles

- Domain must be **independent of frameworks**
- Dependencies must point **inward** (Dependency Rule)
- Infrastructure depends on Domain, **NOT** vice versa
- Use **interfaces (Ports)** to decouple external systems

### 3.4 Rules

| Rule | Description |
|------|-------------|
| No business logic in Controller | Controllers only handle HTTP concerns (request parsing, response mapping, validation) |
| No business logic in Infrastructure | Infrastructure only implements technical adapters |
| Business logic lives ONLY in | **Domain** layer and **Application** layer (use cases) |

### 3.5 Service Layer Requirements

- Must be **stateless**
- Must be **use-case driven** (NOT generic CRUD services)

### 3.6 DTO Rules

- **No entity exposure** outside domain
- Map **explicitly** between layers
- **Validate all inputs** at boundary (Controller layer)

### 3.7 Ports & Adapters

Define interfaces in Domain/Application layer:

```
UserRepository     (port)  → implemented by PostgresUserRepositoryAdapter
EmailService       (port)  → implemented by SendGridEmailAdapter
OTPService         (port)  → implemented by FirebaseOtpAdapter
TokenService       (port)  → implemented by JwtTokenProvider
OAuthProvider      (port)  → implemented by GoogleOAuthAdapter, FacebookOAuthAdapter
```

Implement in Infrastructure layer:

- PostgreSQL adapter
- Firebase adapter
- Email provider adapter

### 3.8 Security

- Use **JWT-based** authentication
- OAuth (Google, Facebook) handled via adapter layer
- **Enforce phone verification**:
  - After login, if phone **NOT verified**:
    - → Block all business use cases
    - → Allow only verification-related endpoints

### 3.9 Transaction Management

- Transactions must be handled at **Application layer**
- **Avoid** leaking transaction logic into Domain

### 3.10 Database Interaction

- Use **ORM (JPA)** for standard operations
- Use **custom SQL** for complex queries
- **Avoid** anemic repository pattern

---

## 4. Database Constraints (PostgreSQL)

### 4.1 Design

- Normalize to at least **3NF** where applicable
- Use **explicit foreign keys**
- **Avoid** overusing ORM abstraction

### 4.2 Query Rules

- Write **critical queries manually** (NOT only ORM-generated)
- Use **indexes** for:
  - Search fields
  - Foreign keys
  - Frequently filtered fields

### 4.3 Security

Apply **role-based access**:

| Role       | Description                  |
|------------|------------------------------|
| `app_user` | Application-level DB access  |
| `admin`    | Administrative DB access     |

- **Restrict** direct table access where applicable

### 4.4 Audit Requirements

All critical tables **must** have:

| Column       | Type        | Description              |
|--------------|-------------|--------------------------|
| `created_at` | `TIMESTAMP` | Record creation time     |
| `updated_at` | `TIMESTAMP` | Last modification time   |
| `created_by` | `VARCHAR`   | User who created record  |

---

## 5. Authentication & Verification Flow

### 5.1 OAuth Login

```
OAuth login → create account if not exists → issue JWT
```

### 5.2 Phone Verification Enforcement

```
After login:
  IF phone_number NOT verified:
    → Force popup on frontend
    → Block all business use cases on backend
    → Allow only verification-related endpoints
  UNTIL phone is verified
```

### 5.3 OTP Validation

- OTP sent via **Firebase Authentication** (client-side SDK)
- OTP must be **validated server-side** via Firebase Admin SDK

### 5.4 Allowed Endpoints When Phone Not Verified

| Endpoint                      | Method | Purpose              |
|-------------------------------|--------|----------------------|
| `/api/auth/verify-phone`      | POST   | Submit OTP code      |
| `/api/auth/resend-otp`        | POST   | Resend OTP           |
| `/api/auth/me`                | GET    | Get current user     |
| `/api/auth/logout`            | POST   | Logout               |

All other endpoints → **403 Forbidden** with clear error message.

---

## 6. Frontend Constraints (Next.js + React Native)

### 6.1 Architecture

- Use **component-based** structure
- Separate:
  - **UI components** (presentational)
  - **Business logic** (hooks / services)

### 6.2 Design System

Must follow a **consistent design system**:

#### Spacing Scale

```
4px | 8px | 12px | 16px | 24px | 32px | 48px | 64px
```

#### Typography Hierarchy

| Level | Usage              |
|-------|--------------------|
| H1    | Page titles        |
| H2    | Section headers    |
| H3    | Sub-sections       |
| H4    | Card titles        |
| Body  | Regular text       |
| Small | Captions, metadata |

#### Color Tokens

| Token       | Purpose                        |
|-------------|--------------------------------|
| `primary`   | Brand color, CTAs              |
| `secondary` | Accent, secondary actions      |
| `neutral`   | Text, backgrounds, borders     |
| `success`   | Positive states                |
| `warning`   | Caution states                 |
| `error`     | Error states, destructive      |

### 6.3 Rules

- **No inline styling chaos** — use CSS modules, design tokens, or styled system
- Use **shared design tokens** across web & mobile
- UI must be **reusable** and **composable**

---

## 7. UI/UX Design Principles

### 7.1 Style

- **Minimal**, clean, modern
- Inspired by:
  - E-commerce platforms
  - Mobile-first design

### 7.2 Rules

| Rule                 | Description                                    |
|----------------------|------------------------------------------------|
| Consistent spacing   | Follow the spacing scale defined in §6.2       |
| Clear CTA buttons    | Primary actions must be visually prominent      |
| Avoid clutter        | Each screen has one clear purpose               |
| Mobile-first         | Design for mobile viewport first, then scale up |

---

## 8. Code Quality

| Rule                  | Description                                           |
|-----------------------|-------------------------------------------------------|
| Small functions       | Functions must be small and focused (single responsibility) |
| Explicit naming       | Names must clearly describe purpose                   |
| No magic values       | Use constants or enums for all fixed values           |
| Minimal comments      | Add comments only when **necessary** (explain *why*, not *what*) |

---

## 9. Extensibility

### 9.1 Adding New Features

Future features must be added by:

1. Describing the feature in a **structured format**
2. Mapping to:
   - Backend modules (domain, application, infrastructure, interface)
   - Database schema (migrations)
   - Frontend components (pages, components, hooks, services)

### 9.2 Anti-Patterns (NEVER do these)

- ❌ Break existing structure
- ❌ Hack logic into random places
- ❌ Add business logic to controllers or infrastructure
- ❌ Skip migration scripts for schema changes
- ❌ Create one-off components that duplicate existing ones

---

## 10. Output Requirements

When generating code or design:

1. Always **explain structure** briefly
2. Then provide code
3. Code must be **production-ready** (not pseudo-code)

---

## 11. Failure Handling

| Rule                       | Description                                     |
|----------------------------|-------------------------------------------------|
| Always validate inputs     | At controller boundary, before any processing   |
| Always handle edge cases   | Null checks, empty collections, invalid states   |
| Never assume ideal         | Network failures, DB timeouts, invalid tokens    |
| Structured error responses | All errors return consistent JSON format         |

### Error Response Format

```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "email",
      "message": "must be a valid email address"
    }
  ],
  "timestamp": "2026-06-10T23:30:00Z",
  "path": "/api/auth/register"
}
```

---

## 12. Version Control (Git)

### 12.1 Repository Identity

- Git author must use **personal identity** (NOT "Antigravity AI")
- Use:
  - `user.name` = your real name or consistent dev name
  - `user.email` = your real email

### 12.2 Branching Strategy (Git Flow)

| Branch         | Purpose                         |
|----------------|----------------------------------|
| `main`         | Production-ready code only       |
| `develop`      | Integration branch               |
| `feature/*`    | New features                     |
| `fix/*`        | Bug fixes                        |
| `hotfix/*`     | Urgent production fixes          |

**Rules:**

- ❌ **NEVER** commit directly to `main`
- ✅ All work must go through feature branches

### 12.3 Commit Message Convention

Use **Conventional Commits**:

```
type(scope): message
```

**Types:**

| Type       | Usage                              |
|------------|------------------------------------|
| `feat`     | New feature                        |
| `fix`      | Bug fix                            |
| `refactor` | Code restructuring (no behavior change) |
| `docs`     | Documentation changes              |
| `chore`    | Build, tooling, config changes     |
| `test`     | Adding or updating tests           |
| `style`    | Formatting, whitespace (no logic)  |

**Examples:**

```
feat(auth): implement Google OAuth login
fix(cart): correct price calculation bug
refactor(user): clean service logic
docs(api): update endpoint documentation
```

**Rules:**

- ❌ No vague commits like `"update"`, `"fix"`, `"done"`
- ✅ Message must clearly describe **WHAT** and **WHERE**

### 12.4 Pull Request Rules

- Every feature must go through a **Pull Request**
- PR must include:
  - Description of change
  - Impacted modules
  - Screenshots (if UI)
- PR must be **reviewed before merge** (even if solo → self-review)

### 12.5 Code Review Constraints

Before merging, code must:

- ✅ Follow project structure
- ✅ Not break existing features
- ✅ Be readable and modular

Reject PR if:

- ❌ Messy logic
- ❌ Unclear naming
- ❌ Duplicated code

### 12.6 Commit Size Rules

- Keep commits **small and focused**
- **One commit = one logical change**

### 12.7 Branch Naming Convention

```
feature/auth-login
feature/book-listing
fix/payment-bug
hotfix/security-patch
```

### 12.8 Merge Strategy

- Use **"Squash and Merge"** for clean history
- **Delete branch** after merge

### 12.9 `.gitignore` Rules

Must exclude:

- `node_modules/`
- `build/` / `target/`
- `.env` (all variants)
- `logs/`
- IDE configs (`.idea/`, `.vscode/`)

### 12.10 Environment Management

- ❌ **Never commit secrets**
- Use:
  - `.env.local` (frontend)
  - `application.yml` with environment variables (backend)

### 12.11 Release Versioning

Use **Semantic Versioning**:

```
MAJOR.MINOR.PATCH
```

| Version | Meaning         |
|---------|-----------------|
| `1.0.0` | Initial release |
| `1.1.0` | New feature     |
| `1.1.1` | Bug fix         |

---

## 13. AI Response Constraints

> **CRITICAL**: These rules govern all AI-generated output in the system.

### 13.1 Output Format Enforcement

- AI must return output in **STRICT JSON** format when required
- No extra text, no explanation, no markdown wrapping

### 13.2 Schema Validation

All outputs must conform to a predefined schema:

- ✅ No missing fields
- ✅ No extra fields
- ✅ Correct data types
- ✅ Respect field constraints (length, enum values, etc.)

### 13.3 Deterministic Structure

- Output must be **predictable** and **machine-readable**
- Avoid natural language when structured output is required

### 13.4 Error Handling Strategy

If output is invalid:

1. System must **reject** the response
2. System must **retry** generation
3. Retry must:
   - Reinforce constraints
   - Include previous error context

### 13.5 Self-Correction Mechanism

AI should be prompted to fix its own output when invalid:

```
"Your previous output was invalid JSON. Fix it and return valid JSON only."
```

### 13.6 No Hidden Assumptions

- AI must **not assume** missing data
- Must explicitly return `null` or default values

### 13.7 Consistency Rules

- Same input → same structure output
- Field naming must be consistent across all responses

### 13.8 Separation of Concerns

- AI generates **data ONLY**
- System handles:
  - Validation
  - Persistence
  - Business logic

### 13.9 Logging & Debugging

- Store **raw AI response** for debugging
- Store **parsed output** separately

---

## Final Rule

> **This system must behave like a production-grade scalable application, not a demo project.**
>
> - Git history must be **clean**, **readable**, and **production-grade**
> - Anyone reading commit history must understand the **evolution** of the system
> - AI output must always be treated as **UNTRUSTED INPUT**
> - System must **validate and enforce correctness** before using AI output
