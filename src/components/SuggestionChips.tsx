'use client';

import React from 'react';

interface SuggestionChipsProps {
  chips: string[];
  onSelectChip: (text: string) => void;
  disabled?: boolean;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  chips,
  onSelectChip,
  disabled = false,
}) => {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="chips-wrapper">
      <div className="chips-scroll">
        {chips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            className="visien-chip"
            onClick={() => onSelectChip(chip)}
            disabled={disabled}
          >
            <span>{chip}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .chips-wrapper {
          width: 100%;
          overflow-x: auto;
          padding: 6px 16px 10px 16px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .chips-wrapper::-webkit-scrollbar {
          display: none;
        }

        .chips-scroll {
          display: flex;
          gap: 8px;
          width: max-content;
        }
      `}</style>
    </div>
  );
};
