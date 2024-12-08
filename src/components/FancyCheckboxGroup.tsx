"use client";

import { Checkbox } from "~/components/ui/checkbox";

export interface CheckboxOption {
  value: string;
  label: string;
}

interface FancyCheckboxGroupProps {
  label: string;
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (newValues: string[]) => void;
}

export function FancyCheckboxGroup({
  label,
  options,
  selectedValues,
  onChange,
}: FancyCheckboxGroupProps) {
  const handleToggle = (value: string, checked: boolean) => {
    let newValues;
    if (checked) {
      newValues = [...selectedValues, value];
    } else {
      newValues = selectedValues.filter((v) => v !== value);
    }
    onChange(newValues);
  };

  return (
    <div className="space-y-1">
      <div className="font-semibold">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center space-x-2"
          >
            <Checkbox
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) =>
                handleToggle(option.value, !!checked)
              }
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
