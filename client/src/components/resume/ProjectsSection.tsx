import { Control, UseFormRegister, UseFormSetValue, FieldErrors, useFieldArray, useWatch } from 'react-hook-form';
import { ResumeFormData } from '@/types';
import { Plus, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import AIEnhanceButton from '@/components/common/AIEnhanceButton';
import { improveProjectDescription } from '@/services/aiService';

interface ProjectsSectionProps {
  control: Control<ResumeFormData>;
  register: UseFormRegister<ResumeFormData>;
  setValue: UseFormSetValue<ResumeFormData>;
  errors: FieldErrors<ResumeFormData>;
}

export default function ProjectsSection({ control, register, setValue, errors }: ProjectsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projects',
  });

  const addProject = () => {
    append({
      name: '',
      description: '',
      technologies: [],
      startDate: undefined,
      endDate: undefined,
      url: '',
      github: '',
      highlights: [],
    });
  };

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <ProjectItem
          key={field.id}
          index={index}
          register={register}
          control={control}
          setValue={setValue}
          errors={errors}
          onRemove={() => remove(index)}
        />
      ))}

      <button
        type="button"
        onClick={addProject}
        className="btn-outline w-full flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Project
      </button>
    </div>
  );
}

interface ProjectItemProps {
  index: number;
  register: UseFormRegister<ResumeFormData>;
  control: Control<ResumeFormData>;
  setValue: UseFormSetValue<ResumeFormData>;
  errors: FieldErrors<ResumeFormData>;
  onRemove: () => void;
}

function ProjectItem({ index, register, control, setValue, errors, onRemove }: ProjectItemProps) {
  // Local state for the input field only (not the actual array)
  const [techInput, setTechInput] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Watch the current technologies array from react-hook-form
  const technologies = useWatch({
    control,
    name: `projects.${index}.technologies`,
    defaultValue: [],
  }) || [];

  // Watch project name and description for AI enhancement
  const projectName = useWatch({
    control,
    name: `projects.${index}.name`,
    defaultValue: '',
  });

  const projectDescription = useWatch({
    control,
    name: `projects.${index}.description`,
    defaultValue: '',
  });

  // Initialize technologies array if it doesn't exist
  useEffect(() => {
    if (!technologies || technologies.length === 0) {
      setValue(`projects.${index}.technologies`, []);
    }
  }, []);

  // Add a technology to the array and sync with react-hook-form
  const addTechnology = () => {
    if (techInput.trim()) {
      const newTechnologies = [...technologies, techInput.trim()];
      setValue(`projects.${index}.technologies`, newTechnologies);
      setTechInput('');
    }
  };

  // Remove a technology from the array and sync with react-hook-form
  const removeTechnology = (techIndex: number) => {
    const newTechnologies = technologies.filter((_, i) => i !== techIndex);
    setValue(`projects.${index}.technologies`, newTechnologies);
  };

  const handleEnhanceDescription = async () => {
    setIsEnhancing(true);
    try {
      const name = projectName?.trim() || '';
      const description = projectDescription?.trim() || '';
      
      if (!name || !description || technologies.length === 0) {
        alert('Please fill in project name, description, and at least one technology before enhancing.');
        setIsEnhancing(false);
        return;
      }

      if (description.length < 10) {
        alert('Please write at least 10 characters in the description before enhancing.');
        setIsEnhancing(false);
        return;
      }

      console.log('Sending to AI:', { name, description, technologies });
      
      const enhancedDescription = await improveProjectDescription(
        String(name),
        String(description),
        technologies
      );

      setValue(`projects.${index}.description`, enhancedDescription);
    } catch (error: any) {
      console.error('AI Enhancement Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to enhance description with AI';
      alert(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project {index + 1}</h3>
        <button type="button" onClick={onRemove} className="text-red-600 hover:text-red-700">
          <Trash2 size={18} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
        <input
          type="text"
          {...register(`projects.${index}.name`)}
          className="input"
          placeholder="My Awesome Project"
        />
        {errors.projects?.[index]?.name && (
          <p className="mt-1 text-sm text-red-600">{errors.projects[index]?.name?.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Description *</label>
          <AIEnhanceButton
            onEnhance={handleEnhanceDescription}
            label="Enhance"
            disabled={isEnhancing}
          />
        </div>
        <textarea
          {...register(`projects.${index}.description`)}
          rows={3}
          className="textarea"
          placeholder="Describe what the project does..."
        />
        {errors.projects?.[index]?.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.projects[index]?.description?.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Technologies *
        </label>
        {/* Controlled input - NOT registered with react-hook-form */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTechnology();
              }
            }}
            className="input flex-1"
            placeholder="Add a technology (e.g., React, TypeScript)"
          />
          <button
            type="button"
            onClick={addTechnology}
            className="btn-primary"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {/* Display technologies as tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {technologies.map((tech, techIndex) => (
            <span
              key={techIndex}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tech}
              <button
                type="button"
                onClick={() => removeTechnology(techIndex)}
                className="hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        
        {/* Show validation error if exists */}
        {errors.projects?.[index]?.technologies && (
          <p className="mt-1 text-sm text-red-600">
            {errors.projects[index]?.technologies?.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            {...register(`projects.${index}.startDate`)}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            {...register(`projects.${index}.endDate`)}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
          <input
            type="url"
            {...register(`projects.${index}.url`)}
            className="input"
            placeholder="https://project.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
          <input
            type="url"
            {...register(`projects.${index}.github`)}
            className="input"
            placeholder="https://github.com/user/project"
          />
        </div>
      </div>
    </div>
  );
}
