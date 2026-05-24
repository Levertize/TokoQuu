import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

/**
 * Custom premium dropdown Select component.
 * @param {Object} props
 * @param {Array<{value: string, label: string}>|Array<string>} props.options - Array of options
 * @param {string} props.value - Selected option value
 * @param {function(string): void} props.onChange - Callback when value changes
 * @param {string} [props.className] - Extra class names for wrapper
 * @param {string} [props.buttonClassName] - Extra class names for the button trigger
 * @returns {React.ReactElement}
 */
export function Select({ options, value, onChange, className = '', buttonClassName = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options array to always contain { value, label } objects
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || normalizedOptions[0];

  // Close when clicking outside of the component
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const heightClass = buttonClassName.includes('h-') ? '' : 'h-11';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border border-border rounded ${heightClass} px-4 text-sm font-semibold bg-surface text-text outline-none hover:border-border-hover focus:border-primary focus:shadow-[0_0_0_3px_rgba(217,119,6,0.1)] transition-all cursor-pointer ${buttonClassName}`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <IconChevronDown
          size={16}
          className={`text-text-secondary transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-surface border border-border rounded shadow-hover z-[100] py-1 max-h-60 overflow-y-auto animate-dropdown">
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary-light text-primary font-bold dark:bg-primary-pale dark:text-primary'
                    : 'text-text hover:bg-bg'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Select;
