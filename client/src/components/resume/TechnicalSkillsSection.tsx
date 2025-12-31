import { Control, UseFormRegister, UseFormSetValue, FieldErrors, useFieldArray, useWatch } from 'react-hook-form';
import { ResumeFormData } from '@/types';
import { Plus, Trash2, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface TechnicalSkillsSectionProps {
  control: Control<ResumeFormData>;
  register: UseFormRegister<ResumeFormData>;
  setValue: UseFormSetValue<ResumeFormData>;
  errors: FieldErrors<ResumeFormData>;
}

const defaultCategories = [
  'Languages',
  'Frontend Development',
  'Backend Development',
  'Database Management',
  'Libraries & ML Tools',
  'Developer Tools'
];

export default function TechnicalSkillsSection({ 
  control, 
  register, 
  setValue, 
  errors 
}: TechnicalSkillsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'technicalSkills',
  });

  const initializedRef = useRef(false);

  const addCategory = (categoryName: string = '') => {
    append({
      category: categoryName,
      items: [],
    });
  };

  // Initialize with default categories if none exist
  useEffect(() => {
    if (fields.length === 0 && !initializedRef.current) {
      initializedRef.current = true;
      defaultCategories.forEach(cat => addCategory(cat));
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Technical Skills</h3>
          <p className="text-sm text-gray-600">Organize your skills by category</p>
        </div>
      </div>

      {fields.map((field, index) => (
        <TechnicalSkillCategory
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
        onClick={() => addCategory()}
        className="btn-outline w-full flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Category
      </button>
    </div>
  );
}

interface TechnicalSkillCategoryProps {
  index: number;
  register: UseFormRegister<ResumeFormData>;
  control: Control<ResumeFormData>;
  setValue: UseFormSetValue<ResumeFormData>;
  errors: FieldErrors<ResumeFormData>;
  onRemove: () => void;
}

function TechnicalSkillCategory({ 
  index, 
  register, 
  control, 
  setValue, 
  errors, 
  onRemove 
}: TechnicalSkillCategoryProps) {
  const [itemInput, setItemInput] = useState('');

  const items = useWatch({
    control,
    name: `technicalSkills.${index}.items`,
    defaultValue: [],
  }) || [];

  useEffect(() => {
    if (!items || items.length === 0) {
      setValue(`technicalSkills.${index}.items`, []);
    }
  }, []);

  const addItem = () => {
    if (itemInput.trim()) {
      const newItems = [...items, itemInput.trim()];
      setValue(`technicalSkills.${index}.items`, newItems);
      setItemInput('');
    }
  };

  const removeItem = (itemIndex: number) => {
    const newItems = items.filter((_, i) => i !== itemIndex);
    setValue(`technicalSkills.${index}.items`, newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="text"
          {...register(`technicalSkills.${index}.category`)}
          className="input flex-1 mr-3"
          placeholder="Category name (e.g., Languages)"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700"
          aria-label="Remove category"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {errors.technicalSkills?.[index]?.category && (
        <p className="text-sm text-red-600">
          {errors.technicalSkills[index]?.category?.message}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={itemInput}
            onChange={(e) => setItemInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input flex-1"
            placeholder="Add an item (press Enter)"
          />
          <button
            type="button"
            onClick={addItem}
            className="btn-outline"
          >
            Add
          </button>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item: string, itemIndex: number) => (
              <span
                key={itemIndex}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeItem(itemIndex)}
                  className="hover:text-blue-900"
                  aria-label={`Remove ${item}`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {errors.technicalSkills?.[index]?.items && (
          <p className="mt-1 text-sm text-red-600">
            {errors.technicalSkills[index]?.items?.message}
          </p>
        )}
      </div>
    </div>
  );
}
