'use client';

interface WallProps {
  x: number;
  y: number;
  width: number;
  height: number;
  className?: string;
}

export function Wall({ x, y, width, height }: WallProps) {
  return (
    <div
      className="absolute bg-slate-700 border border-slate-600"
      style={{ left: x, top: y, width, height }}
    >
      {/* Wall texture lines */}
      {height > 8 && (
        <>
          <div
            className="absolute bg-slate-600/30"
            style={{ top: '33%', left: 0, right: 0, height: 1 }}
          />
          <div
            className="absolute bg-slate-600/30"
            style={{ top: '66%', left: 0, right: 0, height: 1 }}
          />
        </>
      )}
    </div>
  );
}

export function Door({ x, y, width = 32, height = 44 }: WallProps) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y, width, height }}
    >
      {/* Door frame */}
      <div className="w-full h-full bg-amber-800 border-2 border-amber-700 rounded-t-sm relative">
        {/* Door panel top */}
        <div className="absolute top-1 left-1 right-1 h-[40%] bg-amber-700 rounded-sm" />
        {/* Door panel bottom */}
        <div className="absolute bottom-1 left-1 right-1 h-[40%] bg-amber-700 rounded-sm" />
        {/* Handle */}
        <div className="absolute top-1/2 right-1.5 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-600 rounded-full" />
      </div>
    </div>
  );
}

export function Window({ x, y, width = 40, height = 24 }: WallProps) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y, width, height }}
    >
      {/* Window frame */}
      <div className="w-full h-full bg-slate-600 border-2 border-slate-500 relative overflow-hidden">
        {/* Glass panes */}
        <div className="absolute inset-1 bg-sky-900/40">
          {/* Divider */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-500" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-500" />
          {/* Sky reflection */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-sky-800/20" />
        </div>
        {/* Sill */}
        <div className="absolute -bottom-1 -left-0.5 -right-0.5 h-1.5 bg-slate-500 rounded-sm" />
      </div>
    </div>
  );
}
