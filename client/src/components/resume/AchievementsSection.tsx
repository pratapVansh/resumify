import { Control, UseFormRegister, UseFormSetValue, FieldErrors, useWatch } from 'react-hook-form';
import { ResumeFormData } from '@/types';
import { Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AchievementsSectionProps {
  control: Control<ResumeFormData>;
  register: UseFormRegister<ResumeFormData>;
  setValue: UseFormSetValue<ResumeFormData>;
  errors: FieldErrors<ResumeFormData>;
}

export default function AchievementsSection({ 
  control, 
  setValue 
}: AchievementsSectionProps) {
  const [achievementInput, setAchievementInput] = useState('');

  const achievements = useWatch({
    control,
    name: 'achievements',
    defaultValue: [],
  }) || [];

  useEffect(() => {
    if (!achievements || achievements.length === 0) {
      setValue('achievements', []);
    }
  }, []);

  const addAchievement = () => {
    if (achievementInput.trim()) {
      const newAchievements = [...achievements, achievementInput.trim()];
      setValue('achievements', newAchievements);
      setAchievementInput('');
    }
  };

  const removeAchievement = (index: number) => {
    const newAchievements = achievements.filter((_, i) => i !== index);
    setValue('achievements', newAchievements);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addAchievement();
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Achievements</h3>
        <p className="text-sm text-gray-600">List your notable accomplishments and awards</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Achievement
        </label>
        <div className="space-y-3">
          <textarea
            value={achievementInput}
            onChange={(e) => setAchievementInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="textarea"
            placeholder="e.g., Won 1st place in National Hackathon 2024"
          />
          <button
            type="button"
            onClick={addAchievement}
            className="btn-outline flex items-center gap-2"
            disabled={!achievementInput.trim()}
          >
            <Plus size={20} />
            Add Achievement
          </button>
        </div>
      </div>

      {achievements.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Your Achievements</h4>
          <ul className="space-y-2">
            {achievements.map((achievement: string, index: number) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="flex-1 text-sm text-gray-900">{achievement}</span>
                <button
                  type="button"
                  onClick={() => removeAchievement(index)}
                  className="text-red-600 hover:text-red-700 flex-shrink-0"
                  aria-label={`Remove achievement: ${achievement}`}
                >
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
