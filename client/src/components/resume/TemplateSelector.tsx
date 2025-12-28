import { resumeTemplates } from '@/config/resumeTemplates';

interface TemplateSelectorProps {
  value: string;
  onChange: (templateId: string) => void;
}

export default function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="template-select" className="text-sm font-medium text-gray-700">
        Select Resume Template
      </label>
      <select
        id="template-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm hover:border-gray-400 transition-colors"
      >
        {resumeTemplates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name} - {template.description}
          </option>
        ))}
      </select>
    </div>
  );
}
