/**
 * Example: Integrating Profile Photo Upload and PDF Download
 * into the Resume Builder
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProfilePhotoUpload from '../components/resume/ProfilePhotoUpload';
import DownloadPDFButton from '../components/resume/DownloadPDFButton';
import { updateResume } from '../services/resumeService';

interface Resume {
  _id: string;
  title: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    profilePhoto?: string;
    profilePhotoPublicId?: string;
    // ... other fields
  };
  // ... other resume fields
}

const ResumeBuilderExample: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Handle profile photo update
  const handlePhotoUpdate = async (url: string, publicId: string) => {
    if (!resume) return;

    setIsSaving(true);
    try {
      const updatedResume = await updateResume(resume._id, {
        personalInfo: {
          ...resume.personalInfo,
          profilePhoto: url,
          profilePhotoPublicId: publicId,
        },
      });

      setResume(updatedResume.data);
      
      // Show success notification
      console.log('Profile photo updated successfully');
    } catch (error) {
      console.error('Failed to update profile photo:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!resume) {
    return <div>Loading...</div>;
  }

  return (
    <div className="resume-builder">
      {/* Header with Actions */}
      <div className="fixed top-0 right-0 p-4 flex gap-4 bg-white shadow-md">
        <button
          onClick={() => {/* Save resume */}}
          disabled={isSaving}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>

        <DownloadPDFButton
          resumeId={resume._id}
          resumeName={`${resume.personalInfo.firstName}_${resume.personalInfo.lastName}_Resume`}
          variant="primary"
          size="md"
          showPreview={true}
        />
      </div>

      {/* Personal Information Section */}
      <section className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Photo Upload */}
          <div className="col-span-full flex justify-center">
            <ProfilePhotoUpload
              currentPhotoUrl={resume.personalInfo.profilePhoto}
              currentPhotoPublicId={resume.personalInfo.profilePhotoPublicId}
              onPhotoUpdate={handlePhotoUpdate}
              className="mb-6"
            />
          </div>

          {/* Name Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={resume.personalInfo.firstName}
              onChange={(e) => {/* Update first name */}}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={resume.personalInfo.lastName}
              onChange={(e) => {/* Update last name */}}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Other personal info fields... */}
        </div>
      </section>

      {/* Other Resume Sections */}
      {/* Experience, Education, Projects, Skills, etc. */}

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => {/* Go back */}}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => {/* Save as draft */}}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Save as Draft
            </button>

            <DownloadPDFButton
              resumeId={resume._id}
              resumeName={`${resume.personalInfo.firstName}_${resume.personalInfo.lastName}_Resume`}
              variant="outline"
              size="lg"
              showPreview={true}
            />

            <button
              onClick={() => {/* Publish */}}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderExample;

/**
 * USAGE NOTES:
 * 
 * 1. Profile Photo Upload:
 *    - Place in Personal Information section
 *    - Handles upload, preview, and deletion automatically
 *    - Calls onPhotoUpdate when photo changes
 *    - Update resume model with new URL and publicId
 * 
 * 2. Download PDF Button:
 *    - Can be placed anywhere (header, footer, actions panel)
 *    - Multiple instances allowed (different variants/sizes)
 *    - Handles download and preview automatically
 *    - No additional configuration needed
 * 
 * 3. Integration Steps:
 *    a. Import components
 *    b. Add to your resume form/builder
 *    c. Handle photo update callback
 *    d. No changes needed for PDF download
 * 
 * 4. Styling:
 *    - Components use Tailwind CSS
 *    - Fully customizable with className prop
 *    - Responsive by default
 * 
 * 5. Error Handling:
 *    - Components show inline errors
 *    - Optionally add toast notifications
 *    - Check console for detailed errors
 */
