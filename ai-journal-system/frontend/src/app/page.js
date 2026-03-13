"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import JournalForm from "../components/JournalForm";
import EntryList from "../components/EntryList";
import Insights from "../components/Insights";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function App() {
    const [userId, setUserId] = useState("user-001");
    const [entries, setEntries] = useState([]);
    const [insights, setInsights] = useState(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("journal");

    const fetchEntries = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/journal/${userId}`);
            setEntries(res.data);
        } catch {
            setEntries([]);
        }
    }, [userId]);

    const fetchInsights = useCallback(async () => {
        setInsightsLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/api/journal/insights/${userId}`);
            setInsights(res.data);
        } catch {
            setInsights(null);
        } finally {
            setInsightsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchEntries();
        fetchInsights();
    }, [fetchEntries, fetchInsights]);

    return (
        <div className="app">
            <header className="header">
                <div className="header-inner">
                    <div className="logo">
                        <h1 className="logo-title">Arvyax NatureJournal</h1>
                    </div>
                    <div className="user-control">
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginRight: "0.5rem" }}>User:</span>
                        <input
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            style={{ padding: "0.3rem", borderRadius: "8px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.5)" }}
                        />
                    </div>
                </div>
            </header>

            <div className="dashboard-header">
                <h2 className="dashboard-title">
                    AI-Powered
                    <span>Mental Wellness</span>
                </h2>
                <p className="dashboard-subtitle">Your personal space for reflection and growth, powered by intelligence.</p>
            </div>

            <main className="main">
                <aside className="sidebar">
                    <div className="card" style={{ padding: "1.5rem" }}>
                        <nav className="tab-nav">
                            <button
                                className={`tab-btn ${activeTab === "journal" ? "active" : ""}`}
                                onClick={() => setActiveTab("journal")}
                            >
                                📝 New Entry
                            </button>
                            <button
                                className={`tab-btn ${activeTab === "entries" ? "active" : ""}`}
                                onClick={() => { setActiveTab("entries"); fetchEntries(); }}
                            >
                                📚 History ({entries.length})
                            </button>
                            <button
                                className={`tab-btn ${activeTab === "insights" ? "active" : ""}`}
                                onClick={() => { setActiveTab("insights"); fetchInsights(); }}
                            >
                                📊 Insights
                            </button>
                        </nav>
                    </div>

                    <div className="sidebar-features">
                        <div className="compact-feature" style={{ marginBottom: "1rem" }}>
                            <span className="compact-feature-icon">📖</span>
                            <div>
                                <p className="compact-feature-title">Guided Journaling</p>
                            </div>
                        </div>
                        <div className="compact-feature" style={{ marginBottom: "1rem" }}>
                            <span className="compact-feature-icon">🧠</span>
                            <div>
                                <p className="compact-feature-title">Mood Insights</p>
                            </div>
                        </div>
                        <div className="compact-feature">
                            <span className="compact-feature-icon">🌿</span>
                            <div>
                                <p className="compact-feature-title">Nature Meditations</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="dashboard-content">
                    {activeTab === "journal" && (
                        <JournalForm
                            userId={userId}
                            onEntryCreated={() => {
                                fetchEntries();
                                fetchInsights();
                                setActiveTab("entries");
                            }}
                        />
                    )}

                    {activeTab === "entries" && (
                        <EntryList
                            entries={entries}
                            onAnalyzed={() => {
                                fetchEntries();
                                fetchInsights();
                            }}
                        />
                    )}

                    {activeTab === "insights" && (
                        <Insights data={insights} loading={insightsLoading} />
                    )}
                </section>
            </main>

            <footer className="footer">
                <p>
                    Powered by <span className="accent">Groq LLaMA-3.1</span> · Built with FastAPI & Next.js
                </p>
            </footer>
        </div>
    );
}
