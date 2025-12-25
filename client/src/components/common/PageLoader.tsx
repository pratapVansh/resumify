import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  text?: string;
  fullScreen?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  text = 'Loading...', 
  fullScreen = true 
}) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  );
};

export default PageLoader;
