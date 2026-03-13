import "./globals.css";

export const metadata = {
    title: "NatureJournal – AI-Powered Mental Wellness",
    description:
        "An AI-assisted journal system for nature session participants. Powered by Groq LLaMA-3.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
