import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import { TabBar } from "@/components/TabBar";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "coy · discover",
  description: "Swipe, quietly. Nobody knows you liked them unless they like you back.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff7f0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable} antialiased`}>
      {/* Browser extensions inject attributes on <body>; don't flag those as mismatches. */}
      <body className="min-h-dvh" suppressHydrationWarning>
        <div className="app-shell relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col">
          <main className="flex flex-1 flex-col px-5 pb-32 pt-[max(env(safe-area-inset-top),1.25rem)]">
            {children}
          </main>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
