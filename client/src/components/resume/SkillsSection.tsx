import { Control, UseFormRegister, UseFormSetValue, useWatch } from 'react-hook-form';
import { ResumeFormData } from '@/types';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface SkillsSectionProps {
  control: Control<ResumeFormData>;
  register: UseFormRegister<ResumeFormData>;
  setValue: UseFormSetValue<ResumeFormData>;
}

export default function SkillsSection({ control, setValue }: SkillsSectionProps) {
  const [skillInput, setSkillInput] = useState('');
  const [langInput, setLangInput] = useState('');
  const [certInput, setCertInput] = useState('');
  
  const skills = useWatch({ control, name: 'skills', defaultValue: [] });
  const languages = useWatch({ control, name: 'languages', defaultValue: [] });
  const certifications = useWatch({ control, name: 'certifications', defaultValue: [] });

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setValue('skills', [...(skills || []), skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setValue('skills', skills?.filter((_, i) => i !== index) || []);
  };

  const handleAddLanguage = () => {
    if (langInput.trim()) {
      setValue('languages', [...(languages || []), langInput.trim()]);
      setLangInput('');
    }
  };

  const handleRemoveLanguage = (index: number) => {
    setValue('languages', languages?.filter((_, i) => i !== index) || []);
  };

  const handleAddCertification = () => {
    if (certInput.trim()) {
      setValue('certifications', [...(certifications || []), certInput.trim()]);
      setCertInput('');
    }
  };

  const handleRemoveCertification = (index: number) => {
    setValue('certifications', certifications?.filter((_, i) => i !== index) || []);
  };

  return (
    <div className="space-y-6">
      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            className="input flex-1"
            placeholder="Add a skill (e.g., JavaScript, Python)"
          />
          <button type="button" onClick={handleAddSkill} className="btn-primary">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills?.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
            >
              {skill}
              <button type="button" onClick={() => handleRemoveSkill(index)} className="hover:text-primary-900">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={langInput}
            onChange={(e) => setLangInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
            className="input flex-1"
            placeholder="Add a language (e.g., English - Native)"
          />
          <button type="button" onClick={handleAddLanguage} className="btn-primary">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages?.map((language, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {language}
              <button type="button" onClick={() => handleRemoveLanguage(index)} className="hover:text-green-900">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertification())}
            className="input flex-1"
            placeholder="Add a certification (e.g., AWS Certified Solutions Architect)"
          />
          <button type="button" onClick={handleAddCertification} className="btn-primary">
            <Plus size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {certifications?.map((cert, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
            >
              {cert}
              <button type="button" onClick={() => handleRemoveCertification(index)} className="hover:text-purple-900">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
