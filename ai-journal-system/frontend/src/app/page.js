"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import JournalForm from "../components/JournalForm";
import EntryList from "../components/EntryList";
import Insights from "../components/Insights";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function App() {
    const [userId, setUserId] = useState("user-001");
    const [inputUserId, setInputUserId] = useState("user-001");
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

    const handleUserChange = (e) => {
        e.preventDefault();
        setUserId(inputUserId.trim() || "user-001");
    };

    return (
        <div className="app">
            {/* ── Header ── */}
            <header className="header">
                <div className="header-inner">
                    <div className="logo">
                        <span className="logo-icon">🌿</span>
                        <div>
                            <h1 className="logo-title">NatureJournal</h1>
                            <p className="logo-subtitle">AI-Powered Mental Wellness</p>
                        </div>
                    </div>

                    <form className="user-switcher" onSubmit={handleUserChange}>
                        <label className="user-label">User ID</label>
                        <input
                            className="user-input"
                            value={inputUserId}
                            onChange={(e) => setInputUserId(e.target.value)}
                            placeholder="e.g. user-001"
                        />
                        <button type="submit" className="btn btn-ghost btn-sm">
                            Switch
                        </button>
                    </form>
                </div>
            </header>

            {/* ── Tab Navigation ── */}
            <nav className="tab-nav">
                <div className="tab-nav-inner">
                    {[
                        { id: "journal", label: "📝 Journal" },
                        { id: "entries", label: `📚 Entries (${entries.length})` },
                        { id: "insights", label: "📊 Insights" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id === "insights") fetchInsights();
                                if (tab.id === "entries") fetchEntries();
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            {/* ── Content ── */}
            <main className="main">
                {activeTab === "journal" && (
                    <JournalForm
                        userId={userId}
                        onEntryCreated={() => {
                            fetchEntries();
                            fetchInsights();
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
            </main>

            <footer className="footer">
                <p>
                    Powered by{" "}
                    <span className="accent">Groq LLaMA-3</span> · Built with FastAPI &amp; Next.js
                </p>
            </footer>
        </div>
    );
}
