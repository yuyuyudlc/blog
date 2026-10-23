import './index.css';

export default function ArchiveHeader({ total }) {
  return (
    <header className="archive-header">
      <h1 className="archive-header-title">归档</h1>
      <p className="meta">共 {total} 篇，按时间倒序。</p>
    </header>
  );
}
