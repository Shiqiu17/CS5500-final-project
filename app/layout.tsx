import "./globals.css";
import MainNav from "./components/MainNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What To Do",
  description: "AI-powered activity planning and itinerary generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MainNav />
        {children}
      </body>
    </html>
  );
}
