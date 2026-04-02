'use client';

import { Crown } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { HAIR_COLORS, SHIRT_COLORS, PANTS_COLORS, SKIN_COLORS } from '@/lib/constants';
import PixelCharacter from '@/components/office/PixelCharacter';

function ColorPicker({
  label,
  colors,
  selected,
  onChange,
}: {
  label: string;
  colors: string[];
  selected: string;
  onChange: (color: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-7 h-7 rounded-sm border-2 transition-all hover:scale-110 ${
              selected === color
                ? 'border-white scale-110 shadow-lg'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CeoSetup() {
  const { ceoConfig, setCeoConfig } = useOnboardingStore();

  const updateAppearance = (key: string, value: string) => {
    setCeoConfig({
      appearance: { ...ceoConfig.appearance, [key]: value },
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Set Up Your Profile</h2>
        <p className="text-slate-400 mt-2 text-sm">
          You are the CEO. Customize your avatar for the office dashboard.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Preview */}
          <div className="flex flex-col items-center">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 flex flex-col items-center">
              <PixelCharacter appearance={ceoConfig.appearance} size={96} />
              <div className="mt-4 text-center">
                <p className="font-bold text-slate-100">
                  {ceoConfig.name || 'CEO Name'}
                </p>
                <p className="text-xs text-amber-400 mt-0.5">
                  Chief Executive Officer
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 mt-2">Live Preview</p>
          </div>

          {/* Right: Configuration */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                CEO Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={ceoConfig.name}
                onChange={(e) => setCeoConfig({ name: e.target.value })}
                placeholder="Alex Sterling"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <ColorPicker
              label="Hair Color"
              colors={HAIR_COLORS}
              selected={ceoConfig.appearance.hair}
              onChange={(c) => updateAppearance('hair', c)}
            />

            <ColorPicker
              label="Skin Tone"
              colors={SKIN_COLORS}
              selected={ceoConfig.appearance.skin}
              onChange={(c) => updateAppearance('skin', c)}
            />

            <ColorPicker
              label="Shirt Color"
              colors={SHIRT_COLORS}
              selected={ceoConfig.appearance.shirt}
              onChange={(c) => updateAppearance('shirt', c)}
            />

            <ColorPicker
              label="Pants Color"
              colors={PANTS_COLORS}
              selected={ceoConfig.appearance.pants}
              onChange={(c) => updateAppearance('pants', c)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
