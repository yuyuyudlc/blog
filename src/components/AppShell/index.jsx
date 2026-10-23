import CommandProvider from '../CommandProvider';
import SiteFooter from '../SiteFooter';
import SiteHeader from '../SiteHeader';
import './index.css';

/**
 * One narrow column on paper. `posts` is the serializable search index
 * used by the command palette.
 */
export default function AppShell({ posts = [], children }) {
  return (
    <CommandProvider posts={posts}>
      <div className="app">
        <SiteHeader />
        <main className="app-main">{children}</main>
        <SiteFooter />
      </div>
    </CommandProvider>
  );
}
