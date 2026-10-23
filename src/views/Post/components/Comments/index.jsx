'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import './index.css';

const Giscus = dynamic(() => import('@giscus/react').then((module) => module.default), {
  ssr: false,
  loading: () => (
    <p className="comments-status" role="status">
      正在加载评论…
    </p>
  ),
});

const GISCUS_THEME_FILES = {
  light: 'giscus-light.css',
  dark: 'giscus-dark.css',
};

function readTheme() {
  if (typeof document === 'undefined') return 'preferred_color_scheme';
  const colorScheme = document.documentElement.getAttribute('data-theme') === 'light'
    ? 'light'
    : 'dark';

  return `${window.location.origin}/${GISCUS_THEME_FILES[colorScheme]}`;
}

export default function Comments({ config }) {
  const [theme, setTheme] = useState('preferred_color_scheme');

  useEffect(() => {
    const root = document.documentElement;
    let frame;
    const syncTheme = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setTheme(readTheme()));
    };
    const observer = new MutationObserver(syncTheme);

    syncTheme();
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <section className="comments" aria-labelledby="comments-title">
      <div className="comments-heading">
        <h2 id="comments-title">评论</h2>
        <p>
          欢迎交流文章中的想法与问题，评论由{' '}
          <a href={config.discussionsUrl}>GitHub Discussions</a> 提供支持。
        </p>
      </div>

      {config.enabled ? (
        <Giscus
          id="comments"
          repo={config.repo}
          repoId={config.repoId}
          category={config.category}
          categoryId={config.categoryId}
          mapping="pathname"
          strict="1"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme={theme}
          lang="zh-CN"
          loading="lazy"
        />
      ) : (
        <p className="comments-fallback">
          评论暂未启用。仓库 Discussions 配置完成后会在此显示；也可以前往{' '}
          <a href={config.discussionsUrl}>GitHub Discussions</a>。
        </p>
      )}
    </section>
  );
}
