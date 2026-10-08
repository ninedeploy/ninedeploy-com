import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Quicksand, Space_Grotesk } from "next/font/google";
import { CommandPalette } from "@/components/command-palette";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Providers } from "@/components/theme";
import { site } from "@/lib/site";
import "./globals.css";

// The same pair ninedeploy.com has always used.
const spaceGrotesk = Space_Grotesk({
  // latin covers the site's copy (including Ü in OXOGNET OÜ); latin-ext only cost LCP.
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// Only the logo's lowercase wordmark is set in Quicksand.
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-quicksand",
  display: "swap",
});

// The dashboard's own mono, so terminal snippets here read like the product.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  // Code shows up below the fold; don't let it compete with the headline font.
  preload: false,
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "NineDeploy — ship like you mean it",
    template: "%s — NineDeploy",
  },
  description: site.description,
  applicationName: site.name,
  keywords: ["self-hosted PaaS", "blue-green deploy", "Docker", "Traefik", "MCP", "Heroku alternative", "Coolify alternative"],
  authors: [{ name: "OXOGNET OÜ", url: "https://oxog.net" }],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "NineDeploy — ship like you mean it",
    description: site.description,
    url: site.url,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "NineDeploy — ship like you mean it" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NineDeploy — ship like you mean it",
    description: site.description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  // The site defaults to dark whatever the OS says; ThemeColor updates this on toggle.
  themeColor: "#0a101b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${jetbrains.variable} ${quicksand.variable}`}>
      <body className="min-h-dvh overflow-x-clip">
        <Providers>
          <CommandPalette>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </CommandPalette>
        </Providers>
      </body>
    </html>
  );
}
