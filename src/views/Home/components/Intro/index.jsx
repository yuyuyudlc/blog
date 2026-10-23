import { siteConfig } from '@/config/site';
import './index.css';

export default function Intro() {
  return (
    <section className="home-intro">
      {siteConfig.intro && <p className="home-intro-lead">{siteConfig.intro}</p>}
      <h1 className="home-intro-title">{siteConfig.tagline}。</h1>
    </section>
  );
}
