'use client';

import React, { useState, useEffect } from 'react';
import { Check, Send, Layers } from 'lucide-react';

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
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  // Reset multi-select state when chip options change (new question)
  useEffect(() => {
    setSelectedChips([]);
    setIsMultiMode(false);
  }, [chips]);

  if (!chips || chips.length === 0) return null;

  const handleChipClick = (chip: string) => {
    if (disabled) return;

    if (!isMultiMode) {
      onSelectChip(chip);
      return;
    }

    // Multi-select toggle
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const handleSendMultiple = () => {
    if (selectedChips.length === 0 || disabled) return;
    onSelectChip(selectedChips.join(' • '));
    setSelectedChips([]);
    setIsMultiMode(false);
  };

  return (
    <div className="chips-wrapper">
      <div className="chips-scroll">
        {/* Multi-Select Toggle Pill */}
        {chips.length > 1 && (
          <button
            type="button"
            className={`mode-toggle-chip ${isMultiMode ? 'active' : ''}`}
            onClick={() => {
              setIsMultiMode((prev) => !prev);
              setSelectedChips([]);
            }}
            disabled={disabled}
            title={isMultiMode ? 'Switch to 1-Tap send' : 'Select multiple options before sending'}
          >
            <Layers size={12} className="toggle-icon" />
            <span>{isMultiMode ? 'Multi-Select ON' : 'Select Multiple'}</span>
          </button>
        )}

        {/* Suggestion Chips */}
        {chips.map((chip, idx) => {
          const isSelected = selectedChips.includes(chip);
          return (
            <button
              key={idx}
              type="button"
              className={`visien-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => handleChipClick(chip)}
              disabled={disabled}
            >
              {isMultiMode && (
                <span className={`chip-check-icon ${isSelected ? 'checked' : ''}`}>
                  {isSelected ? <Check size={11} strokeWidth={3} /> : null}
                </span>
              )}
              <span>{chip}</span>
            </button>
          );
        })}

        {/* Send Batch Button when items are selected */}
        {isMultiMode && selectedChips.length > 0 && (
          <button
            type="button"
            className="send-multiple-btn"
            onClick={handleSendMultiple}
            disabled={disabled}
          >
            <Send size={12} />
            <span>Send ({selectedChips.length}) Selected</span>
          </button>
        )}
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
          align-items: center;
          gap: 8px;
          width: max-content;
        }

        .mode-toggle-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          font-size: 11.5px;
          font-weight: 600;
          border-radius: var(--radius-full);
          border: 1px dashed var(--violet-primary);
          background: rgba(124, 58, 237, 0.06);
          color: var(--violet-primary);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mode-toggle-chip:hover:not(:disabled) {
          background: rgba(124, 58, 237, 0.12);
        }

        .mode-toggle-chip.active {
          border-style: solid;
          background: var(--violet-primary);
          color: #ffffff;
        }

        .chip-check-icon {
          width: 14px;
          height: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1.5px solid rgba(0, 0, 0, 0.25);
          margin-right: 2px;
        }

        .chip-check-icon.checked {
          background: var(--violet-primary);
          border-color: var(--violet-primary);
          color: #ffffff;
        }

        :global(.visien-chip.selected) {
          border-color: var(--violet-primary) !important;
          background: rgba(124, 58, 237, 0.1) !important;
          color: var(--violet-deep) !important;
          box-shadow: 0 0 0 1px var(--violet-primary);
        }

        .send-multiple-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(135deg, var(--violet-primary), #6d28d9);
          border: none;
          border-radius: var(--radius-full);
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.35);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .send-multiple-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.45);
        }

        .send-multiple-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
      `}</style>
    </div>
  );
};

