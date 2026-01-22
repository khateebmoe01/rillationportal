# Rillation Portal Data Model

> **Last Updated:** January 2026  
> **Database:** Supabase (PostgreSQL)  
> **Schema:** `public`

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Domain Areas](#core-domain-areas)
4. [Table Definitions](#table-definitions)
   - [Client Management](#client-management)
   - [Campaign Management](#campaign-management)
   - [Lead & Contact Management](#lead--contact-management)
   - [CRM System](#crm-system)
   - [Email Infrastructure](#email-infrastructure)
   - [Domain Management](#domain-management)
   - [Reporting & Analytics](#reporting--analytics)
   - [Knowledge Base & Copywriting](#knowledge-base--copywriting)
   - [Forecasting & Targets](#forecasting--targets)
   - [Integrations](#integrations)
5. [Database Functions](#database-functions)
6. [Triggers & Automations](#triggers--automations)
7. [JSONB Field Schemas](#jsonb-field-schemas)
8. [Enum Values & Constraints](#enum-values--constraints)

---

## Overview

The Rillation Portal database is designed to support a B2B sales engagement platform with the following core capabilities:

- **Multi-tenant client management** - Each client has isolated data
- **Campaign orchestration** - Email campaigns with sequence tracking
- **Lead lifecycle management** - From cold outreach to closed deals
- **CRM functionality** - Contacts, deals, tasks, and notes
- **Email infrastructure management** - Inboxes, domains, and deliverability
- **Analytics & reporting** - Daily metrics, funnel tracking, and forecasting

### Row Counts (Approximate)

| Table | Rows | Description |
|-------|------|-------------|
| `master_companies_db` | 1.28M | Master company database |
| `client_company_state` | 1.04M | Client-company relationships |
| `master_contacts_db` | 179K | Master contact database |
| `all_leads` | 125K | All campaign leads |
| `eligible_storeleads_10k` | 123K | E-commerce leads dataset |
| `replies` | 7.9K | Email replies |
| `campaign_reporting` | 4.4K | Daily campaign metrics |
| `inboxes` | 3.6K | Email inboxes |
| `engaged_leads` | 634 | Engaged/interested leads |
| `crm_contacts` | 561 | CRM contacts |
| `meetings_booked` | 217 | Booked meetings |
| `Campaigns` | 128 | Active campaigns |

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT MANAGEMENT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐       ┌──────────────────┐       ┌───────────────────┐     │
│  │   Clients   │──────▶│  client_targets  │       │  RR_clients_IDs   │     │
│  └─────────────┘       └──────────────────┘       └───────────────────┘     │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        ALL CLIENT DATA                               │    │
│  │   (Campaigns, Leads, CRM, Inboxes, Domains, Reports, etc.)          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              LEAD LIFECYCLE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐                                                       │
│  │ master_contacts  │◀────────────────────┐                                 │
│  │     _db          │                      │                                 │
│  └──────────────────┘                      │                                 │
│         │                                  │                                 │
│         ▼                                  │                                 │
│  ┌──────────────────┐      ┌───────────┐  │  ┌──────────────┐               │
│  │    all_leads     │─────▶│  replies  │──┴─▶│ engaged_leads │              │
│  └──────────────────┘      └───────────┘     └──────────────┘               │
│         │                                            │                       │
│         │                                            ▼                       │
│         │                                    ┌───────────────┐               │
│         └───────────────────────────────────▶│meetings_booked│              │
│                                              └───────────────┘               │
│                                                      │                       │
│                                                      ▼ (sync trigger)        │
│                                              ┌───────────────┐               │
│                                              │  crm_contacts │               │
│                                              └───────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                CRM SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐        ┌────────────┐        ┌───────────────────────┐   │
│  │  crm_contacts │───────▶│  crm_deals │───────▶│ crm_deal_stage_history│   │
│  └───────────────┘        └────────────┘        └───────────────────────┘   │
│         │                       │                                            │
│         ├───────────────────────┼───────────────────────┐                   │
│         ▼                       ▼                       ▼                   │
│  ┌────────────┐          ┌────────────┐          ┌────────────┐            │
│  │  crm_notes │          │  crm_tasks │          │  crm_tags  │            │
│  └────────────┘          └────────────┘          └────────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           EMAIL INFRASTRUCTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌────────────────┐     ┌───────────────────────┐      │
│  │ inbox_sets   │────▶│    inboxes     │────▶│ inbox_tag_assignments │      │
│  └──────────────┘     └────────────────┘     └───────────────────────┘      │
│                              │                          │                    │
│                              │                          ▼                    │
│                              │               ┌───────────────┐               │
│                              │               │  inbox_tags   │               │
│                              │               └───────────────┘               │
│                              ▼                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐       │
│  │ inbox_providers  │  │  inbox_orders    │  │ inbox_health_checks  │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOMAIN MANAGEMENT                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐     ┌──────────────────┐                          │
│  │domain_gen_templates  │────▶│domain_generations│                          │
│  └──────────────────────┘     └──────────────────┘                          │
│                                       │                                      │
│                                       ▼                                      │
│  ┌──────────────────────┐     ┌──────────────────┐     ┌─────────────────┐  │
│  │ domain_availability  │────▶│ domain_inventory │────▶│purchase_batches │  │
│  │     _checks          │     └──────────────────┘     └─────────────────┘  │
│  └──────────────────────┘            │                                      │
│                                      ▼                                      │
│                              ┌──────────────────┐                           │
│                              │  provider_orders │                           │
│                              └──────────────────┘                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          COMPANY DATABASE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐        ┌─────────────────────┐                      │
│  │ master_companies_db│◀──────▶│ client_company_state│                      │
│  └────────────────────┘        └─────────────────────┘                      │
│         │                                                                    │
│         │ (FK references from other schemas)                                │
│         ▼                                                                    │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  Master.campaign_contact_db, Master.campaign_leads_db,         │         │
│  │  Signals.company_signals                                        │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Domain Areas

### 1. Client Management
Tables that define and configure client accounts.

### 2. Campaign Management
Tables for email campaign configuration and tracking.

### 3. Lead & Contact Management
Tables tracking leads through the sales funnel.

### 4. CRM System
Full CRM functionality with contacts, deals, tasks, and notes.

### 5. Email Infrastructure
Inbox management, warmup, and deliverability tracking.

### 6. Domain Management
Domain purchasing, configuration, and health monitoring.

### 7. Reporting & Analytics
Daily metrics, campaign performance, and forecasting.

### 8. Knowledge Base & Copywriting
Client-specific knowledge and email copy management.

---

## Table Definitions

---

## Client Management

### `Clients`

Primary client configuration table with Bison API integration settings.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `Business` | `text` | ❌ | - | **PK** - Client business name |
| `Api Key - Bison` | `text` | ✅ | - | Bison platform API key |
| `Client ID - Bison` | `text` | ✅ | - | Bison platform client ID |
| `App URL- Bison` | `text` | ✅ | - | Bison platform URL |
| `Website` | `text` | ✅ | - | Client website URL |

**RLS:** Disabled

---

### `RR_clients_IDs`

Internal client ID mapping table.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `client_id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Unique client UUID |
| `client_name` | `text` | ❌ | - | Human-readable client name |

**RLS:** Disabled

---

### `client_targets`

Daily performance targets for Quick View dashboard.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `bigint` | ❌ | `nextval(...)` | **PK** - Auto-increment ID |
| `client` | `text` | ❌ | - | **UQ** - Client name |
| `emails_per_day` | `numeric` | ✅ | `0` | Daily email send target |
| `prospects_per_day` | `numeric` | ✅ | `0` | Daily new prospects target |
| `replies_per_day` | `numeric` | ✅ | `0` | Daily replies target |
| `bounces_per_day` | `numeric` | ✅ | `0` | Maximum bounce threshold |
| `meetings_per_day` | `numeric` | ✅ | `0` | Daily meetings target |
| `interested_replies_per day` | `numeric` | ✅ | - | Daily interested replies target |
| `monthly_contract_value` | `numeric` | ✅ | `0` | Client MCV for revenue tracking |
| `created_at` | `timestamptz` | ✅ | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | ✅ | `now()` | Last update timestamp |

**RLS:** Disabled

---

## Campaign Management

### `Campaigns`

Campaign registry with status tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `uuid` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Unique campaign UUID |
| `campaign_name` | `text` | ❌ | - | Campaign display name |
| `campaign_id` | `text` | ✅ | - | External campaign ID (Bison) |
| `client` | `text` | ✅ | - | Client name (FK reference) |
| `status` | `text` | ✅ | - | Campaign status |
| `created_at` | `timestamptz` | ❌ | `now()` | Campaign creation date |

**RLS:** Disabled

---

### `campaign_reporting`

Daily campaign performance metrics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Unique record ID |
| `campaign_id` | `integer` | ✅ | - | Campaign ID reference |
| `campaign_name` | `text` | ✅ | - | Campaign name |
| `client` | `text` | ✅ | - | Client name |
| `date` | `date` | ✅ | - | Reporting date |
| `emails_sent` | `numeric` | ✅ | - | Emails sent on date |
| `total_leads_contacted` | `numeric` | ✅ | - | Unique leads contacted |
| `opened` | `numeric` | ✅ | - | Open count |
| `opened_percentage` | `numeric` | ✅ | - | Open rate percentage |
| `unique_opens_per_contact` | `numeric` | ✅ | - | Unique opens |
| `unique_opens_per_contact_percentage` | `numeric` | ✅ | - | Unique open rate |
| `unique_replies_per_contact` | `numeric` | ✅ | - | Unique replies |
| `unique_replies_per_contact_percentage` | `numeric` | ✅ | - | Reply rate |
| `bounced` | `numeric` | ✅ | - | Bounce count |
| `bounced_percentage` | `numeric` | ✅ | - | Bounce rate |
| `unsubscribed` | `numeric` | ✅ | - | Unsubscribe count |
| `unsubscribed_percentage` | `numeric` | ✅ | - | Unsubscribe rate |
| `interested` | `numeric` | ✅ | - | Interested reply count |
| `interested_percentage` | `numeric` | ✅ | - | Interested rate |
| `sequence_step_stats` | `jsonb` | ✅ | `'[]'::jsonb` | Per-step statistics (see [JSONB Schemas](#sequence_step_stats)) |
| `created_at` | `timestamptz` | ✅ | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | ✅ | `now()` | Last update timestamp |

**RLS:** Disabled

---

## Lead & Contact Management

### `all_leads`

Master table of all leads contacted across campaigns.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Unique lead ID |
| `email` | `text` | ❌ | - | Lead email address |
| `campaign_id` | `text` | ❌ | - | Associated campaign ID |
| `client` | `text` | ❌ | - | Client name |
| `first_name` | `text` | ✅ | - | Lead first name |
| `last_name` | `text` | ✅ | - | Lead last name |
| `full_name` | `text` | ✅ | - | Full name |
| `campaign_name` | `text` | ✅ | - | Campaign name |
| `created_time` | `timestamptz` | ✅ | `now()` | When lead was added |
| `job_title` | `text` | ✅ | - | Job title |
| `seniority_level` | `text` | ✅ | - | Seniority (C-Level, VP, etc.) |
| `company` | `text` | ✅ | - | Company name |
| `company_domain` | `text` | ✅ | - | Company website domain |
| `company_linkedin` | `text` | ✅ | - | Company LinkedIn URL |
| `industry` | `text` | ✅ | - | Industry classification |
| `company_size` | `text` | ✅ | - | Employee count range |
| `annual_revenue` | `text` | ✅ | - | Revenue range |
| `year_founded` | `integer` | ✅ | - | Company founding year |
| `company_hq_city` | `text` | ✅ | - | HQ city |
| `company_hq_state` | `text` | ✅ | - | HQ state/province |
| `company_hq_country` | `text` | ✅ | - | HQ country |
| `business_model` | `text` | ✅ | - | B2B, B2C, etc. |
| `funding_stage` | `text` | ✅ | - | Funding stage |
| `tech_stack` | `text` | ✅ | - | Technologies used |
| `is_hiring` | `boolean` | ✅ | - | Currently hiring |
| `growth_score` | `text` | ✅ | - | Growth indicator |
| `profile_url` | `text` | ✅ | - | LinkedIn profile URL |
| `lead_id` | `numeric` | ✅ | - | External lead ID |
| `status` | `text` | ✅ | - | Lead status |
| `emails_sent` | `integer` | ✅ | `0` | Emails sent to lead |
| `replies` | `integer` | ✅ | `0` | Total replies |
| `unique_replies` | `integer` | ✅ | `0` | Unique replies |
| `replied` | `boolean` | ✅ | - | Has replied flag |
| `engaged` | `boolean` | ✅ | - | Is engaged flag |
| `meeting_booked` | `boolean` | ✅ | - | Meeting booked flag |
| `first_reply_date` | `timestamptz` | ✅ | - | First reply timestamp |
| `engaged_date` | `timestamptz` | ✅ | - | Engagement date |
| `booked_date` | `timestamptz` | ✅ | - | Meeting booked date |
| `specialty_signal_a` | `text` | ✅ | - | Custom signal field A |
| `specialty_signal_b` | `text` | ✅ | - | Custom signal field B |
| `specialty_signal_c` | `text` | ✅ | - | Custom signal field C |
| `specialty_signal_d` | `text` | ✅ | - | Custom signal field D |
| `custom_variables_jsonb` | `jsonb` | ✅ | `'{}'::jsonb` | Custom variables storage |

**RLS:** Disabled

---

### `replies`

Email replies received from leads.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `reply_id` | `bigint` | ❌ | - | **PK** - Unique reply ID |
| `type` | `text` | ✅ | - | Reply type |
| `lead_id` | `bigint` | ✅ | - | Associated lead ID |
| `subject` | `text` | ✅ | - | Email subject line |
| `category` | `text` | ✅ | - | Reply category (see [Enum Values](#reply-categories)) |
| `text_body` | `text` | ✅ | - | Reply content |
| `campaign_id` | `integer` | ✅ | - | Campaign ID |
| `date_received` | `date` | ✅ | - | Reply date |
| `from_email` | `text` | ✅ | - | Sender email |
| `primary_to_email` | `text` | ✅ | - | Recipient email (our inbox) |
| `client` | `text` | ✅ | - | Client name |
| `sequence_step_order` | `integer` | ✅ | - | Which step triggered reply |
| `sequence_step_id` | `integer` | ✅ | - | Step ID |
| `sequence_step_variant` | `text` | ✅ | - | A/B variant identifier |
| `created_at` | `timestamptz` | ✅ | `now()` | Record creation |
| `updated_at` | `timestamptz` | ✅ | `now()` | Last update |

**RLS:** Disabled

---

### `engaged_leads`

Leads showing positive engagement, candidates for pipeline.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Unique lead ID |
| `email` | `text` | ❌ | - | Lead email (required) |
| `client` | `text` | ✅ | - | Client name |
| **Personal Info** |
| `first_name` | `text` | ✅ | - | First name |
| `last_name` | `text` | ✅ | - | Last name |
| `full_name` | `text` | ✅ | - | Full name |
| `job_title` | `text` | ✅ | - | Job title |
| `seniority_level` | `text` | ✅ | - | Seniority level |
| `linkedin_url` | `text` | ✅ | - | LinkedIn profile |
| `lead_phone` | `text` | ✅ | - | Phone number |
| **Company Info** |
| `company` | `text` | ✅ | - | Company name |
| `company_domain` | `text` | ✅ | - | Company domain |
| `company_linkedin` | `text` | ✅ | - | Company LinkedIn |
| `company_phone` | `text` | ✅ | - | Company phone |
| `company_website` | `text` | ✅ | - | Company website |
| `company_size` | `text` | ✅ | - | Employee count |
| `industry` | `text` | ✅ | - | Industry |
| `annual_revenue` | `text` | ✅ | - | Revenue range |
| `company_hq_city` | `text` | ✅ | - | HQ city |
| `company_hq_state` | `text` | ✅ | - | HQ state |
| `company_hq_country` | `text` | ✅ | - | HQ country |
| `year_founded` | `integer` | ✅ | - | Year founded |
| `business_model` | `text` | ✅ | - | Business model |
| `funding_stage` | `text` | ✅ | - | Funding stage |
| `tech_stack` | `text[]` | ✅ | - | Tech stack array |
| `is_hiring` | `boolean` | ✅ | `false` | Hiring flag |
| `growth_score` | `integer` | ✅ | - | Growth score |
| `num_locations` | `integer` | ✅ | - | Number of locations |
| `main_product_service` | `text` | ✅ | - | Main offering |
| **Pipeline Stage Flags** |
| `meeting_booked` | `boolean` | ✅ | `false` | Meeting booked |
| `qualified` | `boolean` | ✅ | `false` | Qualified lead |
| `showed_up_to_disco` | `boolean` | ✅ | `false` | Attended discovery |
| `demo_booked` | `boolean` | ✅ | `false` | Demo scheduled |
| `showed_up_to_demo` | `boolean` | ✅ | `false` | Attended demo |
| `proposal_sent` | `boolean` | ✅ | `false` | Proposal sent |
| `closed` | `boolean` | ✅ | `false` | Deal closed |
| **Pipeline Timestamps** |
| `meeting_booked_at` | `timestamptz` | ✅ | - | Meeting booked date |
| `qualified_at` | `timestamptz` | ✅ | - | Qualification date |
| `showed_up_to_disco_at` | `timestamptz` | ✅ | - | Discovery date |
| `demo_booked_at` | `timestamptz` | ✅ | - | Demo booked date |
| `showed_up_to_demo_at` | `timestamptz` | ✅ | - | Demo attendance date |
| `proposal_sent_at` | `timestamptz` | ✅ | - | Proposal sent date |
| `closed_at` | `timestamptz` | ✅ | - | Close date |
| **Opportunity Management** |
| `stage` | `text` | ✅ | `'new'` | Current pipeline stage |
| `current_stage` | `text` | ✅ | - | Legacy stage field |
| `epv` | `numeric` | ✅ | - | Expected pipeline value |
| `context` | `text` | ✅ | - | Deal context/notes |
| `next_touchpoint` | `date` | ✅ | - | Next follow-up date |
| `last_contact` | `timestamptz` | ✅ | - | Last contact date |
| `assignee` | `text` | ✅ | - | Assigned rep |
| `notes` | `text` | ✅ | - | Additional notes |
| `lead_source` | `text` | ✅ | - | Lead source |
| **Meeting Info** |
| `meeting_date` | `timestamptz` | ✅ | - | Scheduled meeting date |
| `meeting_link` | `text` | ✅ | - | Meeting URL |
| `rescheduling_link` | `text` | ✅ | - | Reschedule URL |
| **Campaign Info** |
| `campaign_name` | `text` | ✅ | - | Origin campaign |
| `campaign_id` | `text` | ✅ | - | Campaign ID |
| **Metadata** |
| `date_created` | `date` | ✅ | - | Lead creation date |
| `custom_variables_jsonb` | `jsonb` | ✅ | `'{}'::jsonb` | Custom variables |
| `created_at` | `timestamptz` | ✅ | `now()` | Record created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Last updated |
| `deleted_at` | `timestamptz` | ✅ | - | Soft delete timestamp |

**Note:** Inserts/updates trigger `sync_engaged_lead_to_crm()` to sync to `crm_contacts`.

**RLS:** Disabled

---

### `meetings_booked`

Confirmed meeting bookings from campaigns.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `email` | `text` | ❌ | - | **PK** - Lead email |
| `first_name` | `text` | ✅ | - | First name |
| `last_name` | `text` | ✅ | - | Last name |
| `full_name` | `text` | ✅ | - | Full name |
| `title` | `text` | ✅ | - | Job title |
| `company` | `text` | ✅ | - | Company name |
| `company_linkedin` | `text` | ✅ | - | Company LinkedIn |
| `company_domain` | `text` | ✅ | - | Company domain |
| `profile_url` | `text` | ✅ | - | LinkedIn profile |
| `campaign_name` | `text` | ✅ | - | Origin campaign |
| `campaign_id` | `text` | ✅ | - | Campaign ID |
| `client` | `text` | ✅ | - | Client name |
| `created_time` | `timestamptz` | ✅ | - | Booking timestamp |
| `company_size` | `text` | ✅ | - | Company size |
| `annual_revenue` | `text` | ✅ | - | Annual revenue |
| `industry` | `text` | ✅ | - | Industry |
| `company_hq_city` | `text` | ✅ | - | HQ city |
| `company_hq_state` | `text` | ✅ | - | HQ state |
| `company_hq_country` | `text` | ✅ | - | HQ country |
| `year_founded` | `integer` | ✅ | - | Year founded |
| `business_model` | `text` | ✅ | - | Business model |
| `funding_stage` | `text` | ✅ | - | Funding stage |
| `tech_stack` | `text` | ✅ | - | Tech stack |
| `is_hiring` | `boolean` | ✅ | - | Hiring flag |
| `growth_score` | `text` | ✅ | - | Growth score |
| `custom_variables_jsonb` | `jsonb` | ✅ | `'{}'::jsonb` | Custom variables from Bison |

**RLS:** Disabled

---

### `master_contacts_db`

Master database of all contacts across all clients.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Contact UUID |
| `email` | `text` | ✅ | - | Email address |
| `first_name` | `text` | ✅ | - | First name |
| `last_name` | `text` | ✅ | - | Last name |
| `full_name` | `text` | ✅ | - | Full name |
| `company_name` | `text` | ✅ | - | Company name |
| `company_domain` | `text` | ✅ | - | Company domain |
| `company_linkedin` | `text` | ✅ | - | Company LinkedIn |
| `job_title` | `text` | ✅ | - | Job title |
| `personal_linkedin` | `text` | ✅ | - | Personal LinkedIn URL |
| `personal_linkedIn_connections` | `bigint` | ✅ | - | LinkedIn connection count |
| `personal_location` | `text` | ✅ | - | Personal location |
| `phone_number` | `text` | ✅ | - | Phone number |
| `email_service_provider` | `text` | ✅ | - | Email provider (Gmail, Outlook) |
| `fallback?` | `text` | ✅ | - | Fallback email flag |
| `normalized_first_name` | `text` | ✅ | - | Normalized first name |
| `contact_status` | `text` | ✅ | `'unassigned'` | Contact status |
| `sent_to_bison_on` | `timestamp` | ✅ | - | Sent to Bison date |
| `last_enriched` | `timestamptz` | ✅ | - | Last enrichment date |
| `last_campaign_id` | `text` | ✅ | - | Last campaign ID |
| `last_client` | `text` | ✅ | - | Last client used by |
| `companyenrich_raw_data` | `jsonb` | ✅ | `'{}'::jsonb` | Raw enrichment data |
| `created_at_supabase` | `timestamptz` | ✅ | `now()` | Record creation |

**Foreign Key References:**
- `Master.campaign_contact_db.contact_id` → `id`
- `Master.bison_queue.contact_id` → `id`
- `Master.campaign_leads_db.contact_id` → `id`

**RLS:** Disabled

---

### `master_companies_db`

Master database of all companies with firmographic data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Company UUID |
| `#id` | `bigint` | ❌ | `identity` | **UQ** - Auto-increment ID |
| `company_name` | `text` | ✅ | - | Company name |
| `company_domain` | `text` | ✅ | - | **UQ** - Domain (no www prefix) |
| `company_description` | `text` | ✅ | - | Company description |
| `company_linkedin` | `text` | ✅ | - | LinkedIn company URL |
| `company_linkedIn_followers` | `text` | ✅ | - | Follower count |
| `company_location` | `text` | ✅ | - | HQ location |
| `company_size` | `text` | ✅ | - | Employee count range |
| `company_annual_revenue` | `text` | ✅ | - | Revenue range |
| `company_year_founded` | `text` | ✅ | - | Year founded |
| `company_business_model` | `text` | ✅ | - | B2B/B2C/etc. |
| `company_type` | `text` | ✅ | - | Company type |
| `naics_code` | `text` | ✅ | - | NAICS code |
| `naics_name` | `text` | ✅ | - | NAICS industry name |
| `primary_industry_1` | `text` | ✅ | - | Primary industry |
| `revenue_stream_1` | `text` | ✅ | - | Revenue stream 1 |
| `revenue_stream_2` | `text` | ✅ | - | Revenue stream 2 |
| `offer_1` through `offer_5` | `text` | ✅ | - | Product/service offerings |
| `scale_scope` | `text` | ✅ | - | Scale/scope indicator |
| `total_funding` | `text` | ✅ | - | Total funding raised |
| `companyenrich_raw_data` | `jsonb` | ✅ | `'{}'::jsonb` | Raw CompanyEnrich API data |
| `last_enriched` | `timestamptz` | ✅ | - | Last enrichment |
| `last_campaign_id` | `text` | ✅ | - | Last campaign |
| `last_client` | `text` | ✅ | - | Last client |
| `created_at_supabase` | `timestamptz` | ✅ | `now()` | Record creation |

**Constraints:**
- `company_domain !~* '^www\.'` - Domain must not start with www

**Foreign Key References:**
- `client_company_state.company_id` → `id`
- `Signals.company_signals.company_id` → `id`
- `Master.campaign_contact_db.company_id` → `id`
- `Master.campaign_leads_db.company_id` → `id`

**RLS:** Disabled

---

### `client_company_state`

Tracks company status per client for exclusion/inclusion logic.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Record ID |
| `client_id` | `uuid` | ❌ | - | Client UUID |
| `company_id` | `uuid` | ❌ | - | **FK** → `master_companies_db.id` |
| `status` | `text` | ✅ | `'new'` | Company status for client |
| `qualification_status` | `text` | ✅ | - | Qualification status |
| `first_seen_at` | `timestamptz` | ✅ | `now()` | First seen date |
| `last_seen_at` | `timestamptz` | ✅ | - | Last seen date |
| `blocked_until` | `timestamptz` | ✅ | - | Blocking expiry date |

**RLS:** Disabled

---

## CRM System

### `crm_contacts`

CRM contact records with full lifecycle tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Contact UUID |
| `client` | `text` | ❌ | - | Client name |
| **Personal Info** |
| `first_name` | `text` | ✅ | - | First name |
| `last_name` | `text` | ✅ | - | Last name |
| `full_name` | `text` | ✅ | GENERATED | Auto-generated full name |
| `email` | `text` | ✅ | - | Email address |
| `phone` | `text` | ✅ | - | Phone number |
| `lead_phone` | `text` | ✅ | - | Alternative phone |
| `avatar_url` | `text` | ✅ | - | Avatar image URL |
| `title` | `text` | ✅ | - | Job title |
| `job_title` | `text` | ✅ | - | Job title (duplicate) |
| `seniority_level` | `text` | ✅ | - | Seniority level |
| `department` | `text` | ✅ | - | Department |
| `linkedin_url` | `text` | ✅ | - | LinkedIn URL |
| `profile_url` | `text` | ✅ | - | Profile URL |
| **Company Info** |
| `company_name` | `text` | ✅ | - | Company name |
| `company_domain` | `text` | ✅ | - | Company domain |
| `company_linkedin` | `text` | ✅ | - | Company LinkedIn |
| `company_phone` | `text` | ✅ | - | Company phone |
| `company_website` | `text` | ✅ | - | Company website |
| `company_size` | `text` | ✅ | - | Employee count |
| `company_industry` | `text` | ✅ | - | Industry |
| `annual_revenue` | `text` | ✅ | - | Revenue range |
| `company_hq_city` | `text` | ✅ | - | HQ city |
| `company_hq_state` | `text` | ✅ | - | HQ state |
| `company_hq_country` | `text` | ✅ | - | HQ country |
| `year_founded` | `integer` | ✅ | - | Year founded |
| `business_model` | `text` | ✅ | - | Business model |
| `funding_stage` | `text` | ✅ | - | Funding stage |
| `tech_stack` | `text[]` | ✅ | - | Tech stack array |
| `is_hiring` | `boolean` | ✅ | `false` | Hiring flag |
| `growth_score` | `text` | ✅ | - | Growth score |
| `num_locations` | `integer` | ✅ | - | Location count |
| `company_logo_url` | `text` | ✅ | - | Company logo |
| `company_address` | `text` | ✅ | - | Company address |
| `company_postal_code` | `text` | ✅ | - | Postal code |
| `company_sector` | `text` | ✅ | - | Sector |
| **Status & Pipeline** |
| `status` | `text` | ✅ | `'cold'` | Contact status (see [Enum Values](#contact-status)) |
| `stage` | `text` | ✅ | `'new'` | Pipeline stage |
| `epv` | `numeric` | ✅ | - | Expected pipeline value |
| `context` | `text` | ✅ | - | Deal context |
| `next_touch` | `timestamptz` | ✅ | - | Next touch date |
| `assignee` | `text` | ✅ | - | Assigned rep |
| `notes` | `text` | ✅ | - | Notes |
| `last_contacted_at` | `timestamptz` | ✅ | - | Last contact date |
| `background` | `text` | ✅ | - | Background info |
| **Meeting Info** |
| `meeting_date` | `timestamptz` | ✅ | - | Meeting date |
| `meeting_link` | `text` | ✅ | - | Meeting URL |
| `rescheduling_link` | `text` | ✅ | - | Reschedule URL |
| **Source Info** |
| `lead_source` | `text` | ✅ | - | Lead source |
| `campaign_name` | `text` | ✅ | - | Origin campaign |
| `campaign_id` | `text` | ✅ | - | Campaign ID |
| **Metadata** |
| `tags` | `jsonb` | ✅ | `'[]'::jsonb` | Tags array |
| `custom_variables_jsonb` | `jsonb` | ✅ | `'{}'::jsonb` | Custom variables |
| `pipeline_progress` | `jsonb` | ✅ | - | Pipeline milestones (see [JSONB Schemas](#pipeline_progress)) |
| `created_at` | `timestamptz` | ✅ | `now()` | Created timestamp |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated timestamp |
| `created_by` | `text` | ✅ | - | Created by user |
| `deleted_at` | `timestamptz` | ✅ | - | Soft delete timestamp |

**Indexes:**
- `idx_crm_contacts_pipeline_progress` (GIN) on `pipeline_progress`

**Foreign Key References:**
- `crm_notes.contact_id` → `id`
- `crm_tasks.contact_id` → `id`
- `crm_deals.contact_id` → `id`

**RLS:** Disabled

---

### `crm_deals`

Deal/opportunity tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Deal UUID |
| `client` | `text` | ❌ | - | Client name |
| `contact_id` | `uuid` | ✅ | - | **FK** → `crm_contacts.id` |
| `name` | `text` | ❌ | - | Deal name |
| `description` | `text` | ✅ | - | Deal description |
| `stage` | `text` | ✅ | `'qualification'` | Deal stage (see [Enum Values](#deal-stages)) |
| `amount` | `numeric` | ✅ | `0` | Deal value |
| `currency` | `text` | ✅ | `'USD'` | Currency code |
| `probability` | `integer` | ✅ | `0` | Win probability (0-100) |
| `expected_close_date` | `date` | ✅ | - | Expected close date |
| `actual_close_date` | `date` | ✅ | - | Actual close date |
| `close_reason` | `text` | ✅ | - | Won/lost reason |
| `owner_id` | `text` | ✅ | - | Deal owner |
| `index` | `integer` | ✅ | `0` | Sort order |
| `tags` | `jsonb` | ✅ | `'[]'::jsonb` | Tags array |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |
| `created_by` | `text` | ✅ | - | Created by |
| `deleted_at` | `timestamptz` | ✅ | - | Soft delete |

**Constraints:**
- `probability >= 0 AND probability <= 100`

**RLS:** Disabled

---

### `crm_deal_stage_history`

Audit trail of deal stage changes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Record ID |
| `deal_id` | `uuid` | ❌ | - | **FK** → `crm_deals.id` |
| `from_stage` | `text` | ✅ | - | Previous stage |
| `to_stage` | `text` | ❌ | - | New stage |
| `changed_at` | `timestamptz` | ✅ | `now()` | Change timestamp |
| `changed_by` | `text` | ✅ | - | Changed by user |

**RLS:** Disabled

---

### `crm_notes`

Notes attached to contacts or deals.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Note ID |
| `client` | `text` | ❌ | - | Client name |
| `contact_id` | `uuid` | ✅ | - | **FK** → `crm_contacts.id` |
| `deal_id` | `uuid` | ✅ | - | **FK** → `crm_deals.id` |
| `text` | `text` | ❌ | - | Note content |
| `type` | `text` | ✅ | `'note'` | Note type (see [Enum Values](#note-types)) |
| `attachments` | `jsonb` | ✅ | `'[]'::jsonb` | Attachments array |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |
| `created_by` | `text` | ✅ | - | Created by |

**RLS:** Disabled

---

### `crm_tasks`

Tasks associated with contacts or deals.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Task ID |
| `client` | `text` | ❌ | - | Client name |
| `contact_id` | `uuid` | ✅ | - | **FK** → `crm_contacts.id` |
| `deal_id` | `uuid` | ✅ | - | **FK** → `crm_deals.id` |
| `type` | `text` | ✅ | `'task'` | Task type (see [Enum Values](#task-types)) |
| `text` | `text` | ❌ | - | Task description |
| `due_date` | `timestamptz` | ✅ | - | Due date |
| `done` | `boolean` | ✅ | `false` | Completion flag |
| `done_at` | `timestamptz` | ✅ | - | Completion timestamp |
| `assigned_to` | `text` | ✅ | - | Assignee |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |
| `created_by` | `text` | ✅ | - | Created by |

**RLS:** Disabled

---

### `crm_tags`

Tag definitions for CRM entities.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Tag ID |
| `client` | `text` | ❌ | - | Client name |
| `name` | `text` | ❌ | - | Tag name |
| `color` | `text` | ✅ | `'#6366f1'` | Tag color (hex) |
| `entity_type` | `text` | ❌ | - | Entity type (see [Enum Values](#tag-entity-types)) |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |

**RLS:** Disabled

---

## Email Infrastructure

### `inboxes`

Email inbox configuration and statistics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `bigint` | ❌ | `nextval(...)` | **PK** - Internal ID |
| `bison_inbox_id` | `integer` | ❌ | - | **UQ** - Bison inbox ID |
| `client` | `text` | ✅ | - | Client name |
| `name` | `varchar` | ❌ | - | Inbox display name |
| `email` | `varchar` | ❌ | - | Email address |
| `domain` | `text` | ✅ | - | Domain name |
| `email_signature` | `text` | ✅ | - | Email signature |
| **Server Config** |
| `imap_server` | `varchar` | ✅ | - | IMAP server |
| `imap_port` | `integer` | ✅ | - | IMAP port |
| `smtp_server` | `varchar` | ✅ | - | SMTP server |
| `smtp_port` | `integer` | ✅ | - | SMTP port |
| **Limits & Status** |
| `daily_limit` | `integer` | ✅ | `0` | Daily send limit |
| `type` | `varchar` | ✅ | `'Inbox'` | Inbox type |
| `status` | `varchar` | ✅ | `'Connected'` | Connection status |
| `lifecycle_status` | `text` | ✅ | `'active'` | Lifecycle status |
| **Statistics** |
| `emails_sent_count` | `integer` | ✅ | `0` | Total emails sent |
| `total_replied_count` | `integer` | ✅ | `0` | Total replies |
| `total_opened_count` | `integer` | ✅ | `0` | Total opens |
| `unique_replied_count` | `integer` | ✅ | `0` | Unique replies |
| `unique_opened_count` | `integer` | ✅ | `0` | Unique opens |
| `total_leads_contacted_count` | `integer` | ✅ | `0` | Leads contacted |
| `interested_leads_count` | `integer` | ✅ | `0` | Interested leads |
| `bounced_count` | `integer` | ✅ | `0` | Bounces |
| `unsubscribed_count` | `integer` | ✅ | `0` | Unsubscribes |
| **Warmup** |
| `warmup_enabled` | `boolean` | ✅ | `false` | Warmup enabled |
| `warmup_started_at` | `timestamptz` | ✅ | - | Warmup start date |
| `warmup_days` | `integer` | ✅ | `0` | Days in warmup |
| `warmup_reputation` | `numeric` | ✅ | - | Warmup reputation score |
| **Health** |
| `deliverability_score` | `numeric` | ✅ | - | Deliverability score |
| `last_health_check` | `timestamptz` | ✅ | - | Last health check |
| **Assignments** |
| `inbox_set_id` | `uuid` | ✅ | - | **FK** → `inbox_sets.id` |
| `assigned_campaign_id` | `text` | ✅ | - | Assigned campaign |
| `provider_inbox_id` | `text` | ✅ | - | Provider inbox ID |
| **Metadata** |
| `tags` | `jsonb` | ✅ | `'[]'::jsonb` | Tags array |
| `ordered_at` | `timestamptz` | ✅ | - | Order date |
| `renewal_date` | `date` | ✅ | - | Renewal date |
| `created_at` | `timestamptz` | ✅ | - | Created |
| `updated_at` | `timestamptz` | ✅ | - | Updated |
| `synced_at` | `timestamptz` | ✅ | `CURRENT_TIMESTAMP` | Last sync |

**RLS:** Disabled

---

### `inbox_sets`

Groups of inboxes ordered together.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Set ID |
| `name` | `text` | ❌ | - | Set name |
| `client` | `text` | ❌ | - | Client name |
| `provider` | `text` | ✅ | - | Provider (google/microsoft/smtp) |
| `domain` | `text` | ✅ | - | Domain name |
| `quantity` | `integer` | ❌ | `0` | Number of inboxes |
| `connected_count` | `integer` | ✅ | `0` | Connected count |
| `status` | `text` | ✅ | `'ordered'` | Set status (see [Enum Values](#inbox-set-status)) |
| `ordered_at` | `timestamptz` | ✅ | `now()` | Order date |
| `warmup_started_at` | `timestamptz` | ✅ | - | Warmup start |
| `warmup_target_days` | `integer` | ✅ | `21` | Target warmup days |
| `avg_warmup_reputation` | `numeric` | ✅ | - | Average warmup score |
| `avg_deliverability_score` | `numeric` | ✅ | - | Average deliverability |
| `notes` | `text` | ✅ | - | Notes |
| `tags` | `jsonb` | ✅ | `'[]'::jsonb` | Tags |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `inbox_tags`

Tags for organizing inboxes (synced from Bison).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Tag ID |
| `bison_tag_id` | `integer` | ❌ | - | Bison tag ID |
| `name` | `text` | ❌ | - | Tag name |
| `client` | `text` | ❌ | - | Client name |
| `inbox_count` | `integer` | ✅ | `0` | Number of inboxes |
| `is_default` | `boolean` | ✅ | `false` | Default tag flag |
| `synced_at` | `timestamptz` | ✅ | - | Last sync |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `inbox_tag_assignments`

Many-to-many relationship between inboxes and tags.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Assignment ID |
| `inbox_id` | `integer` | ❌ | - | Inbox ID |
| `tag_id` | `uuid` | ❌ | - | **FK** → `inbox_tags.id` |
| `assigned_at` | `timestamptz` | ✅ | `now()` | Assignment date |

**RLS:** Disabled

---

### `inbox_providers`

API credentials for inbox providers.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Provider ID |
| `provider_name` | `text` | ❌ | - | **UQ** - Provider name (see [Enum Values](#inbox-providers)) |
| `api_key` | `text` | ❌ | - | API key |
| `api_secret` | `text` | ✅ | - | API secret |
| `workspace_id` | `text` | ✅ | - | Workspace ID |
| `is_active` | `boolean` | ✅ | `true` | Active flag |
| `rate_limit_per_minute` | `integer` | ✅ | `60` | Rate limit |
| `last_sync_at` | `timestamptz` | ✅ | - | Last sync |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `inbox_health_checks`

Inbox health monitoring records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Check ID |
| `inbox_email` | `text` | ❌ | - | Inbox email |
| `inbox_id` | `text` | ✅ | - | Inbox ID |
| `domain` | `text` | ❌ | - | Domain |
| `client` | `text` | ❌ | - | Client |
| `sent_count` | `integer` | ✅ | `0` | Sent count |
| `reply_count` | `integer` | ✅ | `0` | Reply count |
| `reply_rate` | `numeric` | ✅ | `0` | Reply rate |
| `bounce_count` | `integer` | ✅ | `0` | Bounce count |
| `bounce_rate` | `numeric` | ✅ | `0` | Bounce rate |
| `spam_count` | `integer` | ✅ | `0` | Spam count |
| `spam_rate` | `numeric` | ✅ | `0` | Spam rate |
| `health_score` | `integer` | ✅ | `100` | Health score (0-100) |
| `recommendation` | `text` | ✅ | - | Recommendation (see [Enum Values](#health-recommendations)) |
| `checked_at` | `timestamptz` | ✅ | `now()` | Check timestamp |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |

**RLS:** Disabled

---

### `inbox_orders`

Inbox ordering/provisioning requests.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Order ID |
| `order_number` | `text` | ❌ | - | **UQ** - Order number |
| `provider` | `text` | ❌ | - | Provider (see [Enum Values](#inbox-providers)) |
| `client` | `text` | ✅ | - | Client name |
| `quantity` | `integer` | ❌ | - | Quantity (> 0) |
| `domain` | `text` | ✅ | - | Domain |
| `status` | `text` | ❌ | `'pending'` | Order status (see [Enum Values](#order-status)) |
| `provider_order_id` | `text` | ✅ | - | Provider order ID |
| `total_cost` | `numeric` | ✅ | - | Total cost |
| `inboxes_created` | `integer` | ✅ | `0` | Inboxes created |
| `order_data` | `jsonb` | ✅ | `'{}'::jsonb` | Order data |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |
| `completed_at` | `timestamptz` | ✅ | - | Completion date |

**RLS:** Disabled

---

### `inbox_analytics`

Daily inbox performance analytics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Record ID |
| `inbox_id` | `integer` | ✅ | - | Inbox ID |
| `client` | `text` | ✅ | - | Client |
| `provider` | `text` | ✅ | - | Provider |
| `date` | `date` | ❌ | - | Analytics date |
| `emails_sent` | `integer` | ✅ | `0` | Emails sent |
| `replies_received` | `integer` | ✅ | `0` | Replies received |
| `bounce_count` | `integer` | ✅ | `0` | Bounces |
| `bounce_rate` | `numeric` | ✅ | `0` | Bounce rate |
| `deliverability_score` | `numeric` | ✅ | `0` | Deliverability |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |

**RLS:** Disabled

---

## Domain Management

### `domains`

Domain registry with DNS configuration status.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Domain ID |
| `domain_name` | `text` | ❌ | - | **UQ** - Domain name |
| `provider` | `text` | ❌ | - | Provider (see [Enum Values](#domain-providers)) |
| `client` | `text` | ✅ | - | Client name |
| `status` | `text` | ❌ | `'pending'` | Domain status (see [Enum Values](#domain-status)) |
| `expiration_date` | `date` | ✅ | - | Expiration date |
| `registration_date` | `date` | ✅ | - | Registration date |
| `dns_configured` | `boolean` | ✅ | `false` | DNS configured |
| `spf_configured` | `boolean` | ✅ | `false` | SPF configured |
| `dkim_configured` | `boolean` | ✅ | `false` | DKIM configured |
| `dmarc_configured` | `boolean` | ✅ | `false` | DMARC configured |
| `health_status` | `text` | ✅ | `'unknown'` | Health status (see [Enum Values](#health-status)) |
| `porkbun_domain_id` | `text` | ✅ | - | Porkbun domain ID |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |
| `synced_at` | `timestamptz` | ✅ | - | Last sync |

**RLS:** Disabled

---

### `domain_inventory`

Active domain inventory with lifecycle tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Record ID |
| `domain_name` | `text` | ❌ | - | **UQ** - Domain name |
| `client` | `text` | ✅ | - | Client name |
| `registrar` | `text` | ✅ | - | Registrar (see [Enum Values](#registrars)) |
| `inbox_provider` | `text` | ✅ | - | Inbox provider (see [Enum Values](#inbox-providers-domain)) |
| `status` | `text` | ✅ | `'available'` | Status (see [Enum Values](#domain-inventory-status)) |
| `purchased_at` | `timestamptz` | ✅ | - | Purchase date |
| `purchase_price` | `numeric` | ✅ | - | Purchase price |
| `expires_at` | `date` | ✅ | - | Expiration date |
| `dns_configured` | `boolean` | ✅ | `false` | DNS configured |
| `assigned_to_provider_at` | `timestamptz` | ✅ | - | Provider assignment date |
| `inboxes_ordered` | `integer` | ✅ | `0` | Inboxes ordered |
| `inboxes_active` | `integer` | ✅ | `0` | Active inboxes |
| `purchase_batch_id` | `uuid` | ✅ | - | Purchase batch ID |
| `renewal_date` | `date` | ✅ | - | Renewal date |
| `activated_at` | `timestamptz` | ✅ | - | Activation date |
| `cancelled_at` | `timestamptz` | ✅ | - | Cancellation date |
| `notes` | `text` | ✅ | - | Notes |
| `tags` | `jsonb` | ✅ | `'[]'::jsonb` | Tags |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `domain_providers`

Domain registrar API credentials.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Provider ID |
| `provider_name` | `text` | ❌ | - | **UQ** - Provider name (porkbun/other) |
| `api_key` | `text` | ❌ | - | API key |
| `api_secret` | `text` | ❌ | - | API secret |
| `is_active` | `boolean` | ✅ | `true` | Active flag |
| `last_sync_at` | `timestamptz` | ✅ | - | Last sync |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `domain_availability_checks`

Domain availability check cache.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Check ID |
| `domain_name` | `text` | ❌ | - | **UQ** - Domain name |
| `is_available` | `boolean` | ✅ | - | Availability |
| `price` | `numeric` | ✅ | - | Price |
| `provider` | `text` | ✅ | `'porkbun'` | Provider |
| `checked_at` | `timestamptz` | ✅ | `now()` | Check timestamp |
| `expires_at` | `timestamptz` | ✅ | `now() + 1 hour` | Cache expiration |

**RLS:** Disabled

---

### `domain_generation_templates`

Templates for domain name generation.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Template ID |
| `name` | `text` | ❌ | - | Template name |
| `client` | `text` | ✅ | - | Client name |
| `base_names` | `jsonb` | ❌ | `'[]'::jsonb` | Base name array |
| `prefixes` | `jsonb` | ✅ | `'["try", "use", ...]'` | Prefix array |
| `suffixes` | `jsonb` | ✅ | `'["go", "max", ...]'` | Suffix array |
| `tlds` | `jsonb` | ✅ | `'[".co", ".info"]'` | TLD array |
| `use_count` | `integer` | ✅ | `0` | Usage count |
| `last_used_at` | `timestamptz` | ✅ | - | Last used |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `domain_generations`

Domain name generation runs.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Generation ID |
| `client` | `text` | ✅ | - | Client name |
| `base_name` | `text` | ❌ | - | Base name used |
| `prefixes` | `jsonb` | ✅ | `'[]'::jsonb` | Prefixes used |
| `suffixes` | `jsonb` | ✅ | `'[]'::jsonb` | Suffixes used |
| `generated_count` | `integer` | ✅ | `0` | Domains generated |
| `available_count` | `integer` | ✅ | `0` | Available domains |
| `checked_at` | `timestamptz` | ✅ | - | Check timestamp |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |

**RLS:** Disabled

---

### `purchase_batches`

Domain purchase batch tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Batch ID |
| `name` | `text` | ✅ | - | Batch name |
| `client` | `text` | ❌ | - | Client name |
| `purchased_at` | `timestamptz` | ✅ | `now()` | Purchase date |
| `domain_count` | `integer` | ✅ | `0` | Domain count |
| `total_cost` | `numeric` | ✅ | - | Total cost |
| `registrar` | `text` | ✅ | - | Registrar |
| `notes` | `text` | ✅ | - | Notes |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |

**RLS:** Disabled

---

### `provider_orders`

Orders placed with inbox/domain providers.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Order ID |
| `order_ref` | `text` | ✅ | - | **UQ** - Order reference |
| `provider` | `text` | ❌ | - | Provider (missioninbox/inboxkit) |
| `order_type` | `text` | ❌ | - | Type (domains/mailboxes/both) |
| `client` | `text` | ❌ | - | Client name |
| `quantity` | `integer` | ❌ | - | Quantity |
| `domains` | `jsonb` | ✅ | `'[]'::jsonb` | Domain list |
| `mailbox_config` | `jsonb` | ✅ | `'{}'::jsonb` | Mailbox configuration |
| `csv_data` | `text` | ✅ | - | CSV export data |
| `status` | `text` | ✅ | `'draft'` | Order status (see [Enum Values](#provider-order-status)) |
| `exported_at` | `timestamptz` | ✅ | - | Export date |
| `submitted_at` | `timestamptz` | ✅ | - | Submit date |
| `completed_at` | `timestamptz` | ✅ | - | Completion date |
| `activated_at` | `timestamptz` | ✅ | - | Activation date |
| `cancelled_at` | `timestamptz` | ✅ | - | Cancellation date |
| `renewal_date` | `date` | ✅ | - | Renewal date |
| `milestone_30d_notified` | `boolean` | ✅ | `false` | 30-day notification sent |
| `milestone_60d_notified` | `boolean` | ✅ | `false` | 60-day notification sent |
| `milestone_90d_notified` | `boolean` | ✅ | `false` | 90-day notification sent |
| `renewal_notified` | `boolean` | ✅ | `false` | Renewal notification sent |
| `notes` | `text` | ✅ | - | Notes |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `rebatch_runs`

Inbox rebatch/optimization runs.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Run ID |
| `run_date` | `date` | ❌ | `CURRENT_DATE` | Run date |
| `client` | `text` | ❌ | - | Client name |
| `daily_send_goal` | `integer` | ✅ | - | Daily send target |
| `active_domains` | `integer` | ✅ | `0` | Active domains |
| `insurance_domains` | `integer` | ✅ | `0` | Insurance domains |
| `domains_to_cancel` | `text[]` | ✅ | `'{}'` | Domains to cancel |
| `domains_to_activate` | `text[]` | ✅ | `'{}'` | Domains to activate |
| `domains_to_buy` | `integer` | ✅ | `0` | Domains to buy |
| `inboxes_analyzed` | `integer` | ✅ | `0` | Inboxes analyzed |
| `avg_reply_rate` | `numeric` | ✅ | - | Average reply rate |
| `status` | `text` | ✅ | `'preview'` | Run status (see [Enum Values](#rebatch-status)) |
| `slack_message_ts` | `text` | ✅ | - | Slack message ID |
| `executed_at` | `timestamptz` | ✅ | - | Execution date |
| `executed_by` | `text` | ✅ | - | Executed by |
| `error_message` | `text` | ✅ | - | Error message |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

## Reporting & Analytics

### `client_iteration_logs`

Activity log for client iterations and updates.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `bigint` | ❌ | `nextval(...)` | **PK** - Log ID |
| `client` | `text` | ❌ | - | Client name |
| `action_type` | `text` | ❌ | - | Action type |
| `description` | `text` | ❌ | - | Action description |
| `created_by` | `text` | ❌ | - | Created by user |
| `campaign_name` | `text` | ✅ | - | Associated campaign |
| `mentioned_users` | `jsonb` | ✅ | `'[]'::jsonb` | Mentioned users (see [JSONB Schemas](#mentioned_users)) |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |

**RLS:** Disabled

---

### `client_opportunities`

Sales opportunities per client.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `integer` | ❌ | `nextval(...)` | **PK** - Opportunity ID |
| `client` | `text` | ❌ | - | Client name |
| `opportunity_name` | `text` | ❌ | - | Opportunity name |
| `stage` | `text` | ❌ | `'Qualification'` | Pipeline stage |
| `value` | `numeric` | ❌ | `0` | Opportunity value |
| `expected_close_date` | `date` | ✅ | - | Expected close |
| `contact_name` | `text` | ✅ | - | Contact name |
| `contact_email` | `text` | ✅ | - | Contact email |
| `notes` | `text` | ✅ | - | Notes |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `funnel_forecasts`

Monthly funnel forecasting data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Forecast ID |
| `month` | `text` | ❌ | - | Month name |
| `year` | `integer` | ❌ | - | Year |
| `metric_key` | `text` | ❌ | - | Metric identifier |
| `estimate_low` | `numeric` | ✅ | `0` | Low estimate |
| `estimate_avg` | `numeric` | ✅ | `0` | Average estimate |
| `estimate_high` | `numeric` | ✅ | `0` | High estimate |
| `estimate_1` | `numeric` | ✅ | `0` | Custom estimate 1 |
| `estimate_2` | `numeric` | ✅ | `0` | Custom estimate 2 |
| `actual` | `numeric` | ✅ | `0` | Actual value |
| `projected` | `numeric` | ✅ | `0` | Projected value |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

## Knowledge Base & Copywriting

### `client_knowledge_base`

Comprehensive client knowledge for copywriting.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - KB ID |
| `client` | `text` | ❌ | - | **UQ** - Client name |
| `company` | `jsonb` | ✅ | `'{}'::jsonb` | Company info |
| `company_people` | `jsonb` | ✅ | `'[]'::jsonb` | Key people |
| `company_offer` | `jsonb` | ✅ | `'{}'::jsonb` | Offer details |
| `company_competition` | `jsonb` | ✅ | `'[]'::jsonb` | Competitors |
| `prospect_companies` | `jsonb` | ✅ | `'{}'::jsonb` | Target companies |
| `prospect_people` | `jsonb` | ✅ | `'{}'::jsonb` | Target personas |
| `copy_structures` | `jsonb` | ✅ | `'[]'::jsonb` | Email structures |
| `copy_variables` | `jsonb` | ✅ | `'{}'::jsonb` | Copy variables |
| `copy_variable_unique_data` | `jsonb` | ✅ | `'{}'::jsonb` | Unique variable data |
| `data_quality_assurance` | `jsonb` | ✅ | `'{}'::jsonb` | QA rules |
| `sending_technicalities` | `jsonb` | ✅ | `'{}'::jsonb` | Send configuration |
| `last_updated_by` | `text` | ✅ | - | Last updated by |
| `last_updated_section` | `text` | ✅ | - | Last updated section |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `client_copywriting`

Email copy structures and prompts.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Record ID |
| `client` | `text` | ❌ | - | **UQ** - Client name |
| `copy_structures` | `jsonb` | ✅ | `'[]'::jsonb` | Email sequences |
| `clay_prompts` | `jsonb` | ✅ | `'{}'::jsonb` | Clay/Claygent prompts |
| `prompt_templates` | `jsonb` | ✅ | `'[]'::jsonb` | Prompt templates |
| `source_call_ids` | `uuid[]` | ✅ | `'{}'` | Source call IDs |
| `generated_from_kb` | `boolean` | ✅ | `false` | Generated from KB flag |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `client_opportunity_maps`

TAM/opportunity mapping documents.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Map ID |
| `client` | `text` | ❌ | - | Client name |
| `title` | `text` | ❌ | - | Map title |
| `version` | `integer` | ✅ | `1` | Version number |
| `status` | `text` | ✅ | `'draft'` | Status (draft/confirmed/archived) |
| `segments` | `jsonb` | ✅ | `'[]'::jsonb` | Market segments |
| `geographies` | `jsonb` | ✅ | `'[]'::jsonb` | Target geographies |
| `company_size_bands` | `jsonb` | ✅ | `'[]'::jsonb` | Size bands |
| `revenue_bands` | `jsonb` | ✅ | `'[]'::jsonb` | Revenue bands |
| `social_proof` | `jsonb` | ✅ | `'{}'::jsonb` | Social proof |
| `campaign_architecture` | `jsonb` | ✅ | `'{}'::jsonb` | Campaign structure |
| `events_conferences` | `jsonb` | ✅ | `'[]'::jsonb` | Events/conferences |
| `next_steps` | `jsonb` | ✅ | `'[]'::jsonb` | Next steps |
| `content_json` | `jsonb` | ✅ | `'{}'::jsonb` | Full content |
| `pdf_url` | `text` | ✅ | - | PDF URL |
| `source_call_ids` | `uuid[]` | ✅ | `'{}'` | Source call IDs |
| `generated_by` | `text` | ✅ | - | Generated by |
| `ai_model` | `text` | ✅ | - | AI model used |
| `generation_prompt` | `text` | ✅ | - | Generation prompt |
| `confirmed_at` | `timestamptz` | ✅ | - | Confirmation date |
| `confirmed_by` | `text` | ✅ | - | Confirmed by |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `client_plan_of_action`

Client implementation plans.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Plan ID |
| `client` | `text` | ❌ | - | **UQ** - Client name |
| `list_building_clay` | `jsonb` | ✅ | `'{}'::jsonb` | Clay config |
| `tables_architecture` | `jsonb` | ✅ | `'[]'::jsonb` | Table architecture |
| `prompt_injections` | `jsonb` | ✅ | `'[]'::jsonb` | Prompt injections |
| `expected_quality_outputs` | `jsonb` | ✅ | `'[]'::jsonb` | Expected outputs |
| `table_structure` | `jsonb` | ✅ | `'{}'::jsonb` | Table structure |
| `connections` | `jsonb` | ✅ | `'[]'::jsonb` | Connections |
| `implementation_notes` | `text` | ✅ | - | Implementation notes |
| `campaign_plan` | `jsonb` | ✅ | `'{}'::jsonb` | Campaign plan |
| `tasks` | `jsonb` | ✅ | `'[]'::jsonb` | Tasks |
| `analysis_surface` | `jsonb` | ✅ | `'[]'::jsonb` | Analysis surface |
| `analysis_effects` | `jsonb` | ✅ | `'[]'::jsonb` | Analysis effects |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

### `client_fathom_calls`

Recorded call transcripts from Fathom.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Call ID |
| `client` | `text` | ❌ | - | Client name |
| `fathom_call_id` | `text` | ✅ | - | **UQ** - Fathom call ID |
| `title` | `text` | ❌ | - | Call title |
| `call_date` | `timestamptz` | ✅ | - | Call date |
| `duration_seconds` | `integer` | ✅ | - | Duration in seconds |
| `transcript` | `text` | ✅ | - | Full transcript |
| `summary` | `text` | ✅ | - | Call summary |
| `participants` | `jsonb` | ✅ | `'[]'::jsonb` | Participants list |
| `action_items` | `jsonb` | ✅ | `'[]'::jsonb` | Action items |
| `call_type` | `text` | ✅ | - | Call type (see [Enum Values](#call-types)) |
| `status` | `text` | ✅ | `'pending'` | Processing status (see [Enum Values](#call-status)) |
| `metadata` | `jsonb` | ✅ | `'{}'::jsonb` | Additional metadata |
| `fathom_recording_url` | `text` | ✅ | - | Recording URL |
| `fathom_raw_data` | `jsonb` | ✅ | `'{}'::jsonb` | Raw Fathom data |
| `auto_matched` | `boolean` | ✅ | `false` | Auto-matched flag |
| `match_confidence` | `float8` | ✅ | `0` | Match confidence score |
| `created_at` | `timestamptz` | ✅ | `now()` | Created |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

## Integrations

### `calendly_integrations`

Calendly OAuth tokens per client.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | ❌ | `gen_random_uuid()` | **PK** - Integration ID |
| `client` | `text` | ❌ | - | **UQ** - Client name |
| `access_token` | `text` | ❌ | - | OAuth access token |
| `refresh_token` | `text` | ❌ | - | OAuth refresh token |
| `token_expires_at` | `timestamptz` | ✅ | - | Token expiration |
| `calendly_user_uri` | `text` | ✅ | - | Calendly user URI |
| `calendly_user_email` | `text` | ✅ | - | Calendly user email |
| `webhook_subscription_uri` | `text` | ✅ | - | Webhook subscription |
| `connected_by` | `text` | ✅ | - | Connected by user |
| `connected_at` | `timestamptz` | ✅ | `now()` | Connection date |
| `updated_at` | `timestamptz` | ✅ | `now()` | Updated |

**RLS:** Disabled

---

## Misc Tables

### `eligible_storeleads_10k`

E-commerce leads dataset from StoreLeads.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `domain_norm` | `text` | ✅ | - | Normalized domain |
| `domain` | `text` | ✅ | - | Domain |
| `company_location` | `text` | ✅ | - | Location |
| `estimated_monthly_sales` | `numeric` | ✅ | - | Est. monthly sales |
| `description` | `text` | ✅ | - | Company description |
| `contact_page_url` | `text` | ✅ | - | Contact page |
| `emails` | `text` | ✅ | - | Emails |
| `linkedin_url` | `text` | ✅ | - | LinkedIn |
| `facebook_url` | `text` | ✅ | - | Facebook |
| `instagram_url` | `text` | ✅ | - | Instagram |
| `twitter_url` | `text` | ✅ | - | Twitter |

**Note:** No primary key - read-only data source.

**RLS:** Disabled

---

### `master_db`

Simplified master contact lookup.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `company_domain` | `text` | ❌ | - | Company domain |
| `full_name` | `text` | ❌ | - | Full name |
| `personal_linkedin` | `text` | ✅ | - | **UQ** - LinkedIn URL |

**Note:** No primary key.

**RLS:** Disabled

---

## Database Functions

### Core Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `get_user_client` | `user_id: string` | `string` | Get client name for authenticated user |
| `normalize_domain` | `raw: string` | `string` | Normalize domain (remove www, lowercase) |
| `map_engaged_lead_to_contact_status` | Multiple boolean params | `string` | Map lead flags to CRM contact status |

### Sync Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| `sync_engaged_lead_to_crm()` | `engaged_leads` INSERT/UPDATE | Syncs engaged leads to crm_contacts |
| `get_or_create_company()` | Called by sync | Finds or creates CRM company |
| `map_lead_status_to_contact_status()` | Called by sync | Maps lead status flags to contact status |

### Data Processing

| Function | Description |
|----------|-------------|
| `copy_storeleads_next_batch(limit)` | Copies batch of StoreLeads data |
| `pull_storeleads_10k_batch(batch_size)` | Pulls StoreLeads batch |
| `process_storeleads_batch(limit)` | Processes StoreLeads batch |
| `claim_unprocessed_rows(batch_size, ...)` | Claims unprocessed rows for batch processing |

### HTTP Functions

| Function | Description |
|----------|-------------|
| `http(request)` | Make HTTP request |
| `http_get(uri)` | HTTP GET request |
| `http_post(uri, content, content_type)` | HTTP POST request |
| `http_put(uri, content, content_type)` | HTTP PUT request |
| `http_delete(uri)` | HTTP DELETE request |
| `http_head(uri)` | HTTP HEAD request |
| `http_patch(uri, content, content_type)` | HTTP PATCH request |
| `urlencode(data)` | URL encode data |

---

## Triggers & Automations

### Engaged Leads → CRM Sync

```sql
-- Trigger on INSERT
CREATE TRIGGER sync_engaged_lead_to_crm_on_insert
  AFTER INSERT ON engaged_leads
  FOR EACH ROW
  EXECUTE FUNCTION sync_engaged_lead_to_crm();

-- Trigger on UPDATE (selective fields)
CREATE TRIGGER sync_engaged_lead_to_crm_on_update
  AFTER UPDATE ON engaged_leads
  FOR EACH ROW
  WHEN (
    OLD.email IS DISTINCT FROM NEW.email OR
    OLD.first_name IS DISTINCT FROM NEW.first_name OR
    OLD.last_name IS DISTINCT FROM NEW.last_name OR
    OLD.company IS DISTINCT FROM NEW.company OR
    ...
  )
  EXECUTE FUNCTION sync_engaged_lead_to_crm();
```

**Behavior:**
1. Creates/updates `crm_contacts` when engaged leads are modified
2. Maps pipeline stage flags to contact status
3. Matches contacts by email + client combination

---

## JSONB Field Schemas

### `sequence_step_stats`
*Used in: `campaign_reporting`*

```typescript
type SequenceStepStats = Array<{
  step_order: number;
  step_id: number;
  subject?: string;
  body?: string;
  variant?: string;
  sent_count: number;
  open_count: number;
  reply_count: number;
  bounce_count: number;
}>;
```

### `pipeline_progress`
*Used in: `crm_contacts`*

```typescript
type PipelineProgress = {
  meeting_booked?: string;  // ISO date
  disco_show?: string;
  qualified?: string;
  demo_booked?: string;
  demo_show?: string;
  proposal_sent?: string;
  closed?: string;
};
```

### `mentioned_users`
*Used in: `client_iteration_logs`*

```typescript
type MentionedUsers = Array<{
  slack_id: string;
  display_name: string;
}>;
```

### `custom_variables_jsonb`
*Used in: `all_leads`, `engaged_leads`, `meetings_booked`, `crm_contacts`*

```typescript
type CustomVariables = {
  [key: string]: string | number | boolean | null;
};
```

### `tags` (JSONB)
*Used in: `crm_contacts`, `crm_deals`, `crm_notes`, `inboxes`, `inbox_sets`, `domain_inventory`*

```typescript
type Tags = Array<string>;
```

### `companyenrich_raw_data`
*Used in: `master_companies_db`, `master_contacts_db`*

Raw JSON response from CompanyEnrich API - schema varies.

---

## Enum Values & Constraints

### Contact Status
*Used in: `crm_contacts.status`*

| Value | Description |
|-------|-------------|
| `cold` | No engagement |
| `warm` | Has replied |
| `hot` | Interested |
| `in-contract` | Qualified/in discussions |
| `customer` | Closed won |
| `inactive` | Closed lost or disengaged |

### Deal Stages
*Used in: `crm_deals.stage`*

| Value | Probability |
|-------|-------------|
| `lead` | 10% |
| `qualification` | 20% |
| `discovery` | 30% |
| `demo` | 50% |
| `proposal` | 70% |
| `negotiation` | 80% |
| `won` | 100% |
| `lost` | 0% |

### Task Types
*Used in: `crm_tasks.type`*

- `task`
- `call`
- `email`
- `meeting`
- `follow_up`
- `reminder`

### Note Types
*Used in: `crm_notes.type`*

- `note`
- `email`
- `call`
- `meeting`
- `status_change`
- `deal_created`
- `deal_won`
- `deal_lost`
- `task_completed`

### Tag Entity Types
*Used in: `crm_tags.entity_type`*

- `company`
- `contact`
- `deal`

### Reply Categories
*Used in: `replies.category`*

- `Interested`
- `Not Interested`
- `OOO` (Out of Office)
- `Referral`
- `Unsubscribe`
- (and others)

### Call Types
*Used in: `client_fathom_calls.call_type`*

- `tam_map`
- `opportunity_review`
- `messaging_review`
- `general`
- `other`

### Call Status
*Used in: `client_fathom_calls.status`*

- `pending`
- `processed`
- `archived`

### Inbox Set Status
*Used in: `inbox_sets.status`*

- `ordered`
- `warming`
- `ready`
- `deployed`
- `paused`
- `archived`

### Inbox Providers
*Used in: `inbox_providers.provider_name`, `inbox_orders.provider`*

- `missioninbox`
- `inboxkit`

### Inbox Provider (Analytics)
*Used in: `inbox_analytics.provider`*

- `missioninbox`
- `inboxkit`
- `bison`

### Health Recommendations
*Used in: `inbox_health_checks.recommendation`*

- `keep`
- `watch`
- `rotate`
- `cancel`

### Order Status
*Used in: `inbox_orders.status`*

- `pending`
- `processing`
- `completed`
- `failed`

### Provider Order Status
*Used in: `provider_orders.status`*

- `draft`
- `exported`
- `submitted`
- `processing`
- `completed`
- `failed`

### Provider Order Type
*Used in: `provider_orders.order_type`*

- `domains`
- `mailboxes`
- `both`

### Domain Providers
*Used in: `domains.provider`*

- `porkbun`
- `inboxkit`
- `missioninbox`
- `other`

### Domain Status
*Used in: `domains.status`*

- `active`
- `expired`
- `pending`
- `transferred`

### Domain Inventory Status
*Used in: `domain_inventory.status`*

- `available`
- `purchased`
- `configured`
- `in_use`
- `expired`
- `reserved`

### Health Status
*Used in: `domains.health_status`*

- `healthy`
- `warning`
- `critical`
- `unknown`

### Registrars
*Used in: `domain_inventory.registrar`*

- `porkbun`
- `namecheap`
- `godaddy`
- `other`

### Inbox Providers (Domain)
*Used in: `domain_inventory.inbox_provider`*

- `missioninbox`
- `inboxkit`
- `none`

### Opportunity Map Status
*Used in: `client_opportunity_maps.status`*

- `draft`
- `confirmed`
- `archived`

### Rebatch Status
*Used in: `rebatch_runs.status`*

- `preview`
- `approved`
- `executing`
- `executed`
- `failed`

---

## Views

### `company_signals`
*Schema: Signals (aliased to public)*

| Column | Type | Description |
|--------|------|-------------|
| `signal_id` | `string` | Signal UUID |
| `company_id` | `string` | Company UUID |
| `signal_type` | `string` | Signal type |
| `signal_source` | `string` | Data source |
| `signal_payload` | `jsonb` | Signal data |
| `payload_hash` | `string` | Deduplication hash |
| `confidence_score` | `number` | Confidence (0-1) |
| `first_seen_at` | `timestamptz` | First seen |
| `last_seen_at` | `timestamptz` | Last seen |
| `created_at` | `timestamptz` | Created |

---

## Cross-Schema References

The following tables exist in other schemas but reference `public` tables:

| Schema | Table | Foreign Key | References |
|--------|-------|-------------|------------|
| `Master` | `campaign_contact_db` | `contact_id` | `master_contacts_db.id` |
| `Master` | `campaign_contact_db` | `company_id` | `master_companies_db.id` |
| `Master` | `campaign_leads_db` | `contact_id` | `master_contacts_db.id` |
| `Master` | `campaign_leads_db` | `company_id` | `master_companies_db.id` |
| `Master` | `bison_queue` | `contact_id` | `master_contacts_db.id` |
| `Signals` | `company_signals` | `company_id` | `master_companies_db.id` |

---

## Notes

### RLS (Row Level Security)

Currently, **all tables have RLS disabled**. Authentication and authorization are handled at the application layer.

For production environments, consider enabling RLS with policies based on:
- User's assigned `client` from `auth.users` metadata
- Role-based access (admin, manager, viewer)

### Soft Deletes

The following tables support soft deletes via `deleted_at` timestamp:
- `engaged_leads`
- `crm_contacts`
- `crm_deals`

Queries should filter: `WHERE deleted_at IS NULL`

### Multi-Tenancy

Data isolation is achieved through the `client` column present in most tables. All queries should include:
```sql
WHERE client = :current_client
```

### Timestamps

Standard timestamp columns:
- `created_at` - Record creation (default: `now()`)
- `updated_at` - Last modification (default: `now()`)

These are **not** automatically updated - application code must manage `updated_at`.
