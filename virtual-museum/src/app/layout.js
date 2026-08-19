import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Virtual Heritage Museum | Interactive 3D Cultural Experience",
  description:
    "Explore world history, classical antiquities, medieval treasures, and ancient monuments in an immersive 3D virtual museum environment built with Next.js, Three.js, and React Three Fiber.",
  keywords: [
    "3D Virtual Museum",
    "Three.js",
    "React Three Fiber",
    "Next.js",
    "Cultural Heritage",
    "Interactive Exhibition",
    "3D Artifacts",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full w-full overflow-hidden bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
