export function FrameNodes({ positions = [], className = '' }) {
  if (!positions.length) return null;

  return (
    <>
      {positions.map((pos) => (
        <div key={pos} className={`junction-node ${pos} ${className}`.trim()} aria-hidden="true"></div>
      ))}
    </>
  );
}

export function DividerSlash() {
  return <section className="divider-slash" aria-hidden="true"></section>;
}
