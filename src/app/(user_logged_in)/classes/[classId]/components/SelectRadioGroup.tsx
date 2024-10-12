import React from "react";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import type { IconLookup } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

export type Option = {
  value: string;
  label: string;
  icon: IconLookup;
};

interface FancyRadioGroupProps {
  options: Option[];
  value: string; // Changed from defaultValue to value
  onChange: (value: string) => void;
}

export const FancyRadioGroup: React.FC<FancyRadioGroupProps> = ({
  options,
  value,
  onChange,
}) => {
  console.log("🚀 ~ options:", options);
  return (
    <div className="flex w-fit flex-row items-center justify-center gap-2">
      <div className="grid place-items-center">
        <RadioGroup
          value={value} // Use value prop to control the component
          onValueChange={onChange}
          className="grid w-[20rem] grid-cols-5 gap-1 rounded-xl bg-background p-2"
        >
          {options.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="peer hidden"
              />
              <Label
                htmlFor={option.value}
                className="block cursor-pointer select-none rounded-xl p-2 text-center transition-all duration-300 ease-in-out peer-data-[state=checked]:bg-secondary peer-data-[state=checked]:font-bold"
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <FontAwesomeIcon
                    icon={[option.icon.prefix, option.icon.iconName]}
                    className="h-5 w-5"
                  />
                  <span className="text-xs">{option.label}</span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};
