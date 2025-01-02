"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { library } from "@fortawesome/fontawesome-svg-core";

// Import all icons used in your ACHIEVEMENTS
import {
  faSeedling,
  faShoePrints,
  faGraduationCap,
  faMapSigns,
  faBookOpen,
  faHammer,
  faTools,
  faScroll,
  faMicroscope,
  faTrophy,
  faCompass,
  faChessKnight,
  faPalette,
  faMusic,
  faCrown,
  faMedal,
  faShieldAlt,
  faStar,
  faDragon,
  faCloudBolt,
  faGift,
} from "@fortawesome/free-solid-svg-icons";

// Add them all to the library
library.add(
  faSeedling,
  faShoePrints,
  faGraduationCap,
  faMapSigns,
  faBookOpen,
  faHammer,
  faTools,
  faScroll,
  faMicroscope,
  faTrophy,
  faCompass,
  faChessKnight,
  faPalette,
  faMusic,
  faCrown,
  faMedal,
  faShieldAlt,
  faStar,
  faDragon,
  faCloudBolt,
  faGift,
);

// ------------------------------------------------------------------
// FontAwesomeIconClient
// ------------------------------------------------------------------
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

  // If no icon is provided, use faGift as a fallback
  if (!icon) {
    return (
      <FontAwesomeIcon icon={faGift} style={iconStyle} className={className} />
    );
  }

  try {
    // icon is something like "fas seedling"
    // so iconParts = ["fas", "seedling"]
    const iconParts = icon.split(" ");
    const prefix = iconParts[0] as IconPrefix;
    const iconName = iconParts[1] as IconName;

    return (
      <FontAwesomeIcon
        icon={[prefix, iconName]}
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
