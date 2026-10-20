import "./globals.css";
import { IBM_Plex_Mono, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import Script from "next/script";
import SiteShell from "@/components/site-shell";
import { siteConfig } from "@/config/site";

const notoSansSC = Noto_Sans_SC({
  weight: "variable",
  variable: "--font-noto-sans-sc",
  display: "swap",
  preload: false,
});

const notoSerifSC = Noto_Serif_SC({
  weight: "variable",
  variable: "--font-noto-serif-sc",
  display: "swap",
  preload: false,
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({ children }) {
  const themeScript = `
    (function() {
      try {
        const savedTheme = localStorage.getItem('${siteConfig.themeStorageKey}');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const currentTheme = savedTheme || systemTheme;
        document.documentElement.setAttribute('data-theme', currentTheme);
      } catch (e) {
        console.error(e);
      }
    })()
  `;

  return (
    <html
      lang="zh-CN"
      className={`${notoSansSC.variable} ${notoSerifSC.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body id="top">
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <div className="layout-container">
          <div className="margin-left"></div>
          <div className="gutter-left"></div>

          <div className="workspace-wrapper">
            <SiteShell>{children}</SiteShell>
          </div>

          <div className="gutter-right"></div>
          <div className="margin-right"></div>
        </div>
      </body>
    </html>
  );
}
