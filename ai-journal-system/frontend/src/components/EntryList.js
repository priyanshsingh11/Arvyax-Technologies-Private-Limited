"use client";

import { useState } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ambienceEmoji = { forest: "🌲", ocean: "🌊", mountain: "⛰️" };

function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function EntryList({ entries, onAnalyzed }) {
    const [loadingId, setLoadingId] = useState(null);
    const [analysis, setAnalysis] = useState({}); // entryId -> analysis result

    const handleAnalyze = async (entry) => {
        setLoadingId(entry.id);
        try {
            // Call the analyze-and-save endpoint so results are persisted
            const res = await axios.post(`${API_BASE}/api/journal/${entry.id}/analyze`);
            setAnalysis((prev) => ({ ...prev, [entry.id]: res.data }));
            if (onAnalyzed) onAnalyzed();
        } catch (err) {
            alert(err?.response?.data?.detail || "Analysis failed. Is GROQ_API_KEY set?");
        } finally {
            setLoadingId(null);
        }
    };

    if (!entries || entries.length === 0) {
        return (
            <div className="card">
                <h2 className="card-title">📚 Previous Entries</h2>
                <p className="empty-state">No entries yet. Create your first journal entry above!</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h2 className="card-title">📚 Previous Entries ({entries.length})</h2>
            <div className="entry-list">
                {entries.map((entry) => {
                    const analysisResult = analysis[entry.id];
                    const savedEmotion = entry.emotion || (analysisResult && analysisResult.emotion);
                    const savedSummary = entry.summary || (analysisResult && analysisResult.summary);
                    const savedKeywords =
                        entry.keywords
                            ? entry.keywords.split(",").map((k) => k.trim())
                            : analysisResult?.keywords || [];

                    return (
                        <div key={entry.id} className="entry-card">
                            <div className="entry-header">
                                <div className="entry-meta">
                                    <span className="entry-ambience">
                                        {ambienceEmoji[entry.ambience] || "🌿"}{" "}
                                        {entry.ambience.charAt(0).toUpperCase() + entry.ambience.slice(1)}
                                    </span>
                                    <span className="entry-date">{formatDate(entry.created_at)}</span>
                                </div>
                                {savedEmotion && (
                                    <span className="emotion-badge">{savedEmotion}</span>
                                )}
                            </div>

                            <p className="entry-text">{entry.text}</p>

                            {savedSummary && (
                                <div className="analysis-block">
                                    <p className="analysis-summary">💡 {savedSummary}</p>
                                    {savedKeywords.length > 0 && (
                                        <div className="keywords">
                                            {savedKeywords.map((kw) => (
                                                <span key={kw} className="keyword-chip">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleAnalyze(entry)}
                                disabled={loadingId === entry.id}
                            >
                                {loadingId === entry.id ? "Analyzing..." : "🔮 Analyze"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
