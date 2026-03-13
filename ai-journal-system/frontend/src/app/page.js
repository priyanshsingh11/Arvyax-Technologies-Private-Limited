"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
    const appSectionRef = useRef(null);

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

    const scrollToApp = () => {
        appSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="app">
            {/* ── Navigation ── */}
            <header className="header">
                <div className="header-inner">
                    <div className="logo">
                        <h1 className="logo-title">Arvyax Technologies Private Limited</h1>
                    </div>
                    <nav className="nav-links">
                        <a href="#" className="nav-link">Home</a>
                        <a href="#app-section" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToApp(); setActiveTab('journal'); }}>Journal</a>
                        <a href="#app-section" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToApp(); setActiveTab('insights'); }}>Insights</a>
                        <button className="btn-get-started" onClick={scrollToApp}>Get Started</button>
                    </nav>
                </div>
            </header>

            {/* ── Hero Section ── */}
            <section className="hero">
                <div className="hero-content">
                    <h2 className="hero-title">
                        AI-Powered
                        <span>Mental Wellness</span>
                    </h2>
                    <p className="hero-subtitle">Reflect, relax, and grow with nature.</p>
                    <button className="btn-hero" onClick={scrollToApp}>Start Journaling</button>
                </div>
            </section>

            {/* ── Features Section ── */}
            <section className="features">
                <div className="feature-card">
                    <span className="feature-icon">📖</span>
                    <h3 className="feature-title">Guided Journaling</h3>
                    <p className="text-muted">Unload your thoughts in a focused environment.</p>
                </div>
                <div className="feature-card">
                    <span className="feature-icon">🧠</span>
                    <h3 className="feature-title">Mood Insights</h3>
                    <p className="text-muted">Understand your emotional patterns using AI.</p>
                </div>
                <div className="feature-card">
                    <span className="feature-icon">🌿</span>
                    <h3 className="feature-title">Nature Meditations</h3>
                    <p className="text-muted">Connect with immersive natural ambiences.</p>
                </div>
            </section>

            {/* ── App Content ── */}
            <main id="app-section" ref={appSectionRef} className="main">
                <div className="tab-nav">
                    <button
                        className={`tab-btn ${activeTab === "journal" ? "active" : ""}`}
                        onClick={() => setActiveTab("journal")}
                    >
                        📝 Write
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "entries" ? "active" : ""}`}
                        onClick={() => { setActiveTab("entries"); fetchEntries(); }}
                    >
                        📚 My History ({entries.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "insights" ? "active" : ""}`}
                        onClick={() => { setActiveTab("insights"); fetchInsights(); }}
                    >
                        📊 Insights
                    </button>
                </div>

                <div className="app-container">
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
                </div>
            </main>

            <footer className="footer">
                <p>
                    Powered by <span className="accent">Groq LLaMA-3.1</span> · Built with FastAPI & Next.js
                </p>
            </footer>
        </div>
    );
}
