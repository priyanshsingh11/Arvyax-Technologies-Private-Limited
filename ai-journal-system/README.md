# 🌿 AI-Assisted Journal System

An AI-powered journaling platform for nature session participants. After each immersive session (forest, ocean, or mountain), users write a journal entry describing how they feel. The system stores entries, analyzes emotions using **Groq LLaMA-3**, and surfaces mental-health insights over time.

---

## Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Backend   | Python · FastAPI               |
| Database  | SQLite · SQLAlchemy ORM        |
| LLM       | Groq API · LLaMA 3 (8B)       |
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
- A free **[Groq API key](https://console.groq.com/)** (model: `llama3-8b-8192`)

---

## Installation & Running

### 1. Clone / navigate to the project

```bash
cd ai-journal-system
```

### 2. Backend

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set your Groq API key
set GROQ_API_KEY=gsk_your_key_here       # Windows CMD
$env:GROQ_API_KEY="gsk_your_key_here"   # Windows PowerShell
export GROQ_API_KEY=gsk_your_key_here   # macOS/Linux

# Run the server
uvicorn main:app --reload --port 8000
```

The backend will be available at **http://localhost:8000**.  
Interactive API docs: **http://localhost:8000/docs**

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

**Request:**
```json
{
  "userId": "user-001",
  "ambience": "forest",
  "text": "I felt calm today after listening to the rain."
}
```

**Response `201`:**
```json
{
  "id": 1,
  "userId": "user-001",
  "ambience": "forest",
  "text": "I felt calm today after listening to the rain.",
  "emotion": null,
  "keywords": null,
  "summary": null,
  "created_at": "2024-06-01T10:30:00"
}
```

---

### `GET /api/journal/{userId}` — Get User Entries

**Example:** `GET /api/journal/user-001`

Returns an array of all entries for the user, most recent first.

---

### `POST /api/journal/analyze` — Analyze Text (LLM)

Calls **Groq LLaMA-3** to analyze the emotional tone. Does **not** save results.

**Request:**
```json
{
  "text": "I felt calm today after listening to the rain"
}
```

**Response:**
```json
{
  "emotion": "calm",
  "keywords": ["rain", "nature", "peace"],
  "summary": "User experienced relaxation during the forest session"
}
```

---

### `POST /api/journal/{entryId}/analyze` — Analyze & Save

Runs LLM analysis on an existing entry and **persists** the results to the database.

**Example:** `POST /api/journal/1/analyze`

Returns the updated `JournalEntry` object.

---

### `GET /api/journal/insights/{userId}` — Insights

**Example:** `GET /api/journal/insights/user-001`

**Response:**
```json
{
  "totalEntries": 8,
  "topEmotion": "calm",
  "mostUsedAmbience": "forest",
  "recentKeywords": ["focus", "nature", "rain", "peace"]
}
```

---

## LLM Details

- **Provider:** [Groq](https://groq.com/)
- **Model:** `llama3-8b-8192` (LLaMA 3 8B)
- **Purpose:** Emotion detection, keyword extraction, and one-sentence summary of each journal entry
- **Key required:** Set `GROQ_API_KEY` environment variable before starting the backend

---

## Environment Variables

| Variable            | Where     | Description                |
|---------------------|-----------|----------------------------|
| `GROQ_API_KEY`      | Backend   | Your Groq API key          |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend URL (default: `http://localhost:8000`) |
