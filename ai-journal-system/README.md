# 🌿 AI-Assisted Journal System

An AI-powered journaling platform for nature session participants. After each immersive session (forest, ocean, or mountain), users write a journal entry describing how they feel. The system stores entries, analyzes emotions using **Groq LLaMA-3.1**, and surfaces mental-health insights over time.

---

## Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Backend   | Python · FastAPI               |
| Database  | SQLite · SQLAlchemy ORM        |
| LLM       | Groq API · LLaMA 3.1 (8B)     |
| Frontend  | React · Next.js 14             |

---

## Project Structure

```
ai-journal-system/
├── backend/
│   ├── main.py          # FastAPI app & all endpoints
│   ├── database.py      # SQLAlchemy engine & session
│   ├── models.py        # JournalEntry ORM model
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── llm.py           # Groq LLaMA-3 integration
│   ├── insights.py      # Aggregation logic
│   ├── .env             # Groq API Key storage
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   └── src/
│       ├── app/
│       │   ├── page.js       # Main page (tabs for Journal, Entries, Insights)
│       │   ├── layout.js     # Root layout
│       │   └── globals.css   # Design system & global styles
│       └── components/
│           ├── JournalForm.js # Write & submit entries
│           ├── EntryList.js   # View & analyze entries
│           └── Insights.js    # Aggregated stats
├── README.md
└── ARCHITECTURE.md
```

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- A free **[Groq API key](https://console.groq.com/)** (model: `llama-3.1-8b-instant`)

---

## Installation & Running

### 1. Clone / navigate to the project

```bash
cd ai-journal-system
```

### 2. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

> [!NOTE]
> The Groq API key is already configured in `backend/.env`.

### 3. Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at **http://localhost:3000**.

---

## API Reference

### `POST /api/journal` — Create Entry
### `GET /api/journal/{userId}` — Get User Entries
### `POST /api/journal/analyze` — Analyze Text (LLM)
### `GET /api/journal/insights/{userId}` — Insights

---

## LLM Details

- **Provider:** [Groq](https://groq.com/)
- **Model:** `llama-3.1-8b-instant` (LLaMA 3.1 8B)
- **Purpose:** Emotion detection and mental state summary.
