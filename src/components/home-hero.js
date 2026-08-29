import { siteConfig } from '@/config/site';
import { FrameNodes } from '@/components/frame';
import { TatamiMark, TatamiPlan } from '@/components/tatami-motif';

export default function HomeHero() {
  return (
    <section className="hero-section framed-section">
      <FrameNodes />
      <div className="hero-grid-overlay"></div>
      <TatamiPlan className="hero-tatami-plan" variant="hero" />

      <div className="hero-content">
        <div className="hero-kicker">
          <TatamiMark />
          <span>4 + ½ / OFFSET JOURNAL</span>
        </div>
        <h1 className="hero-title">{siteConfig.title}</h1>

        <p className="hero-subtitle">{siteConfig.tagline}</p>

      </div>

    </section>
  );
}
