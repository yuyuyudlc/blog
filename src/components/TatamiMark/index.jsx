import './index.css';

/**
 * The site logo: a 4.5-tatami room reduced to a square and its seams.
 */
export default function TatamiMark() {
  return (
    <svg className="tatami-mark" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="0.75" y="0.75" width="16.5" height="16.5" />
      <path d="M0.75 6.25H12.25V0.75M12.25 6.25V11.75M17.25 11.75H5.75V17.25M5.75 11.75V6.25" />
    </svg>
  );
}
