import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { ResumeFormData } from '@/types';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface CertificationsInputProps {
  control: Control<ResumeFormData>;
  setValue: UseFormSetValue<ResumeFormData>;
}

export default function CertificationsInput({ control, setValue }: CertificationsInputProps) {
  const [certInput, setCertInput] = useState('');
  
  const certifications = useWatch({ control, name: 'certifications', defaultValue: [] }) || [];

  const handleAdd = () => {
    if (certInput.trim()) {
      setValue('certifications', [...certifications, certInput.trim()]);
      setCertInput('');
    }
  };

  const handleRemove = (index: number) => {
    setValue('certifications', certifications.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={certInput}
          onChange={(e) => setCertInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="input flex-1"
          placeholder="e.g., AWS Certified Solutions Architect"
        />
        <button type="button" onClick={handleAdd} className="btn-primary" disabled={!certInput.trim()}>
          <Plus size={20} />
        </button>
      </div>
      
      {certifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {certifications.map((cert: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
            >
              {cert}
              <button type="button" onClick={() => handleRemove(index)} className="hover:text-purple-900">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
