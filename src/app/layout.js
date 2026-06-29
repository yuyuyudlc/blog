import "./globals.css";
import SiteShell from "@/components/site-shell";
import { siteConfig } from "@/config/site";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body id="top">
        <div className="layout-container">
          <div className="margin-left">
            <div className="junction-node" style={{ right: '-3px', top: '61px' }}></div>
          </div>

          <div className="gutter-left">
            <div className="junction-node" style={{ right: '-3px', top: '61px' }}></div>
          </div>

          <div className="workspace-wrapper">
            <SiteShell>{children}</SiteShell>
          </div>

          <div className="gutter-right">
            <div className="junction-node" style={{ left: '-3px', top: '61px' }}></div>
          </div>

          <div className="margin-right">
            <div className="junction-node" style={{ left: '-3px', top: '61px' }}></div>
          </div>
        </div>
      </body>
    </html>
  );
}
