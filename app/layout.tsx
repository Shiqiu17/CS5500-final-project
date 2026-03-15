import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import MainNav from "./components/MainNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What To Do",
  description: "AI-powered activity planning and itinerary generation",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}