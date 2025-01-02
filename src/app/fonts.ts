import { Poppins, JetBrains_Mono, PT_Mono, DM_Mono, Roboto_Mono } from "next/font/google";

// Poppins font configuration
export const poppins = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// JetBrains Mono font configuration
export const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700"],
});

// PT Mono font configuration
export const ptMono = PT_Mono({
    subsets: ["latin"],
    weight: ["400"],
});

// DM Mono font configuration
export const dmMono = DM_Mono({
    subsets: ["latin"],
    weight: ["300", "400", "500"],
});

// Roboto Mono font configuration
export const robotoMono = Roboto_Mono({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700"],
});
