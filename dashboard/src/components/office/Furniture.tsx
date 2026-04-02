'use client';

interface FurnitureBaseProps {
  x: number;
  y: number;
  className?: string;
}

export function Desk({ x, y }: FurnitureBaseProps) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
    >
      {/* Desktop surface */}
      <div className="w-16 h-10 bg-amber-900 border-2 border-amber-800 rounded-sm relative">
        {/* Monitor */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="w-8 h-5 bg-slate-700 border border-slate-600 rounded-t-sm">
            <div className="w-6 h-3 bg-blue-900/50 mx-auto mt-0.5 rounded-sm" />
          </div>
          <div className="w-3 h-1 bg-slate-600 mx-auto" />
          <div className="w-5 h-0.5 bg-slate-600 mx-auto" />
        </div>
        {/* Keyboard */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-7 h-2 bg-slate-600 rounded-sm" />
      </div>
      {/* Legs */}
      <div className="flex justify-between px-1 -mt-px">
        <div className="w-1.5 h-3 bg-amber-800" />
        <div className="w-1.5 h-3 bg-amber-800" />
      </div>
    </div>
  );
}

export function Couch({ x, y }: FurnitureBaseProps) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
    >
      <div className="w-12 h-8 bg-indigo-900 border-2 border-indigo-800 rounded-sm relative">
        {/* Back cushion */}
        <div className="absolute -top-2 left-0 w-12 h-3 bg-indigo-800 border border-indigo-700 rounded-t-sm" />
        {/* Seat cushions */}
        <div className="absolute top-1 left-0.5 w-5 h-5 bg-indigo-800/80 rounded-sm" />
        <div className="absolute top-1 right-0.5 w-5 h-5 bg-indigo-800/80 rounded-sm" />
        {/* Arms */}
        <div className="absolute top-0 -left-1 w-1.5 h-6 bg-indigo-800 rounded-l-sm" />
        <div className="absolute top-0 -right-1 w-1.5 h-6 bg-indigo-800 rounded-r-sm" />
      </div>
    </div>
  );
}

export function CoffeeMachine({ x, y }: FurnitureBaseProps) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
    >
      <div className="w-8 h-8 relative">
        {/* Counter */}
        <div className="absolute bottom-0 w-8 h-3 bg-stone-700 border border-stone-600 rounded-sm" />
        {/* Machine body */}
        <div className="absolute bottom-3 left-1 w-6 h-5 bg-slate-600 border border-slate-500 rounded-t-sm">
          {/* Display */}
          <div className="w-4 h-1.5 bg-emerald-900 mx-auto mt-0.5 rounded-sm" />
          {/* Buttons */}
          <div className="flex gap-0.5 justify-center mt-0.5">
            <div className="w-1 h-1 bg-red-500 rounded-full" />
            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
          </div>
        </div>
        {/* Cup */}
        <div className="absolute bottom-3 left-2.5 w-3 h-2 bg-white/90 rounded-b-sm" />
        {/* Steam */}
        <div className="absolute -top-2 left-3 text-[8px] text-slate-500 opacity-50">
          ~
        </div>
      </div>
    </div>
  );
}

export function Whiteboard({ x, y }: FurnitureBaseProps) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
    >
      <div className="w-12 h-2 bg-slate-300 border border-slate-200 rounded-sm relative">
        {/* Board content lines */}
        <div className="absolute top-0.5 left-1 w-3 h-px bg-blue-400/40" />
        <div className="absolute top-0.5 left-5 w-2 h-px bg-red-400/40" />
        {/* Frame */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-400" />
      </div>
    </div>
  );
}

export function Plant({ x, y }: FurnitureBaseProps) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
    >
      <div className="w-6 h-6 relative">
        {/* Pot */}
        <div className="absolute bottom-0 left-0.5 w-5 h-2.5 bg-orange-800 rounded-b-sm">
          <div className="w-5 h-1 bg-orange-700 rounded-t-sm" />
        </div>
        {/* Leaves */}
        <div className="absolute bottom-2 left-1 w-4 h-3 bg-emerald-600 rounded-full" />
        <div className="absolute bottom-3 left-0 w-3 h-2 bg-emerald-700 rounded-full" />
        <div className="absolute bottom-3 right-0 w-3 h-2 bg-emerald-500 rounded-full" />
      </div>
    </div>
  );
}

export function Bookshelf({ x, y }: FurnitureBaseProps) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y }}
    >
      <div className="w-10 h-4 bg-amber-900 border border-amber-800 rounded-sm relative overflow-hidden">
        {/* Shelf divider */}
        <div className="absolute top-1.5 w-full h-px bg-amber-800" />
        {/* Books top row */}
        <div className="absolute top-0.5 left-0.5 flex gap-px">
          <div className="w-1 h-1 bg-red-700" />
          <div className="w-1 h-1 bg-blue-700" />
          <div className="w-1 h-1 bg-emerald-700" />
          <div className="w-1.5 h-1 bg-purple-700" />
          <div className="w-1 h-1 bg-amber-600" />
        </div>
        {/* Books bottom row */}
        <div className="absolute top-2 left-0.5 flex gap-px">
          <div className="w-1.5 h-1.5 bg-indigo-700" />
          <div className="w-1 h-1.5 bg-rose-700" />
          <div className="w-1 h-1.5 bg-teal-700" />
          <div className="w-1 h-1.5 bg-orange-700" />
        </div>
      </div>
    </div>
  );
}
