import { Control, UseFormRegister, FieldErrors, useFieldArray } from 'react-hook-form';
import { ResumeFormData } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface EducationSectionProps {
  control: Control<ResumeFormData>;
  register: UseFormRegister<ResumeFormData>;
  errors: FieldErrors<ResumeFormData>;
}

export default function EducationSection({ control, register, errors }: EducationSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });

  const addEducation = () => {
    append({
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
    });
  };

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Education {index + 1}</h3>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
            <input
              type="text"
              {...register(`education.${index}.institution`)}
              className="input"
              placeholder="Stanford University"
            />
            {errors.education?.[index]?.institution && (
              <p className="mt-1 text-sm text-red-600">
                {errors.education[index]?.institution?.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
              <input
                type="text"
                {...register(`education.${index}.degree`)}
                className="input"
                placeholder="Bachelor of Science"
              />
              {errors.education?.[index]?.degree && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.education[index]?.degree?.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field of Study *
              </label>
              <input
                type="text"
                {...register(`education.${index}.field`)}
                className="input"
                placeholder="Computer Science"
              />
              {errors.education?.[index]?.field && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.education[index]?.field?.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                {...register(`education.${index}.location`)}
                className="input"
                placeholder="Palo Alto, CA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
              <input
                type="text"
                {...register(`education.${index}.gpa`)}
                className="input"
                placeholder="3.8/4.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="month"
                {...register(`education.${index}.startDate`)}
                className="input"
              />
              {errors.education?.[index]?.startDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.education[index]?.startDate?.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="month"
                {...register(`education.${index}.endDate`)}
                className="input"
                disabled={field.current}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register(`education.${index}.current`)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">I currently study here</label>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEducation}
        className="btn-outline w-full flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Education
      </button>
    </div>
  );
}
