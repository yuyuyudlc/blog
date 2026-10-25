import SiteFooter from '../SiteFooter';
import SiteHeader from '../SiteHeader';
import './index.css';

/**
 * One narrow column on paper.
 */
export default function AppShell({ children }) {
  return (
    <div className="app">
      <SiteHeader />
      <main className="app-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
