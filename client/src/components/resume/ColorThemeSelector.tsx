import { colorThemes } from '@/config/colorThemes';

interface ColorThemeSelectorProps {
  value: string;
  onChange: (colorThemeId: string) => void;
}

export default function ColorThemeSelector({ value, onChange }: ColorThemeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="color-theme-select" className="text-sm font-medium text-gray-700">
        Select Color Theme
      </label>
      <select
        id="color-theme-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm hover:border-gray-400 transition-colors"
      >
        {colorThemes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
      {/* Color Preview */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-500">Preview:</span>
        {colorThemes.find(t => t.id === value) && (
          <div className="flex gap-1">
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: colorThemes.find(t => t.id === value)?.primary }}
              title="Primary"
            />
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: colorThemes.find(t => t.id === value)?.secondary }}
              title="Secondary"
            />
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: colorThemes.find(t => t.id === value)?.accent }}
              title="Accent"
            />
          </div>
        )}
      </div>
    </div>
  );
}
