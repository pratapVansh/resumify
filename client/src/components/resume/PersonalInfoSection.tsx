import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ResumeFormData } from '@/types';

interface PersonalInfoSectionProps {
  register: UseFormRegister<ResumeFormData>;
  errors: FieldErrors<ResumeFormData>;
}

export default function PersonalInfoSection({ register, errors }: PersonalInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            {...register('personalInfo.firstName')}
            className="input"
            placeholder="John"
          />
          {errors.personalInfo?.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.personalInfo.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            type="text"
            {...register('personalInfo.lastName')}
            className="input"
            placeholder="Doe"
          />
          {errors.personalInfo?.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.personalInfo.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          type="email"
          {...register('personalInfo.email')}
          className="input"
          placeholder="john.doe@example.com"
        />
        {errors.personalInfo?.email && (
          <p className="mt-1 text-sm text-red-600">{errors.personalInfo.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            {...register('personalInfo.phone')}
            className="input"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            {...register('personalInfo.location')}
            className="input"
            placeholder="New York, NY"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
        <input
          type="url"
          {...register('personalInfo.website')}
          className="input"
          placeholder="https://yourwebsite.com"
        />
        {errors.personalInfo?.website && (
          <p className="mt-1 text-sm text-red-600">{errors.personalInfo.website.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
        <input
          type="url"
          {...register('personalInfo.linkedin')}
          className="input"
          placeholder="https://linkedin.com/in/yourprofile"
        />
        {errors.personalInfo?.linkedin && (
          <p className="mt-1 text-sm text-red-600">{errors.personalInfo.linkedin.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
        <input
          type="url"
          {...register('personalInfo.github')}
          className="input"
          placeholder="https://github.com/yourusername"
        />
        {errors.personalInfo?.github && (
          <p className="mt-1 text-sm text-red-600">{errors.personalInfo.github.message}</p>
        )}
      </div>
    </div>
  );
}
