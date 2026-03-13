"use client";

export default function Insights({ data, loading }) {
    if (loading) {
        return (
            <div className="card">
                <h2 className="card-title">📊 Your Insights</h2>
                <p className="loading-text">Loading insights...</p>
            </div>
        );
    }

    if (!data || data.totalEntries === 0) {
        return (
            <div className="card">
                <h2 className="card-title">📊 Your Insights</h2>
                <p className="empty-state">
                    No insights yet — analyze some entries first to see your emotional patterns.
                </p>
            </div>
        );
    }

    const ambienceEmoji = { forest: "🌲", ocean: "🌊", mountain: "⛰️" };

    return (
        <div className="card">
            <h2 className="card-title">📊 Your Insights</h2>
            <div className="insights-grid">
                <div className="insight-tile">
                    <span className="insight-value">{data.totalEntries}</span>
                    <span className="insight-label">Total Entries</span>
                </div>

                <div className="insight-tile">
                    <span className="insight-value">
                        {data.topEmotion ? `😊 ${data.topEmotion}` : "—"}
                    </span>
                    <span className="insight-label">Top Emotion</span>
                </div>

                <div className="insight-tile">
                    <span className="insight-value">
                        {data.mostUsedAmbience
                            ? `${ambienceEmoji[data.mostUsedAmbience] || "🌿"} ${data.mostUsedAmbience.charAt(0).toUpperCase() +
                            data.mostUsedAmbience.slice(1)
                            }`
                            : "—"}
                    </span>
                    <span className="insight-label">Favourite Ambience</span>
                </div>
            </div>

            {data.recentKeywords && data.recentKeywords.length > 0 && (
                <div className="recent-keywords">
                    <p className="insight-label" style={{ marginBottom: "0.5rem" }}>
                        Recent Keywords
                    </p>
                    <div className="keywords">
                        {data.recentKeywords.map((kw) => (
                            <span key={kw} className="keyword-chip keyword-chip--accent">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
