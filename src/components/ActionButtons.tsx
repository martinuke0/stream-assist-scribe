
import React from 'react';
import { Button } from '@/components/ui/button';
import { ActionType } from '@/lib/api';

interface ActionButtonsProps {
  onActionClick: (action: ActionType) => void;
  isLoading: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onActionClick, isLoading }) => {
  const actions: { label: string; value: ActionType; color: string }[] = [
    { label: 'Explain', value: 'explain', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Correct', value: 'correct', color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Translate', value: 'translate', color: 'bg-purple-500 hover:bg-purple-600' },
    { label: 'Summarize', value: 'summarize', color: 'bg-amber-500 hover:bg-amber-600' },
    { label: 'Rewrite', value: 'rewrite', color: 'bg-indigo-500 hover:bg-indigo-600' },
    { label: 'Shorten', value: 'shorten', color: 'bg-rose-500 hover:bg-rose-600' },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
      {actions.map((action) => (
        <Button
          key={action.value}
          onClick={() => onActionClick(action.value)}
          disabled={isLoading}
          className={`${action.color} text-white`}
          variant="default"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default ActionButtons;
