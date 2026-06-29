export function FrameNodes({ className = '' }) {
  return (
    <>
      <div className={`junction-node top-left ${className}`}></div>
      <div className={`junction-node top-right ${className}`}></div>
      <div className={`junction-node bottom-left ${className}`}></div>
      <div className={`junction-node bottom-right ${className}`}></div>
    </>
  );
}

export function DividerSlash() {
  return (
    <section className="divider-slash" aria-hidden="true">
      <div className="divider-slash-pattern"></div>
    </section>
  );
}
