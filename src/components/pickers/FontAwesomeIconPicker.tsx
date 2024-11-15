"use client";

import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type {
  IconName,
  IconPrefix,
  IconLookup,
} from "@fortawesome/fontawesome-svg-core";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { Button } from "~/components/ui/button";
import { Popover, PopoverTrigger } from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import PopoverContentInline from "./PopoverContentInline";

// Add all solid and regular icons to the library
library.add(fas, far);

type FAIconName = IconName;

interface FAIconPickerProps {
  onSelectIcon: (iconName: FAIconName, prefix: IconPrefix) => void;
  selectedIcon?: { name: FAIconName; prefix: IconPrefix };
}

const animalAndShapeIcons: IconLookup[] = [
  { prefix: "fas", iconName: "cat" },
  { prefix: "fas", iconName: "dog" },
  { prefix: "fas", iconName: "horse" },
  { prefix: "fas", iconName: "fish" },
  { prefix: "fas", iconName: "dove" },
  { prefix: "fas", iconName: "dragon" },
  { prefix: "fas", iconName: "hippo" },
  { prefix: "fas", iconName: "otter" },
  { prefix: "fas", iconName: "paw" },
  { prefix: "fas", iconName: "spider" },
  { prefix: "fas", iconName: "square" },
  { prefix: "fas", iconName: "circle" },
  { prefix: "fas", iconName: "star" },
  { prefix: "fas", iconName: "heart" },
  { prefix: "fas", iconName: "shapes" },
  { prefix: "fas", iconName: "feather" },
  { prefix: "fas", iconName: "kiwi-bird" },
  { prefix: "fas", iconName: "worm" },
  { prefix: "fas", iconName: "shrimp" },
  { prefix: "fas", iconName: "mosquito" },
  { prefix: "fas", iconName: "locust" },
  { prefix: "fas", iconName: "horse-head" },
  { prefix: "fas", iconName: "frog" },
  { prefix: "fas", iconName: "fish-fins" },
  { prefix: "fas", iconName: "feather-pointed" },
  { prefix: "fas", iconName: "crow" },
  { prefix: "fas", iconName: "cow" },
  { prefix: "fas", iconName: "bugs" },
  { prefix: "fas", iconName: "cloud" },
  { prefix: "fas", iconName: "shield" },
  { prefix: "fas", iconName: "diamond" },
  { prefix: "fas", iconName: "crown" },
  { prefix: "fas", iconName: "ticket-simple" },
  { prefix: "fas", iconName: "clover" },
  { prefix: "fas", iconName: "burst" },
  { prefix: "fas", iconName: "heart-crack" },
  { prefix: "fas", iconName: "shirt" },
  { prefix: "fas", iconName: "socks" },
  { prefix: "fas", iconName: "shoe-prints" },
  { prefix: "fas", iconName: "mitten" },
  { prefix: "fas", iconName: "hat-wizard" },
  { prefix: "fas", iconName: "hat-cowboy-side" },
  { prefix: "fas", iconName: "hat-cowboy" },
  { prefix: "fas", iconName: "graduation-cap" },
  { prefix: "fas", iconName: "vest-patches" },
  { prefix: "fas", iconName: "glasses" },
  { prefix: "fas", iconName: "tree" },
  { prefix: "fas", iconName: "fire" },
  { prefix: "fas", iconName: "compass" },
  { prefix: "fas", iconName: "binoculars" },
  { prefix: "fas", iconName: "toilet-paper" },
  { prefix: "fas", iconName: "tent" },
  { prefix: "fas", iconName: "caravan" },
  { prefix: "fas", iconName: "campground" },
  { prefix: "fas", iconName: "bucket" },
  { prefix: "fas", iconName: "bottle-water" },
  { prefix: "fas", iconName: "trailer" },
  { prefix: "fas", iconName: "ghost" },
  { prefix: "fas", iconName: "skull" },
  { prefix: "fas", iconName: "broom" },
  { prefix: "fas", iconName: "book-skull" },
  { prefix: "fas", iconName: "skull-crossbones" },
  { prefix: "fas", iconName: "brush" },
  { prefix: "fas", iconName: "truck-pickup" },
  { prefix: "fas", iconName: "paint-roller" },
  { prefix: "fas", iconName: "tarp" },
  { prefix: "fas", iconName: "dumpster" },
  { prefix: "fas", iconName: "helmet-safety" },
  { prefix: "fas", iconName: "bolt" },
  { prefix: "fas", iconName: "wind" },
  { prefix: "fas", iconName: "seedling" },
  { prefix: "fas", iconName: "leaf" },
  { prefix: "fas", iconName: "plug" },
  { prefix: "fas", iconName: "lightbulb" },
  { prefix: "fas", iconName: "spell-check" },
  { prefix: "fas", iconName: "earth-americas" },
  { prefix: "fas", iconName: "earth-oceania" },
  { prefix: "fas", iconName: "earth-europe" },
  { prefix: "fas", iconName: "earth-asia" },
  { prefix: "fas", iconName: "earth-africa" },
  { prefix: "fas", iconName: "globe" },
  { prefix: "fas", iconName: "book-open" },
  { prefix: "fas", iconName: "flask" },
  { prefix: "fas", iconName: "flask-vial" },
  { prefix: "fas", iconName: "atom" },
  { prefix: "fas", iconName: "vial" },
  { prefix: "fas", iconName: "vials" },
  { prefix: "fas", iconName: "microscope" },
  { prefix: "fas", iconName: "vial-virus" },
  { prefix: "fas", iconName: "syringe" },
  { prefix: "fas", iconName: "pills" },
  { prefix: "fas", iconName: "prescription-bottle" },
  { prefix: "fas", iconName: "disease" },
  { prefix: "fas", iconName: "capsules" },
  { prefix: "fas", iconName: "biohazard" },
  { prefix: "fas", iconName: "tablets" },
  { prefix: "fas", iconName: "calculator" },
  { prefix: "fas", iconName: "not-equal" },
  { prefix: "fas", iconName: "square-root-variable" },
  { prefix: "fas", iconName: "plus-minus" },
  { prefix: "fas", iconName: "infinity" },
  { prefix: "fas", iconName: "percent" },
  { prefix: "fas", iconName: "pen" },
  { prefix: "fas", iconName: "pencil" },
  { prefix: "fas", iconName: "marker" },
  { prefix: "fas", iconName: "pen-fancy" },
  { prefix: "fas", iconName: "highlighter" },
  { prefix: "fas", iconName: "pen-clip" },
  { prefix: "fas", iconName: "pen-nib" },
  { prefix: "fas", iconName: "clipboard" },
  { prefix: "fas", iconName: "clipboard-list" },
  { prefix: "fas", iconName: "file-lines" },
  { prefix: "fas", iconName: "font" },
  { prefix: "fas", iconName: "language" },
  { prefix: "fas", iconName: "hands-asl-interpreting" },
  { prefix: "fas", iconName: "hands" },
  { prefix: "fas", iconName: "chair" },
  { prefix: "fas", iconName: "candy-cane" },
  { prefix: "fas", iconName: "gift" },
  { prefix: "fas", iconName: "bowling-ball" },
  { prefix: "fas", iconName: "cake-candles" },
  { prefix: "fas", iconName: "golf-ball-tee" },
  { prefix: "fas", iconName: "stopwatch" },
  { prefix: "fas", iconName: "stopwatch-20" },
  { prefix: "fas", iconName: "hourglass" },
  { prefix: "fas", iconName: "hourglass-start" },
  { prefix: "fas", iconName: "hourglass-end" },
  { prefix: "fas", iconName: "gifts" },
  { prefix: "fas", iconName: "hand-holding-heart" },
  { prefix: "fas", iconName: "hands-holding-circle" },
  { prefix: "fas", iconName: "hands-holding" },
  { prefix: "fas", iconName: "hand-holding" },
  { prefix: "fas", iconName: "person-praying" },
  { prefix: "fas", iconName: "dharmachakra" },
  { prefix: "fas", iconName: "arrows-spin" },
  { prefix: "fas", iconName: "spinner" },
  { prefix: "fas", iconName: "fan" },
  { prefix: "fas", iconName: "bahai" },
  { prefix: "fas", iconName: "life-ring" },
];

const FAIconPicker: React.FC<FAIconPickerProps> = ({
  onSelectIcon,
  selectedIcon,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const iconLookups = useMemo(() => animalAndShapeIcons, []);

  const filteredIcons = useMemo(() => {
    return iconLookups.filter((icon) =>
      icon.iconName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [iconLookups, searchQuery]);

  const handleSelectIcon = (iconName: FAIconName, prefix: IconPrefix) => {
    onSelectIcon(iconName, prefix);
    setOpen(false);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-52 justify-between">
            {selectedIcon ? (
              <FontAwesomeIcon
                icon={[selectedIcon.prefix, selectedIcon.name]}
                className="mr-2 h-6 w-6"
              />
            ) : (
              <FontAwesomeIcon
                icon="question-circle"
                className="mr-2 h-6 w-6"
              />
            )}
            {selectedIcon ? selectedIcon.name : "Select icon..."}
          </Button>
        </PopoverTrigger>
        <PopoverContentInline
          className="w-[300px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="h-[300px] overflow-y-auto overflow-x-hidden">
              <div className="grid grid-cols-7 gap-1">
                {filteredIcons.map((icon) => (
                  <Button
                    key={`${icon.prefix}-${icon.iconName}`}
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleSelectIcon(icon.iconName, icon.prefix)}
                    title={`${icon.prefix} ${icon.iconName}`}
                  >
                    <FontAwesomeIcon
                      icon={[icon.prefix, icon.iconName]}
                      className="h-4 w-4"
                    />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContentInline>
      </Popover>
    </div>
  );
};

export default FAIconPicker;
