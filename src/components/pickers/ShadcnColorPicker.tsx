"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  HexColorPicker,
  RgbaColorPicker,
  HslaColorPicker,
} from "react-colorful";
import { Button } from "~/components/ui/button";
import { Popover, PopoverTrigger } from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import PopoverContentInline from "./PopoverContentInline";

interface ColorPickerProps {
  onSelectColor: (color: string) => void;
  selectedColor?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  onSelectColor,
  selectedColor = "#000000",
}) => {
  const [open, setOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(selectedColor);
  const [rgba, setRgba] = useState({ r: 0, g: 0, b: 0, a: 1 });
  const [hsla, setHsla] = useState({ h: 0, s: 0, l: 0, a: 1 });

  const updateAllFormats = useCallback((hexColor: string) => {
    const rgbaColor = hexToRgba(hexColor);
    setRgba(rgbaColor);
    setHsla(rgbaToHsla(rgbaColor));
  }, []);

  useEffect(() => {
    updateAllFormats(currentColor);
  }, [currentColor, updateAllFormats]);

  const hexToRgba = (hex: string | undefined) => {
    if (!hex) return { r: 0, g: 0, b: 0, a: 1 };
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0, a: 1 };
    if (!result[1] || !result[2] || !result[3])
      return { r: 0, g: 0, b: 0, a: 1 };
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: 1,
        }
      : { r: 0, g: 0, b: 0, a: 1 };
  };

  const rgbaToHex = ({ r, g, b }: { r: number; g: number; b: number }) => {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  };

  const rgbaToHsla = ({
    r,
    g,
    b,
    a,
  }: {
    r: number;
    g: number;
    b: number;
    a: number;
  }) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
      a,
    };
  };

  const handleColorChange = (newColor: string) => {
    setCurrentColor(newColor);
  };

  const handleRgbaChange = (newRgba: {
    r: number;
    g: number;
    b: number;
    a: number;
  }) => {
    setRgba(newRgba);
    setCurrentColor(rgbaToHex(newRgba));
  };

  const handleHslaChange = (newHsla: {
    h: number;
    s: number;
    l: number;
    a: number;
  }) => {
    setHsla(newHsla);
    const rgbaColor = hslaToRgba(newHsla);
    setRgba(rgbaColor);
    setCurrentColor(rgbaToHex(rgbaColor));
  };

  const hslaToRgba = ({
    h,
    s,
    l,
    a,
  }: {
    h: number;
    s: number;
    l: number;
    a: number;
  }) => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const f = (n: number) =>
      l -
      s *
        Math.min(l, 1 - l) *
        Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
      r: Math.round(255 * f(0)),
      g: Math.round(255 * f(8)),
      b: Math.round(255 * f(4)),
      a,
    };
  };

  const handlePopoverOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // User closed the popover, update the final selected color
      onSelectColor(currentColor);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={handlePopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-52 justify-between">
            <div
              className="mr-2 h-4 w-4 rounded-full border border-gray-300"
              style={{ backgroundColor: currentColor }}
            />
            {currentColor}
          </Button>
        </PopoverTrigger>
        <PopoverContentInline
          className="w-[300px]"
          onClick={(e) => e.stopPropagation()}
        >
          <Tabs defaultValue="hex">
            <TabsList className="grid w-full grid-cols-3 bg-secondary text-foreground">
              <TabsTrigger value="hex">Hex</TabsTrigger>
              <TabsTrigger value="rgba">RGBA</TabsTrigger>
              <TabsTrigger value="hsla">HSLA</TabsTrigger>
            </TabsList>
            <TabsContent value="hex" className="mt-4">
              <HexColorPicker
                color={currentColor}
                onChange={handleColorChange}
              />
              <Input
                type="text"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="mt-2"
              />
            </TabsContent>
            <TabsContent value="rgba" className="mt-4">
              <RgbaColorPicker color={rgba} onChange={handleRgbaChange} />
              <div className="mt-2 grid grid-cols-4 gap-2">
                {["r", "g", "b"].map((channel) => (
                  <Input
                    key={channel}
                    type="number"
                    min="0"
                    max="255"
                    value={rgba[channel as keyof typeof rgba]}
                    onChange={(e) =>
                      handleRgbaChange({
                        ...rgba,
                        [channel]: parseInt(e.target.value),
                      })
                    }
                  />
                ))}
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={rgba.a}
                  onChange={(e) =>
                    handleRgbaChange({ ...rgba, a: parseFloat(e.target.value) })
                  }
                />
              </div>
            </TabsContent>
            <TabsContent value="hsla" className="mt-4">
              <HslaColorPicker color={hsla} onChange={handleHslaChange} />
              <div className="mt-2 grid grid-cols-4 gap-2">
                <Input
                  type="number"
                  min="0"
                  max="360"
                  value={hsla.h}
                  onChange={(e) =>
                    handleHslaChange({ ...hsla, h: parseInt(e.target.value) })
                  }
                />
                {["s", "l"].map((channel) => (
                  <Input
                    key={channel}
                    type="number"
                    min="0"
                    max="100"
                    value={hsla[channel as keyof typeof hsla]}
                    onChange={(e) =>
                      handleHslaChange({
                        ...hsla,
                        [channel]: parseInt(e.target.value),
                      })
                    }
                  />
                ))}
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={hsla.a}
                  onChange={(e) =>
                    handleHslaChange({ ...hsla, a: parseFloat(e.target.value) })
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContentInline>
      </Popover>
    </div>
  );
};

export default ColorPicker;
