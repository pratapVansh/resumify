import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIEnhanceButtonProps {
  onEnhance: () => Promise<void>;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export default function AIEnhanceButton({
  onEnhance,
  label = 'Enhance with AI',
  className = '',
  disabled = false,
}: AIEnhanceButtonProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      await onEnhance();
    } catch (error) {
      console.error('AI enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleEnhance}
      disabled={disabled || isEnhancing}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      title={label}
    >
      {isEnhancing ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Enhancing...</span>
        </>
      ) : (
        <>
          <Sparkles size={16} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
