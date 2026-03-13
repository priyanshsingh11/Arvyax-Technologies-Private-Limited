"use client";

import { useState } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const AMBIENCES = ["forest", "ocean", "mountain"];

export default function JournalForm({ userId, onEntryCreated }) {
    const [ambience, setAmbience] = useState("forest");
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!text.trim()) {
            setError("Please write something in your journal entry.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE}/api/journal`, {
                userId,
                ambience,
                text,
            });
            setSuccess("Journal entry saved! Click 'Analyze' on it to get insights.");
            setText("");
            if (onEntryCreated) onEntryCreated();
        } catch (err) {
            setError(err?.response?.data?.detail || "Failed to save entry.");
        } finally {
            setLoading(false);
        }
    };

    const ambienceEmoji = { forest: "🌲", ocean: "🌊", mountain: "⛰️" };

    return (
        <div className="card">
            <h2 className="card-title">📝 New Journal Entry</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label className="label">Choose Your Nature Session</label>
                    <div className="ambience-grid">
                        {AMBIENCES.map((a) => (
                            <button
                                key={a}
                                type="button"
                                className={`ambience-btn ${ambience === a ? "active" : ""}`}
                                onClick={() => setAmbience(a)}
                            >
                                <span className="ambience-icon">{ambienceEmoji[a]}</span>
                                <span className="ambience-label">{a.charAt(0).toUpperCase() + a.slice(1)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="label" htmlFor="journal-text">
                        How are you feeling?
                    </label>
                    <textarea
                        id="journal-text"
                        className="textarea"
                        rows={6}
                        placeholder="Describe your experience during the session — what you felt, noticed, or thought about..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>

                {error && <p className="message error">{error}</p>}
                {success && <p className="message success">{success}</p>}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Entry"}
                </button>
            </form>
        </div>
    );
}
