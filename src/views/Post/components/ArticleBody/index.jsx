import './index.css';

/**
 * Rendered Markdown. Code-copy and image-preview behaviour are attached
 * by `CodeCopy` and `ImagePreview`, which look up `.article-body`.
 */
export default function ArticleBody({ html }) {
  return <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
