export const siteConfig = {
  name: 'dev.log',
  title: 'dev.log Journal',
  description:
    'Independent engineering notes on editors, rendering, collaboration, and developer tooling.',
  tagline:
    'Independent engineering notes on editors, rendering, collaboration, and developer tooling.',
  author: 'Editorial Desk',
  copyright: '(c) 2026 dev.log. Powered by Next.js.',
  themeStorageKey: 'dev-log-theme',
  toastId: 'dev-log-toast',
  nav: [
    { label: 'Journal', href: '/' },
    { label: 'Archive', href: '/#archive' },
  ],
  categories: [
    { label: '首页', slug: 'all' },
    { label: '前端', slug: 'frontend' },
    { label: '后端', slug: 'backend' },
    { label: 'AI', slug: 'ai' },
    { label: '随记', slug: 'notes' },
    { label: '个人兴趣', slug: 'interests' },
  ],
};
