import { siteConfig } from '@/config/site';
import { FrameNodes } from '@/components/frame';

export default function HomeHero() {
  return (
    <section className="hero-section framed-section">
      <FrameNodes />
      <div className="hero-grid-overlay"></div>

      <div className="hero-content">
        <h1 className="hero-title">{siteConfig.title}</h1>

        <p className="hero-subtitle">{siteConfig.tagline}</p>

        <div className="hero-meta">Showing the latest entries from the technical desk.</div>
      </div>

    </section>
  );
}
