"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBookMedical,
  faBrain,
  faMusic,
  faUtensils,
  faChair,
  faGhost,
  faCandyCane,
  faCouch,
  faChampagneGlasses,
  faHandHoldingHeart,
  faArrowsSpin,
  faGraduationCap,
  faCat,
  faCalculator,
  faGift,
} from "@fortawesome/free-solid-svg-icons";

// Add all icons to the library
library.add(
  faBookMedical,
  faBrain,
  faMusic,
  faUtensils,
  faChair,
  faGhost,
  faCandyCane,
  faCouch,
  faChampagneGlasses,
  faHandHoldingHeart,
  faArrowsSpin,
  faGraduationCap,
  faCat,
  faCalculator,
  faGift,
);

interface FontAwesomeIconClientProps {
  icon: string | null | undefined;
  size?: number;
  className?: string;
}

export function FontAwesomeIconClient({
  icon,
  size = 32,
  className = "",
}: FontAwesomeIconClientProps) {
  const iconStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  if (!icon) {
    return (
      <FontAwesomeIcon icon={faGift} style={iconStyle} className={className} />
    );
  }

  try {
    const iconParts = icon.split(" ");
    const iconName = iconParts[1] as IconName;
    return (
      <FontAwesomeIcon
        icon={[iconParts[0] as IconPrefix, iconName]}
        style={iconStyle}
        className={className}
      />
    );
  } catch (error) {
    console.error("Error rendering icon:", error);
    return (
      <FontAwesomeIcon icon={faGift} style={iconStyle} className={className} />
    );
  }
}
