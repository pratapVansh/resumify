import { Control, UseFormRegister, FieldErrors, useFieldArray } from 'react-hook-form';
import { ResumeFormData } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface CourseworkSectionProps {
  control: Control<ResumeFormData>;
  register: UseFormRegister<ResumeFormData>;
  errors: FieldErrors<ResumeFormData>;
}

export default function CourseworkSection({
  control,
  register,
  errors,
}: CourseworkSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'coursework',
  });

  const addCoursework = () => {
    append({
      name: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Relevant Coursework</h3>
          <p className="text-sm text-gray-600">Add courses relevant to your field</p>
        </div>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-3">
          <div className="flex-1">
            <input
              type="text"
              {...register(`coursework.${index}.name`)}
              className="input"
              placeholder="e.g., Data Structures and Algorithms"
            />
            {errors.coursework?.[index]?.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.coursework[index]?.name?.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-600 hover:text-red-700 mt-2"
            aria-label="Remove coursework"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addCoursework}
        className="btn-outline w-full flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Coursework
      </button>
    </div>
  );
}
