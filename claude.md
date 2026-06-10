# SYSTEM DESIGN & CODING CONSTRAINTS

This document outlines the strict guidelines and constraints for the development of the Book Marketplace fullstack application.

---

## 1. SYSTEM OVERVIEW

The system is a full-featured book marketplace application:
* Users can register, login, buy/sell books
* Must support OAuth (Google, Facebook)
* Must enforce phone number verification after login
* Must support email flows (verification, reset password)
* Must be scalable to mobile (React Native)

### Tech Stack
* **Backend**: Java (Spring Boot)
* **Frontend Web**: Next.js
* **Mobile**: React Native
* **Database**: PostgreSQL
* **Auth/OTP**: Firebase Authentication
* **Email**: External provider API (NOT raw SMTP)

---

## 2. GLOBAL ENGINEERING PRINCIPLES

* Code must be clean, readable, and modular.
* Follow SOLID principles.
* Avoid over-engineering but ensure scalability.
* Every component must be replaceable and testable.
* No hidden logic — everything explicit.

---

## 3. BACKEND CONSTRAINTS (JAVA)

### Architecture
Use Clean Architecture combined with Hexagonal Architecture (Ports & Adapters).

### Structure
* **Domain Layer** (core business logic)
  * Entities
  * Value Objects
  * Domain Services
  * Domain Interfaces (Ports)
* **Application Layer** (use cases)
  * Use Cases / Application Services
  * DTOs
  * Interfaces for external systems (Ports)
* **Infrastructure Layer** (adapters)
  * Database (JPA / SQL)
  * External APIs (Firebase, Email service)
  * Security (JWT, OAuth)
  * Implementations of Ports
* **Interface Layer** (delivery)
  * REST Controllers
  * Request/Response mapping

### Core Principles
* Domain must be independent of frameworks.
* Dependencies must point inward (Dependency Rule).
* Infrastructure depends on Domain, NOT vice versa.
* Use interfaces (Ports) to decouple external systems.

### Rules
* **NO business logic in Controller.**
* **NO business logic in Infrastructure layer.**
* Business logic lives **ONLY** in Domain and Application (use cases) layers.
* Service layer must be:
  * stateless
  * use-case driven (NOT generic CRUD services)
* Use DTOs strictly:
  * No entity exposure outside domain.
  * Map explicitly between layers.
  * Validate all inputs at boundary (Controller layer).

### Ports & Adapters
Define interfaces in Domain/Application layer (e.g. `UserRepository`, `EmailService`, `OTPService`) and implement them in the Infrastructure layer (e.g. Postgres adapter, Firebase adapter, Email provider adapter).

### Security
* Use JWT-based authentication.
* OAuth (Google, Facebook) handled via adapter layer.
* Enforce phone verification:
  * After login, if phone is NOT verified:
    * Block all business use cases.
    * Allow only verification-related endpoints.

### Transaction Management
* Transactions must be handled at the Application layer.
* Avoid leaking transaction logic into Domain.

### Database Interaction
* Use ORM (JPA) for standard operations.
* Use custom SQL for complex queries.
* Avoid anemic repository pattern.

---

## 4. DATABASE CONSTRAINTS (POSTGRESQL)

### Design
* Normalize to at least 3NF where applicable.
* Use explicit foreign keys.
* Avoid overusing ORM abstraction.

### Rules
* Write critical queries manually (NOT only ORM).
* Use indexes for search, foreign keys, and frequently filtered fields.

### Security
* Apply role-based access (`app_user`, `admin`).
* Restrict direct table access.

### Audit
* All critical tables must have: `created_at`, `updated_at`, `created_by`.

---

## 5. AUTHENTICATION & VERIFICATION FLOW

* OAuth login → create account if not exists.
* After login:
  * IF `phone_number` NOT verified:
    * Force popup.
    * Block usage until verified.
* OTP via Firebase must be validated server-side.

---

## 6. FRONTEND CONSTRAINTS (NEXT.JS + REACT NATIVE)

### Architecture
* Use component-based structure.
* Separate UI components and business logic (hooks/services).

### UI System
* Must follow a consistent design system:
  * Spacing scale (4, 8, 12, 16…).
  * Typography hierarchy.
  * Color tokens (primary, secondary, neutral).

### Rules
* No inline styling chaos.
* Use shared design tokens across web & mobile.
* UI must be reusable.

---

## 7. UI/UX DESIGN PRINCIPLES

* Minimal, clean, modern.
* Inspired by e-commerce platforms and mobile-first design.
* Consistent spacing, clear CTA buttons, avoid clutter.

---

## 8. CODE QUALITY

* Functions must be small and focused.
* Naming must be explicit.
* No magic values (use constants).
* Add comments only when necessary.

---

## 9. EXTENSIBILITY

Future features must be added by:
1. Describing feature in structured format.
2. Mapping to backend modules, database schema, and frontend components.
3. NEVER breaking existing structure or hacking logic into random places.

---

## 10. OUTPUT REQUIREMENTS

When generating code or design:
* Always explain structure briefly.
* Then provide code.
* Code must be production-ready (not pseudo).

---

## 11. FAILURE HANDLING

* Always validate inputs.
* Always handle edge cases.
* Never assume ideal conditions.

---

## 12. VERSION CONTROL (GIT) CONSTRAINTS

### Repository Identity
* Git author must use personal identity (NOT "Antigravity AI").

### Branching Strategy
Use Git Flow (simplified):
* `main` → production-ready code only
* `develop` → integration branch
* `feature/*` → new features
* `fix/*` → bug fixes
* `hotfix/*` → urgent production fixes
* **Rule**: NEVER commit directly to main. All work must go through feature branches.

### Commit Message Convention
Use Conventional Commits: `type(scope): message`.
* *Examples*:
  * `feat(auth): implement Google OAuth login`
  * `fix(cart): correct price calculation bug
* **Rule**: No vague commits like "update", "fix", "done". Message must clearly describe WHAT and WHERE.

### Pull Request Rules
* Every feature must go through a Pull Request.
* PR must include description of change, impacted modules, and screenshots (if UI).
* PR must be reviewed before merge.

### Code Review Constraints
* Reject PR if messy logic, unclear naming, or duplicated code.
* Use "Squash and Merge" for clean history, and delete branch after merge.

### .gitignore Rules
Must exclude: `node_modules`, `build/`, `.env`, `logs/`, IDE configs.

### Environment Management
* Never commit secrets. Use `.env.local` for frontend and `application.yml` with environment variables for backend.

### Release Versioning
Use semantic versioning: `MAJOR.MINOR.PATCH` (e.g. 1.0.0).

---

## 13. AI RESPONSE CONSTRAINTS (CRITICAL)

The AI must strictly follow a deterministic output contract.
* Return output in STRICT JSON format when required. No extra text, no explanation, no markdown.
* Conform to predefined schema (no missing/extra fields, correct types).
* Output must be predictable, machine-readable, consistent, and treat AI output as UNTRUSTED INPUT.
