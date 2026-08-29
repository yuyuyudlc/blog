export function TatamiMark({ className = '' }) {
  return (
    <span className={`tatami-mark ${className}`.trim()} aria-hidden="true">
      <span className="tatami-mark-line tatami-mark-line-top"></span>
      <span className="tatami-mark-line tatami-mark-line-right"></span>
      <span className="tatami-mark-line tatami-mark-line-middle"></span>
      <span className="tatami-mark-line tatami-mark-line-left"></span>
    </span>
  );
}

function TatamiJunction({ className }) {
  return <span className={`tatami-plan-junction ${className}`}></span>;
}

function GridExtension({ className }) {
  return (
    <span className={`offset-grid-extension ${className}`}>
      <span className="offset-grid-extension-line offset-grid-extension-line-1"></span>
      <span className="offset-grid-extension-line offset-grid-extension-line-2"></span>
      <span className="offset-grid-extension-line offset-grid-extension-line-3"></span>
    </span>
  );
}

export function TatamiPlan({ className = '', variant = 'balanced' }) {
  return (
    <div className={`tatami-plan tatami-plan-${variant} ${className}`.trim()} aria-hidden="true">
      <span className="tatami-panel tatami-panel-one"></span>
      <span className="tatami-panel tatami-panel-two"></span>
      <span className="tatami-panel tatami-panel-three"></span>
      <span className="tatami-panel tatami-panel-four"></span>
      <span className="tatami-panel tatami-panel-half"></span>
      <span className="tatami-construction-line tatami-construction-line-one"></span>
      <span className="tatami-construction-line tatami-construction-line-two"></span>
      <span className="tatami-construction-line tatami-construction-line-three"></span>
      <span className="tatami-construction-line tatami-construction-line-four"></span>
      <TatamiJunction className="tatami-plan-junction-top-left" />
      <TatamiJunction className="tatami-plan-junction-top-right" />
      <TatamiJunction className="tatami-plan-junction-bottom-left" />
      <TatamiJunction className="tatami-plan-junction-bottom-right" />
    </div>
  );
}

export function OffsetSquareGrid({ className = '' }) {
  return (
    <div className={`offset-square-grid ${className}`.trim()} aria-hidden="true">
      <span className="offset-square-grid-layer offset-square-grid-layer-1"></span>
      <span className="offset-square-grid-layer offset-square-grid-layer-2"></span>
      <span className="offset-square-grid-layer offset-square-grid-layer-3"></span>
      <span className="offset-square-grid-layer offset-square-grid-layer-4"></span>
      <span className="offset-square-grid-layer offset-square-grid-layer-5"></span>
      <span className="offset-square-grid-layer offset-square-grid-layer-6"></span>
      <span className="offset-square-grid-layer offset-square-grid-layer-7"></span>
      <span className="offset-square-grid-layer offset-square-grid-layer-8"></span>
      <span className="offset-square-grid-layer offset-square-grid-layer-9"></span>
      <span className="offset-square-grid-layer offset-square-grid-layer-10"></span>
      <GridExtension className="offset-grid-extension-top" />
      <GridExtension className="offset-grid-extension-right" />
      <GridExtension className="offset-grid-extension-bottom" />
      <GridExtension className="offset-grid-extension-left" />
    </div>
  );
}
