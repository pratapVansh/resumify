import { Control, UseFormRegister, FieldErrors, useFieldArray } from 'react-hook-form';
import { ResumeFormData } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface ExperienceSectionProps {
  control: Control<ResumeFormData>;
  register: UseFormRegister<ResumeFormData>;
  errors: FieldErrors<ResumeFormData>;
}

export default function ExperienceSection({
  control,
  register,
  errors,
}: ExperienceSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  });

  const addExperience = () => {
    append({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: [],
    });
  };

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Experience {index + 1}</h3>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input
                type="text"
                {...register(`experience.${index}.company`)}
                className="input"
                placeholder="Google"
              />
              {errors.experience?.[index]?.company && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.experience[index]?.company?.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <input
                type="text"
                {...register(`experience.${index}.position`)}
                className="input"
                placeholder="Software Engineer"
              />
              {errors.experience?.[index]?.position && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.experience[index]?.position?.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              {...register(`experience.${index}.location`)}
              className="input"
              placeholder="San Francisco, CA"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="month"
                {...register(`experience.${index}.startDate`)}
                className="input"
              />
              {errors.experience?.[index]?.startDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.experience[index]?.startDate?.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="month"
                {...register(`experience.${index}.endDate`)}
                className="input"
                disabled={field.current}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register(`experience.${index}.current`)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">I currently work here</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register(`experience.${index}.description`)}
              rows={4}
              className="textarea"
              placeholder="Describe your responsibilities and achievements..."
            />
            {errors.experience?.[index]?.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.experience[index]?.description?.message}
              </p>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addExperience}
        className="btn-outline w-full flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Experience
      </button>
    </div>
  );
}
