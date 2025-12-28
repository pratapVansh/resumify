export interface TemplateStyle {
  id: string;
  name: string;
  description: string;
  headerStyle: string;
  sectionStyle: string;
  layoutStyle: string;
  fontFamily: string;
  accentStyle: string;
}

export const resumeTemplates: TemplateStyle[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional resume format with clear sections',
    headerStyle: 'border-b-2',
    sectionStyle: 'border-b',
    layoutStyle: 'space-y-6',
    fontFamily: 'serif',
    accentStyle: 'bg-gray-100',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with bold headers',
    headerStyle: 'bg-gradient-to-r from-primary to-secondary text-white',
    sectionStyle: 'border-l-4 pl-4',
    layoutStyle: 'space-y-5',
    fontFamily: 'sans-serif',
    accentStyle: 'bg-primary/10',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple layout',
    headerStyle: 'border-b',
    sectionStyle: 'pt-4',
    layoutStyle: 'space-y-4',
    fontFamily: 'sans-serif',
    accentStyle: 'bg-transparent',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate-friendly design',
    headerStyle: 'bg-primary text-white',
    sectionStyle: 'border-t pt-4',
    layoutStyle: 'space-y-5',
    fontFamily: 'sans-serif',
    accentStyle: 'bg-gray-50',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Unique layout for creative fields',
    headerStyle: 'border-l-8 pl-4',
    sectionStyle: 'bg-gray-50 p-4 rounded',
    layoutStyle: 'space-y-6',
    fontFamily: 'sans-serif',
    accentStyle: 'bg-primary/5',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Sophisticated design for senior positions',
    headerStyle: 'border-b-4 pb-4',
    sectionStyle: 'pt-5',
    layoutStyle: 'space-y-6',
    fontFamily: 'serif',
    accentStyle: 'bg-gray-100',
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Space-efficient layout',
    headerStyle: 'border-b pb-2',
    sectionStyle: 'pt-3',
    layoutStyle: 'space-y-3',
    fontFamily: 'sans-serif',
    accentStyle: 'bg-transparent',
  },
];

export const getTemplateById = (id: string): TemplateStyle => {
  const template = resumeTemplates.find((t) => t.id === id);
  return template || resumeTemplates[1]; // Default to 'modern'
};
