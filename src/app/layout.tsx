import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Providers } from "@/components/theme";
import { site } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
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
  },
  twitter: { card: "summary_large_image", title: "NineDeploy — ship like you mean it", description: site.description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d1522" },
    { media: "(prefers-color-scheme: light)", color: "#f2f4f7" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh overflow-x-clip">
        <Providers>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
