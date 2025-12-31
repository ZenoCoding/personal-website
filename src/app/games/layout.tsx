import "../globals.css";

export const metadata = {
    title: "Games | Tycho Young",
    description: "Chinese card games",
};

// Games layout - no navbar/footer for fullscreen gaming
export default function GamesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ minHeight: '100vh' }}>
            {children}
        </div>
    );
}
