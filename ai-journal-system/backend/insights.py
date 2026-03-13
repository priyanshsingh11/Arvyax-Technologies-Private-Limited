from collections import Counter
from typing import List
from models import JournalEntry


def compute_insights(entries: List[JournalEntry]) -> dict:
    """
    Compute aggregated insights from a list of journal entries.
    """
    total = len(entries)

    if total == 0:
        return {
            "totalEntries": 0,
            "topEmotion": None,
            "mostUsedAmbience": None,
            "recentKeywords": [],
        }

    # Most common emotion
    emotions = [e.emotion for e in entries if e.emotion]
    top_emotion = Counter(emotions).most_common(1)[0][0] if emotions else None

    # Most common ambience
    ambiences = [e.ambience for e in entries if e.ambience]
    most_used_ambience = Counter(ambiences).most_common(1)[0][0] if ambiences else None

    # Recent keywords: collect from the 5 most recent entries
    recent_entries = sorted(entries, key=lambda e: e.created_at or "", reverse=True)[:5]
    all_keywords = []
    for entry in recent_entries:
        if entry.keywords:
            kw_list = [k.strip() for k in entry.keywords.split(",") if k.strip()]
            all_keywords.extend(kw_list)

    # Deduplicate while preserving order
    seen = set()
    recent_keywords = []
    for kw in all_keywords:
        if kw.lower() not in seen:
            seen.add(kw.lower())
            recent_keywords.append(kw)
    recent_keywords = recent_keywords[:10]

    return {
        "totalEntries": total,
        "topEmotion": top_emotion,
        "mostUsedAmbience": most_used_ambience,
        "recentKeywords": recent_keywords,
    }
