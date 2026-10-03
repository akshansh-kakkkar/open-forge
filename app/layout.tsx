import "../styles.css";
import "./less-slop.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "OpenForge — AI NPC Lab", description: "Open-weight NPC runtime experiment" };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
