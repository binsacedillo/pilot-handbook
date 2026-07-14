# PilotHandbook System Architecture

```mermaid
graph TD
    subgraph "Client Layer (PWA)"
        UI[Next.js 16 / Tailwind v4]
        Cache[Offline Storage / PWA]
    end

    subgraph "Logic Layer (API)"
        tRPC[tRPC Procedures]
        CS[Command Service]
        DE[Decision Engine]
        CE[Compliance Engine]
    end

    subgraph "External Services"
        Clerk[Clerk Auth / RBAC]
        PayMongo[PayMongo Monetization]
        Upstash[Upstash Redis / Rate Limit]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL / Neon)]
        Prisma[Prisma ORM]
        Audit[Audit Logs]
    end

    %% Flow
    UI --> tRPC
    tRPC --> Clerk
    tRPC --> Upstash
    tRPC --> CS
    CS --> DE
    CS --> Prisma
    Prisma --> DB
    CS --> Audit
    PayMongo -- Webhook --> tRPC
```

# Monetization & Verification Flow

> [!NOTE]
> **Conceptual Architecture:** The following payment flows and PayMongo integrations represent planned premium features. They are not currently active in the database schema or code repository.

```mermaid
sequenceDiagram
    participant Pilot
    participant App as Pilot Handbook (Next.js)
    participant PM as PayMongo API
    participant DB as Database (Prisma)

    Pilot->>App: Click "Upgrade to Pro"
    App->>PM: Request Checkout Link (Secret Key)
    PM-->>App: Return checkout_url
    App->>Pilot: Redirect to Secure Payment Page
    Pilot->>PM: Pay (GCash/Card/Maya)
    PM->>App: Webhook: source.chargeable / payment.paid
    App->>DB: Update User Plan to "PRO"
    App->>Pilot: Show "Welcome to Pro" Success UI
```

# Data Integrity: The Transaction Plan

```mermaid
flowchart TD
    Start([Pilot Logs Flight]) --> Auth{Is Authorized?}
    Auth -- Yes --> Transaction[Start Prisma Transaction]
    
    subgraph TransactionBlock [Atomic Database Updates]
        CreateF[Create Flight Record]
        UpdateA[Increment Aircraft Flight Hours]
        CreateAudit[Generate Audit Log]
    end

    Transaction --> CreateF
    CreateF --> UpdateA
    UpdateA --> CreateAudit
    CreateAudit --> Commit{Commit?}

    Commit -- Success --> Done([Flight Logged & Synced])
    Commit -- Failure --> Rollback[Rollback Everything]
    Rollback --> Error([Notify Pilot: Sync Error])
```

# PilotHandbook Database Schema (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ AIRCRAFT : "owns"
    USER ||--o{ FLIGHT : "logs"
    USER ||--o| PILOT_PROFILE : "has"
    USER ||--o| USER_PREFERENCES : "sets"
    USER ||--o{ SAFETY_SNAPSHOT : "generates"
    
    AIRCRAFT ||--o{ FLIGHT : "assigned_to"
    AIRCRAFT ||--o{ SAFETY_SNAPSHOT : "evaluated_in"

    USER {
        string id PK
        string clerkId UK
        string email UK
        enum role
    }

    PILOT_PROFILE {
        string id PK
        string userId FK
        string license_number
        datetime medical_expiry
    }

    AIRCRAFT {
        string id PK
        string registration UK
        float flight_hours
        boolean is_archived
    }

    FLIGHT {
        string id PK
        datetime date
        string departure_code
        string arrival_code
        float duration
        boolean is_verified
    }

    SAFETY_SNAPSHOT {
        string id PK
        enum type
        json results
        enum status
    }
```

`SafetySnapshot.type` is constrained to `DENSITY_ALTITUDE`, `WEIGHT_BALANCE`, or `FUEL`.
`SafetySnapshot.status` is constrained to `NORMAL`, `CAUTION`, `WARNING`, or `INVALID`.

# 🚀 User Journey: From Onboarding to Professional Operations

```mermaid
flowchart TD
    Start([Pilot Onboarding]) --> Auth[Register via Clerk]
    Auth --> Profile[Set up Pilot Profile & License]
    Profile --> Aircraft[Register Training Aircraft]

    subgraph Preflight [Guided Preflight Phase]
        Check[Start Preflight Assistant]
        Loading[Perform Loading Check / W&B]
        Perf[Perform Performance Check]
        Fuel[Complete Fuel Planning]
        Snapshot[Review Safety Snapshot & Mentorship Tips]
    end

    Aircraft --> Preflight
    Snapshot --> Decision{Is it Safe?}
    
    Decision -- No --> Adjust[Adjust Loading or Wait for Weather]
    Adjust --> Preflight
    
    Decision -- Yes --> Flight([Execute Flight])
    
    subgraph Postflight [Logging & Compliance]
        Log[Log Flight Entry]
        Sync[Automatic Aircraft Hour Update]
        Currency[Check Pilot Currency Status]
        Verify[Request Instructor Digital Signature]
    end

    Flight --> Postflight
    
    subgraph Monetization [The Professional Path]
        Limit{Hit Entry Limit?}
        Upgrade[Upgrade to Pro via PayMongo]
        ProFeatures[Unlock PDF Exports & Fleet Management]
    end

    Postflight --> Limit
    Limit -- Yes --> Upgrade
    Upgrade --> ProFeatures
    ProFeatures --> Postflight
```
