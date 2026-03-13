# ARCHITECTURE.md — AI-Assisted Journal System

## Overview

This document explains the key architectural decisions, scalability strategies, cost optimizations, caching approaches, and security measures for the AI-Assisted Journal System.

---

## 1. Scaling to 100,000 Users

### Current Architecture (Single Server)

```
Client → FastAPI (single process) → SQLite → Groq API
```

This works for development but breaks under real load. Here is the path to scale.

### Production Architecture

```
                          ┌──────────────────┐
                          │   Load Balancer   │  (AWS ALB / Nginx)
                          └────────┬─────────┘
               ┌───────────────────┼────────────────────┐
               ▼                   ▼                    ▼
        FastAPI Pod 1        FastAPI Pod 2        FastAPI Pod N
               │                   │                    │
               └───────────────────┴────────────────────┘
                                   │
                    ┌──────────────┴─────────────┐
                    ▼                             ▼
             PostgreSQL                        Redis
         (Primary + Read Replicas)          (Cache Layer)
```

### Key Changes

| Concern           | Solution                                                                   |
|-------------------|----------------------------------------------------------------------------|
| **SQLite → PostgreSQL** | SQLite is single-writer; replace with PostgreSQL for concurrent writes |
| **Horizontal scaling**  | Run multiple FastAPI instances behind a load balancer (Kubernetes / ECS) |
| **Stateless API**       | No session state in the API; all state in DB/Redis so any pod can serve any request |
| **Read replicas**       | Route `GET` queries to read replicas, `POST/PUT` to primary               |
| **Auto-scaling**        | Use CPU/request-rate metrics to spin up/down pods automatically            |
| **CDN**                 | Serve the Next.js frontend via Vercel / CloudFront for global low-latency  |

### Database Migration

```python
# Change one line in database.py:
DATABASE_URL = "postgresql+asyncpg://user:password@db-host/journal_db"
```

Add Alembic for zero-downtime schema migrations.

---

## 2. Reducing LLM Cost

LLM API calls are the largest marginal cost. Four strategies address this:

### 2a. Cache Analysis Results

Identical or near-identical journal texts should not trigger a new API call:

```python
import hashlib, redis

cache = redis.Redis(host="localhost", port=6379, db=0)

def analyze_journal_entry(text: str) -> dict:
    key = "analysis:" + hashlib.sha256(text.encode()).hexdigest()
    cached = cache.get(key)
    if cached:
        return json.loads(cached)         # Cache hit — no LLM cost

    result = call_groq_llm(text)          # Cache miss — LLM call
    cache.setex(key, 86400, json.dumps(result))  # Cache for 24 h
    return result
```

### 2b. Batch Requests

Instead of calling the LLM once per entry, accumulate multiple entries and send them in a single API call using structured output. This can reduce the number of calls by 5–10×.

### 2c. Use Smaller Models

`llama3-8b-8192` is already a cost-effective choice. For even lower cost:
- Use `mixtral-8x7b-32768` for higher throughput tasks.
- Use `gemma-7b-it` for shorter inputs.
- Reserve larger models (GPT-4, Claude) for complex entries only.

### 2d. Lazy Analysis

Only run LLM analysis when explicitly requested (the "Analyze" button pattern in this app) rather than analyzing every entry on write. This reduces LLM calls to only what users actually need.

---

## 3. Caching Repeated Analysis

### Redis (Recommended for Production)

Redis provides sub-millisecond lookups and TTL-based expiry:

```python
# Cache key = SHA-256 hash of the journal text
# TTL = 24 hours (analysis of the same text is stable)

CACHE_TTL_SECONDS = 86400  # 24 hours

def get_cached_or_analyze(text: str) -> dict:
    cache_key = f"journal:analysis:{hashlib.sha256(text.encode()).hexdigest()}"
    hit = redis_client.get(cache_key)
    if hit:
        return json.loads(hit)
    result = analyze_journal_entry(text)
    redis_client.setex(cache_key, CACHE_TTL_SECONDS, json.dumps(result))
    return result
```

### In-Process Cache (Lightweight / No Redis)

For smaller deployments, use `functools.lru_cache` or `cachetools.TTLCache`:

```python
from cachetools import TTLCache
_analysis_cache = TTLCache(maxsize=1000, ttl=3600)  # 1000 entries, 1-hour TTL
```

### Database-Level Cache

The current design already persists `emotion`, `keywords`, and `summary` back to the `JournalEntry` row. Subsequent reads of the same entry skip the LLM entirely — this is the most durable caching strategy.

---

## 4. Protecting Sensitive Journal Data

Journal entries describe personal mental and emotional states. They require strong protection.

### 4a. Authentication & Authorization

```
Every API request must carry a signed JWT:

Authorization: Bearer <jwt>

FastAPI dependency:
def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return payload["sub"]

All /api/journal/{userId}/* endpoints verify that
the authenticated user == userId in the path.
```

Use **Auth0**, **Supabase Auth**, or **AWS Cognito** as the identity provider to avoid rolling your own auth.

### 4b. Encryption at Rest

- PostgreSQL: Enable **Transparent Data Encryption (TDE)** at the storage layer (AWS RDS does this by default).
- Sensitive columns (`text`, `summary`): Apply **column-level encryption** using `pgcrypto` or SQLAlchemy's encryption types.

```sql
-- Example: AES-256 column encryption in PostgreSQL
INSERT INTO journal_entries (text) VALUES (pgp_sym_encrypt(:text, :key));
SELECT pgp_sym_decrypt(text, :key) FROM journal_entries WHERE id = :id;
```

### 4c. Encryption in Transit

- Force **HTTPS** everywhere (TLS 1.2+). Use Let's Encrypt for free certificates.
- Enable `HSTS` headers on the API.
- Use secure cookies (`HttpOnly`, `SameSite=Strict`, `Secure`).

### 4d. Input Validation & Rate Limiting

```python
# FastAPI rate limiting with slowapi:
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/api/journal/analyze")
@limiter.limit("10/minute")
async def analyze_entry(request: Request, ...):
    ...
```

Validate all inputs via Pydantic (already done). Limit journal text to a maximum of 5,000 characters.

### 4e. Groq API Data Handling

- Journal text is sent to Groq for analysis. Review [Groq's data policy](https://groq.com/privacy-policy/) before using in production.
- Consider PII redaction before sending to the LLM if users may include names, locations, or health info.
- For regulated industries (HIPAA, GDPR), use an on-premise LLM (Ollama + LLaMA 3) to keep data within your infrastructure.

### 4f. Audit Logging

Log every data access event (who accessed which entry, when) to an append-only audit log for compliance and breach detection.

---

## Summary Table

| Concern               | Current (Dev)     | Production Target                         |
|-----------------------|-------------------|-------------------------------------------|
| Database              | SQLite            | PostgreSQL + Read Replicas                |
| Scaling               | Single process    | Kubernetes / ECS with HPA                 |
| Load balancing        | None              | AWS ALB / Nginx                           |
| LLM cost              | Per-request       | Redis cache + lazy analysis + batching    |
| Auth                  | None              | JWT via Auth0 / Supabase                  |
| Encryption at rest    | None              | TDE + column-level encryption             |
| Encryption in transit | HTTP              | HTTPS (TLS 1.3) + HSTS                    |
| Rate limiting         | None              | slowapi / API Gateway throttling          |
| Audit logging         | None              | Append-only log (CloudWatch / Datadog)    |
