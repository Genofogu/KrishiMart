# Krishi Mart

> **Krishi Mart** is an agriculture-focused digital marketplace and ecosystem designed to connect farmers with buyers while also helping farmers access agricultural inputs, machinery, market intelligence, and future AI-powered advisory services.

**Current stage:** Krishi Mart 1.0 — functional React prototype  
**Future direction:** Krishi Mart 2.0 — secure, full-stack, multilingual, AI-enabled agriculture platform

---

## Table of Contents

- [Overview](#overview)
- [Current Architecture](#current-architecture)
- [What We Have Built](#what-we-have-built)
- [User Roles](#user-roles)
- [Outfield](#outfield)
- [Infield](#infield)
- [Admin Control Tower](#admin-control-tower)
- [Cloudinary Media Engine](#cloudinary-media-engine)
- [Current User Journeys](#current-user-journeys)
- [Current Data Architecture](#current-data-architecture)
- [Technology Stack](#technology-stack)
- [Current Limitations](#current-limitations)
- [Security Findings](#security-findings)
- [Krishi Mart 2.0 Vision](#krishi-mart-20-vision)
- [AI Strategy](#ai-strategy)
- [High-Moat Ideas](#high-moat-ideas)
- [Production Architecture](#production-architecture)
- [Development Roadmap](#development-roadmap)
- [What We Are Deliberately Not Building Yet](#what-we-are-deliberately-not-building-yet)
- [Vision](#vision)

---

# Overview

Krishi Mart started as a marketplace concept focused on solving two sides of the agricultural ecosystem:

### OUTFIELD — Sell & Connect

Farmers can:

- List agricultural produce
- Add crop quantity and price
- Upload crop/produce images
- Offer produce for per-kg purchases
- Receive bulk buyer inquiries
- Connect with buyers

Buyers can:

- Discover agricultural produce
- Search and filter crops
- View farmer/product information
- Estimate distance from the farmer
- Place simulated per-kg orders
- Contact bulk farmers through WhatsApp or phone

### INFIELD — Grow & Access

Farmers can:

- Browse agricultural inputs
- Buy seeds
- Browse fertilizers
- Browse pesticides
- Browse tools
- Add products to a cart
- Explore agricultural machinery
- Contact machinery providers

The long-term goal is to evolve Krishi Mart from a simple marketplace into a **digital operating platform for Indian agriculture**.

---

# Current Architecture

Krishi Mart is currently a **client-side React Single Page Application**.

```text
                    KRISHI MART 1.0
                          │
          ┌───────────────┴───────────────┐
          │                               │
     OUTFIELD                         INFIELD
          │                               │
  ┌───────┼────────┐              ┌───────┼────────┐
  │       │        │              │       │        │
Farmer   Buyer   Bulk           Inputs  Cart   Machinery
Listing  Market  Orders         Store          Rental
  │       │        │              │       │        │
  └───────┴────────┴──────────────┴───────┴────────┘
                          │
                    Admin Control Tower
                          │
                    Cloudinary Media
```

### Current technical reality

```text
Frontend
React 19.2.4
TypeScript 5.8
Vite 6.2
Tailwind CSS
        │
        ├── React State
        ├── localStorage
        ├── Static seed data
        │
        ├── Cloudinary REST API
        ├── Browser Geolocation
        ├── WhatsApp deep links
        └── tel: phone links

Backend:       Not implemented
Database:      Not implemented
Real AI API:   Not implemented
Payment:       Not implemented
```

The current project is therefore a **functional prototype, not yet a production multi-user platform**.

---

# What We Have Built

## 1. Authentication & Session Manager

### Implemented

- User registration
- User login
- Farmer role
- Consumer role
- Admin role
- Village selection
- Land-size information
- Remember-me style session behavior
- Failed-login lockout
- Automatic session timeout
- Client-side role switching

### Current status

[Prototype] **Functional Prototype**

### Current limitation

Authentication is currently handled in the browser using localStorage. Passwords are not securely hashed and authorization is not enforced by a backend.

---

# 2.Farmer Dashboard

The Farmer Dashboard is the main farmer-facing workspace.

### Implemented

- Farmer profile
- Farm/land information
- Produce listing
- Crop selection
- Crop category
- Harvest date
- Quantity in kilograms
- Price per kilogram
- Multiple image uploads
- Pending listing status
- Mandi price display
- Village agent information

### Produce listing flow

```text
Farmer
   ↓
Add New Produce
   ↓
Select Crop
   ↓
Enter Quantity
   ↓
Enter Price/Kg
   ↓
Upload Photos
   ↓
Submit Listing
   ↓
Status = Pending
   ↓
Admin Review
   ↓
Approve / Reject
```

### Current status

[Prototype] **Functional Prototype**

Listings are currently stored in client-side application state and are not synchronized between different users/devices.

---

# 3.Consumer Produce Marketplace

The consumer-facing marketplace allows users to discover farmer produce.

### Implemented

- Produce cards
- Search
- Category filtering
- Debounced search
- Vegetable category
- Fruit category
- Grain category
- Cash crop category
- Product detail pages
- Image gallery
- Lightbox
- Seller information
- Trust metrics
- Distance calculation
- Quantity selection
- Simulated checkout

### Search

Search is debounced at approximately **300ms** to avoid unnecessary UI updates.

### Distance

The application uses browser geolocation and Haversine distance calculations, with fallback/static village locations when live GPS is unavailable.

### Current status

[Complete] **Strong Client-Side Prototype**

---

# 4.Bulk Crop Marketplace

Krishi Mart also contains a bulk wholesale flow intended for:

- Traders
- Hotels
- Processors
- FPOs
- Commercial buyers
- Wholesale buyers

### Implemented

- Bulk crop tab
- Bulk quantity information
- Farmer information
- Target price
- Available tonnage
- WhatsApp inquiry
- Direct phone contact

### Example

```text
Buyer
  ↓
Bulk Crops
  ↓
Select Crop
  ↓
View Available Quantity
  ↓
View Farmer
  ↓
WhatsApp Inquiry
  ↓
Direct Farmer Conversation
```

### Current status

[Prototype] **Functional Prototype**

### Still missing

- Digital contracts
- Negotiation workflow
- Escrow
- Payment protection
- Quality dispute management
- Formal bulk order lifecycle

---

# 5.Infield Agricultural Input Store

The Infield store focuses on helping farmers obtain the things they need to grow crops.

### Implemented categories

- Seeds
- Fertilizers
- Pesticides
- Tools
- Agricultural products

### Cart functionality

- Add item
- Remove item
- Increase quantity
- Decrease quantity
- Cart drawer
- Item count
- Weight tracking
- Price calculation
- Simulated checkout

### Current status

[Complete] **Functional Client-Side Prototype**

### Still missing

- Real supplier inventory
- Dealer synchronization
- Online payments
- COD
- Order fulfillment
- Delivery tracking

---

# 6.Agricultural Machinery Rental

Krishi Mart includes an Infield machinery rental concept.

### Machinery categories/concepts

- Tractors
- Combine harvesters
- Laser levelers
- Power tillers
- Sprayers
- Other agricultural equipment

### Implemented

- Machinery cards
- Specifications
- Hourly rates
- Daily rates
- Provider information
- Booking interface
- Direct phone contact

### Current status

[Mock/Static] **UI / Mock Prototype**

### Still missing

- Availability calendar
- Real booking reservation
- Provider dashboard
- Booking confirmation
- Security deposit
- Online payment
- GPS/telematics
- Rental lifecycle management

---

# 7.Admin Control Tower

An administrative control interface has been created for managing the prototype marketplace.

### Implemented

#### Listing validation

Admin can:

- View pending listings
- Compare farmer price with Mandi benchmark
- Approve listings
- Reject listings

#### Analytics

Prototype analytics include:

- GMV
- Active listings
- Order volume
- Top produce
- Marketplace KPIs

#### Audit logs

Admin can inspect:

- Login/security events
- Important actions
- Event severity
- Audit activity

#### Demo reset

The prototype includes an emergency/demo reset capability to restore initial seed data.

### Current status

[Complete] **Functional Client-Side Prototype**

---

# 8.Cloudinary Media Engine

One of the strongest technically implemented parts of the current prototype is the media pipeline.

### Implemented

- Direct image uploads
- Drag-and-drop uploads
- Camera capture
- Upload progress
- Remote URL ingestion
- Cloudinary CDN delivery
- Dynamic image transformations
- Automatic format optimization
- Automatic quality optimization
- Responsive image sizing
- Cropping
- Progressive loading
- Lightbox viewing
- Broken-image fallback
- Asset library inspection
- Cloudinary configuration interface

### Transformations

The current implementation uses Cloudinary transformations such as:

```text
f_auto
q_auto
responsive width/height
fill/crop transformations
```

### Current status

[Complete] **Working Integration**

### Security improvement required

The current unsigned upload configuration is exposed to the client. A production version should use protected server-side signed upload authorization.

---

# 9.Mandi Price Intelligence

A Mandi pricing concept has already been integrated into the UI.

### Current implementation

- Static Mandi price dictionary
- Farmer-facing price information
- Admin price comparison
- Listing price variance indicators

### Current status

[Mock/Static] **Mock / Static Data**

### Future

Replace static prices with reliable live market data and historical intelligence.

---

# 10.Government Schemes

Krishi Mart contains a government scheme section.

### Current implementation

- Static scheme listings
- Farmer-facing scheme information

### Current status

[Mock/Static] **Mock / Static Data**

### Future

Potential capabilities:

- Eligibility checking
- Personalized scheme matching
- Document checklist
- Application guidance
- Status tracking
- Regional scheme discovery

---

# 11.Village Agent / Offline Support Concept

The current prototype contains a local field-agent concept.

### Purpose

Connect farmers with local assistance when they need help using digital services.

### Current implementation

- Village-based agent information
- Agent contact
- Direct calling

### Future direction

This can evolve into a **Kisan Mitra field network**, where trained local people help farmers with:

- Registration
- Crop listing
- Digital orders
- AI assistance
- Documentation
- Government schemes
- Digital payments

---

# ⭐ 12. Product Reviews

The product detail experience includes:

- Ratings
- Comments
- Image reviews
- Seller trust information

### Current status

[Prototype] **Prototype**

Reviews currently use local React state and therefore are not yet permanently stored in a production database.

---

# Current User Journeys

## Farmer

```text
Login / Signup
      ↓
Farmer Dashboard
      ↓
View Mandi Information
      ↓
View Village Agent
      ↓
List Produce
      ↓
Upload Photos
      ↓
Enter Crop + Quantity + Price
      ↓
Submit
      ↓
Pending Admin Approval
```

The farmer can also:

```text
INFIELD
  ↓
Browse Agricultural Inputs
  ↓
Add to Cart
  ↓
Simulated Checkout
```

and:

```text
Rent Machinery
  ↓
View Equipment
  ↓
Contact Provider
```

---

## Consumer / Buyer

```text
Login
  ↓
Consumer Marketplace
  ↓
Search / Filter Produce
  ↓
View Product
  ↓
View Farmer + Distance
  ↓
Select Quantity
  ↓
Simulated Order
```

For bulk purchases:

```text
Bulk Marketplace
  ↓
Select Crop
  ↓
View Farmer
  ↓
View Quantity / Price
  ↓
WhatsApp / Phone Inquiry
```

---

## Admin

```text
Admin Login
   ↓
Admin Control Tower
   ├── Listing Validation
   ├── Mandi Price Comparison
   ├── Analytics
   ├── Users
   ├── Village Agents
   ├── Audit Logs
   └── Demo Reset
```

---

# Current Data Architecture

The current prototype does **not** use a remote database.

Data is represented using TypeScript models and browser state.

### Current entities include concepts such as

- User
- Product
- Order
- Review
- Audit Log
- Agricultural inputs
- Machinery
- Shops
- Mandi prices
- Government schemes
- Village agents

### Current persistence

```text
localStorage
├── krishi_users
├── krishi_user
├── krishi_orders
├── krishi_audit_logs
└── krishi_cloudinary_config

React State
└── products / reviews / UI state
```

This is suitable for a prototype but not for a real multi-user marketplace.

---

# Technology Stack

## Frontend

- React 19.2.4
- TypeScript 5.8
- Vite 6.2
- Tailwind CSS
- Lucide icons

## Browser APIs

- Geolocation API
- localStorage
- tel: protocol
- WhatsApp links

## Media

- Cloudinary REST API
- CDN transformations

## Current architecture

```text
React
  ↓
TypeScript
  ↓
Client State
  ↓
localStorage
```

There is currently:

- - No Node.js/Express backend
- - No PostgreSQL/MySQL/MongoDB production database
- - No real payment gateway
- - No real AI API
- - No server-side RBAC

---

# [Warning] Current Limitations

Krishi Mart 1.0 is intentionally a prototype and therefore has several limitations.

### Architecture

- No backend server
- No persistent multi-user database
- Browser-dependent data
- No cross-device synchronization
- No background jobs

### Authentication

- Client-side authentication
- Plaintext password storage
- Client-controlled roles
- No phone OTP

### Marketplace

- Simulated orders
- Client-controlled price calculation
- No real payment
- No escrow
- No formal dispute system

### Logistics

- No farm-gate pickup booking
- No logistics partner integration
- No live tracking

### Mandi

- Static pricing
- No live market feed

### Government schemes

- Static scheme data
- No eligibility engine

### AI

- No production AI integration yet

### Language

- Current UI is primarily English
- No complete i18n system yet
- No voice-first farmer interface

---

# Security Findings

The current prototype should **not be treated as production-ready for real financial or sensitive user data**.

## [Critical / Not Implemented] Critical

### 1.Plaintext passwords

Passwords are stored in browser storage.

**Future fix:**

- Server-side authentication
- Argon2id/bcrypt password hashing
- Secure sessions
- HTTP-only cookies

### 2.Client-side authorization

A user's role is controlled by client-side state/localStorage.

**Future fix:**

- Server-enforced RBAC
- Verified authentication tokens/session
- Authorization on every protected API

### 3.Client-controlled pricing

The current prototype performs order calculations on the client.

**Future fix:**

- Server-side price lookup
- Server-side stock validation
- Server-side total calculation
- Transaction-safe stock reservation

## [High] High

### 4.Personal information exposure

Farmer/agent phone information and location-related information should not be unnecessarily exposed in a public client bundle.

**Future fix:**

- Masked communication
- Controlled contact access
- Approximate location where appropriate
- Protected APIs

### 5.Cloudinary unsigned upload abuse

Unsigned upload configuration can be abused if exposed publicly.

**Future fix:**

- Protected backend upload endpoint
- Signed/short-lived upload authorization
- File size/type validation
- Rate limiting

---

# Krishi Mart 2.0 Vision

Krishi Mart 2.0 aims to become more than an agriculture marketplace.

The goal is a connected ecosystem:

```text
                     KRISHI MART 2.0
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
      OUTFIELD           INFIELD            INTELLIGENCE
        │                  │                  │
     Sell Crop          Buy Inputs        AI Advisory
     Bulk Orders        Rent Machinery    Weather
     B2B Buyers         Group Buying      Mandi Prices
     Export             Suppliers         Soil Insights
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    TRUST + PAYMENTS
                           │
                  Escrow + Verification
                           │
                       LOGISTICS
                           │
                    Farm-Gate Delivery
```

---

# AI Strategy

AI should be used where it solves real agricultural problems rather than simply adding an AI chatbot.

## 1. Kisan Sathi — Vernacular Voice Assistant

A farmer could say:

> "Mera 20 quintal gehu Rampur mein ready hai, 24 rupaye kilo mein bechna hai."

The system could extract:

```json
{
  "crop": "Wheat",
  "quantity": 2000,
  "price_per_kg": 24,
  "village": "Rampur"
}
```

and create a structured listing.

### Goal

Reduce complicated typing and digital literacy barriers.

**Priority: P0**

---

## 2. AI Crop Disease Detection

Farmer uploads a crop/leaf photo.

AI analyzes the image and provides:

- Possible disease
- Severity
- Recommended next step
- Preventive guidance

The system should be grounded in trusted agricultural sources and should avoid unsafe autonomous chemical prescriptions.

**Priority: P1**

---

## 3. AI Crop Quality Grading

Use crop images to assist with:

- Quality grading
- Defect identification
- Buyer confidence
- More consistent pricing

**Priority: P1**

---

## 4. Mandi Price Intelligence

Combine market data and historical information to help answer:

- What is today's market price?
- How does this compare with nearby markets?
- Should the farmer consider selling now?
- Where is demand stronger?

**Priority: P1**

---

## 5. Crop Residue / Biomass Matching

Connect farmers with potential buyers of:

- Paddy straw
- Wheat residue
- Biomass
- Agricultural waste

Potential buyers include:

- Bio-CNG plants
- Paper manufacturers
- Pellet manufacturers
- Other industrial users

**Priority: P2**

---

# High-Moat Ideas

These are potential long-term differentiators.

## 1.Kisan Sathi Voice-to-Listing

Audio-first agricultural marketplace interaction.

## 2.FPO Collective Buying

Aggregate demand from multiple farmers to negotiate better input prices.

```text
Farmer A ─┐
Farmer B ─┤
Farmer C ─┼──> Group Demand ──> Supplier
Farmer D ─┤
Farmer E ─┘
```

## 3.Smart Mandi Escrow

Buyer deposits funds before fulfillment.

Potential settlement flow:

```text
Buyer Payment
      ↓
Escrow
      ↓
Farm-Gate QC / Weight Verification
      ↓
Partial Farmer Settlement
      ↓
Delivery
      ↓
Final Settlement
```

## 4.Agricultural Waste Marketplace

Turn crop residue into a potential revenue source.

## 5.Kisan Mitra Field Network

Local field agents can bridge the digital literacy gap.

---

# Recommended Production Architecture

The target production architecture is:

```text
                 MOBILE-FIRST CLIENT
          React + TypeScript + PWA
                       │
                       ▼
               NODE.JS / EXPRESS
                  REST API
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       PostgreSQL    Redis       Cloudinary
       + PostGIS     Cache          CDN
          │
          ├── Users
          ├── Farmers
          ├── Farms
          ├── Listings
          ├── Orders
          ├── Payments
          ├── Reviews
          ├── Machinery
          └── Audit Logs

          External Integrations
          ├── Payment Gateway
          ├── Mandi Data
          ├── Weather
          ├── AI
          ├── WhatsApp
          └── Logistics
```

### Target capabilities

- Server-side authentication
- Phone OTP
- Secure sessions
- RBAC
- PostgreSQL
- PostGIS
- Redis caching
- Cloudinary
- Secure payments
- Live market prices
- AI services
- Notifications
- PWA/offline support
- Multilingual interface

---

# Development Roadmap

## Phase 0 — Security & Foundation

### Build first

- Backend server
- Secure authentication
- Server-side authorization
- Password hashing
- Server-side pricing
- Server-side stock validation
- Protected media upload

**Goal:** Turn the prototype into a secure application foundation.

---

## Phase 1 — Full-Stack Marketplace

Build:

- PostgreSQL
- Database schema
- User profiles
- Farmer profiles
- Produce listings
- Orders
- Reviews
- API layer
- Admin management
- Persistent marketplace state

**Goal:** Multiple real users can use the same platform.

---

## Phase 2 — Trust, Payments & Market Data

Build:

- UPI/payment integration
- Escrow workflow
- Live Mandi prices
- Buyer/farmer verification
- Quality/dispute workflow
- Hindi + regional localization

**Goal:** Make transactions trustworthy and commercially usable.

---

## Phase 3 — AI Intelligence

Build:

- Kisan Sathi
- Voice-to-listing
- AI crop advisory
- Disease detection
- Crop grading
- Price intelligence

**Goal:** Make Krishi Mart intelligent and farmer-friendly.

---

## Phase 4 — Ecosystem Expansion

Build:

- FPO collective buying
- Agricultural waste marketplace
- Logistics aggregation
- Machinery booking infrastructure
- IoT integrations
- Advanced analytics

**Goal:** Expand from marketplace to agricultural ecosystem.

---

# What We Are Deliberately Not Building Yet

Krishi Mart should avoid unnecessary complexity during the early stage.

### Not a priority right now

- Blockchain / crypto tokens
- Premature microservices
- Complex desktop-first farmer dashboards
- Fully autonomous drone systems
- Generic unrestricted AI chatbots
- Over-engineered infrastructure before marketplace traction

The focus should remain:

> **Real farmer problems → simple experience → trust → transactions → scale.**

---

# Current Priorities

The most important transition is:

```text
KRISHI MART 1.0

React Prototype
      ↓
Browser Storage
      ↓
Simulated Marketplace

              ↓↓↓

KRISHI MART 2.0

Secure Backend
      ↓
Persistent Database
      ↓
Real Marketplace
      ↓
Payments + Trust
      ↓
AI + Vernacular Voice
      ↓
Logistics + Agriculture Ecosystem
```

---

# Our Core Product Philosophy

Krishi Mart should not become an application with hundreds of disconnected features.

Every major feature should answer at least one question:

### For farmers

- Can I sell my crop better?
- Can I find a buyer?
- Can I get fairer pricing?
- Can I buy inputs cheaper?
- Can I rent equipment easily?
- Can I understand what is happening with my crop?
- Can I access information in my language?
- Can I trust the buyer?
- Can I receive my money safely?

### For buyers

- Can I find genuine farmers?
- Can I get reliable quantity?
- Can I verify quality?
- Can I get transparent pricing?
- Can I trust the transaction?
- Can I arrange fulfillment?

---

# Long-Term Vision

Our strongest potential competitive advantage is the combination of:

**Vernacular Voice AI + Marketplace + Trust/Verification + Secure Payments + Infield Agricultural Services**

Instead of building only a marketplace, Krishi Mart aims to become:

> **A digital operating platform for Indian farmers — helping them grow, sell, buy, and make better agricultural decisions.**

---

## Project Status

| Area | Current Status |
|---|---|
| React Frontend | [Complete] Built |
| Farmer Dashboard | [Complete] Built |
| Consumer Marketplace | [Complete] Built |
| Bulk Marketplace | [Prototype] Prototype |
| Infield Store | [Complete] Built |
| Machinery Rental | [Mock/Static] Prototype |
| Admin Control Tower | [Complete] Built |
| Cloudinary Media | [Complete] Integrated |
| Mandi Prices | [Mock/Static] Static |
| Government Schemes | [Mock/Static] Static |
| Authentication | [Prototype] Prototype |
| Backend | [Critical / Not Implemented] Not implemented |
| Production Database | [Critical / Not Implemented] Not implemented |
| Payments | [Critical / Not Implemented] Not implemented |
| Real AI | [Critical / Not Implemented] Not implemented |
| Voice Assistant | [Critical / Not Implemented] Not implemented |
| Logistics | [Critical / Not Implemented] Not implemented |
| Production RBAC | [Critical / Not Implemented] Not implemented |

---

## Krishi Mart

**From farm to market. From information to action.**

**Current goal:** Build a secure, real, farmer-first foundation before expanding into advanced AI and agricultural infrastructure.
