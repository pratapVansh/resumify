export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export const colorThemes: ColorTheme[] = [
  {
    id: 'blue',
    name: 'Professional Blue',
    primary: '#2563eb',
    secondary: '#dbeafe',
    accent: '#1e40af',
    text: '#1e293b',
    background: '#ffffff',
  },
  {
    id: 'green',
    name: 'Fresh Green',
    primary: '#059669',
    secondary: '#d1fae5',
    accent: '#047857',
    text: '#1e293b',
    background: '#ffffff',
  },
  {
    id: 'red',
    name: 'Bold Red',
    primary: '#dc2626',
    secondary: '#fee2e2',
    accent: '#b91c1c',
    text: '#1e293b',
    background: '#ffffff',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    primary: '#7c3aed',
    secondary: '#ede9fe',
    accent: '#6d28d9',
    text: '#1e293b',
    background: '#ffffff',
  },
  {
    id: 'orange',
    name: 'Vibrant Orange',
    primary: '#ea580c',
    secondary: '#ffedd5',
    accent: '#c2410c',
    text: '#1e293b',
    background: '#ffffff',
  },
  {
    id: 'teal',
    name: 'Modern Teal',
    primary: '#0d9488',
    secondary: '#ccfbf1',
    accent: '#0f766e',
    text: '#1e293b',
    background: '#ffffff',
  },
  {
    id: 'gray',
    name: 'Elegant Gray',
    primary: '#475569',
    secondary: '#f1f5f9',
    accent: '#334155',
    text: '#1e293b',
    background: '#ffffff',
  },
  {
    id: 'black',
    name: 'Classic Black',
    primary: '#171717',
    secondary: '#f5f5f5',
    accent: '#0a0a0a',
    text: '#1e293b',
    background: '#ffffff',
  },
  {
    id: 'maroon',
    name: 'Deep Maroon',
    primary: '#881337',
    secondary: '#fce7f3',
    accent: '#701a32',
    text: '#1e293b',
    background: '#ffffff',
  },
];

export const getColorThemeById = (id: string): ColorTheme => {
  return colorThemes.find(t => t.id === id) || colorThemes[0];
};
