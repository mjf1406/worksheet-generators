import React, { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { LoaderPinwheel } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";

export type WheelItem = string | number;

const WHEEL_SIZE = 600;
const DELETE_DELAY = 500;

interface SpinningWheelProps {
  items: WheelItem[];
  onSelectItem?: (item: WheelItem) => void;
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({
  items: initialItems,
  onSelectItem,
}) => {
  const [rotation, setRotation] = useState(0);
  const [selectedItem, setSelectedItem] = useState<WheelItem | null>(null);
  const wheelRef = useRef<SVGGElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoRemove, setAutoRemove] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [selectedItems, setSelectedItems] = useState<WheelItem[]>([]);

  useEffect(() => {
    setItems(initialItems);
    setSelectedItems([]);
  }, [initialItems]);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const spinDuration = 5000; // 5 seconds
    const spinRotations = Math.floor(Math.random() * 5) + 5; // 5 to 10 full rotations
    const targetRotation =
      rotation + spinRotations * 360 + Math.floor(Math.random() * 360);

    setSelectedItem(null);

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      if (elapsed < spinDuration) {
        const progress = elapsed / spinDuration;
        const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
        setRotation(rotation + (targetRotation - rotation) * easeOut);
        requestAnimationFrame(animate);
      } else {
        setRotation(targetRotation);
        const selectedIndex = Math.floor(
          (((targetRotation + 90) % 360) / 360) * items.length,
        );
        const selected = items[items.length - 1 - selectedIndex];
        if (selected) {
          setSelectedItems((prevItems) => [...prevItems, selected]);
          setSelectedItem(selected);
        }
        if (selected && onSelectItem) onSelectItem(selected);
        if (autoRemove) {
          setTimeout(() => {
            setItems((prevItems) =>
              prevItems.filter((item) => item !== selected),
            );
            setIsSpinning(false);
          }, DELETE_DELAY);
        } else setIsSpinning(false);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="grid w-full grid-cols-3 items-center justify-center space-y-4 lg:ml-10">
      <style jsx>{`
        @keyframes grow-shrink {
          0%,
          100% {
            transform: scale(1) translateY(-50%);
          }
          50% {
            transform: scale(1.5) translateY(-50%);
          }
        }
        .arrow-animation {
          animation: grow-shrink 0.7s ease-in-out infinite;
        }
      `}</style>
      <div className="col-span-2 space-y-5">
        <div className="relative flex items-center">
          {/* Arrow on the left */}
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            className={`absolute -left-16 top-1/2 -translate-y-1/2 transform ${
              isSpinning ? "arrow-animation" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="1" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>

          <div className="flex gap-5">
            <div className="col-span-1 flex gap-5">
              {/* Wheel */}
              <svg
                width={WHEEL_SIZE}
                height={WHEEL_SIZE}
                viewBox="0 0 100 100"
                className="-rotate-90 transform"
              >
                <g
                  ref={wheelRef}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: "center",
                  }}
                >
                  {items.map((item, index) => {
                    const sliceAngle = 360 / items.length;
                    const startAngle = (sliceAngle * index * Math.PI) / 180;
                    const endAngle = (sliceAngle * (index + 1) * Math.PI) / 180;
                    const x1 = 50 + 50 * Math.cos(startAngle);
                    const y1 = 50 + 50 * Math.sin(startAngle);
                    const x2 = 50 + 50 * Math.cos(endAngle);
                    const y2 = 50 + 50 * Math.sin(endAngle);
                    const largeArcFlag = sliceAngle <= 180 ? "0" : "1";
                    const color = `hsl(${sliceAngle * index}, 70%, 50%)`;
                    const midAngle = (startAngle + endAngle) / 2;
                    const textRadius = 35; // Adjust this value to position text
                    const textX = 50 + textRadius * Math.cos(midAngle);
                    const textY = 50 + textRadius * Math.sin(midAngle);

                    return (
                      <g key={index}>
                        <path
                          d={`M50 50 L${x1} ${y1} A50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={color}
                        />
                        <text
                          x={textX}
                          y={textY}
                          fontSize="3"
                          textAnchor="middle"
                          fill="white"
                          transform={`rotate(${(midAngle * 180) / Math.PI + 180}, ${textX}, ${textY})`}
                        >
                          {item.toString()}
                        </text>
                      </g>
                    );
                  })}
                </g>
                <circle cx="50" cy="50" r="3" fill="black" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="ml-10 flex items-center space-x-2">
            <Checkbox
              id="auto-remove"
              checked={autoRemove}
              className="h-8 w-8"
              onCheckedChange={(checked) => setAutoRemove(checked as boolean)}
            />
            <label
              htmlFor="auto-remove"
              className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Auto-remove selected items
            </label>
          </div>
          <Button
            className="ml-10"
            onClick={spin}
            disabled={isSpinning || items.length === 0}
          >
            {isSpinning ? (
              <>
                <LoaderPinwheel className="mr-2 h-6 w-6 animate-spin" />
                Spin
              </>
            ) : (
              <>
                <LoaderPinwheel className="mr-2 h-6 w-6" />
                Spin
              </>
            )}
          </Button>
          {selectedItem !== null && (
            <div className="ml-10 mt-4 text-center">
              <h3 className="text-lg font-semibold">Selected Item:</h3>
              <p>{selectedItem}</p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-1 ml-16 flex h-full flex-col justify-start">
        {autoRemove && (
          <div className="col-span-1 flex flex-col gap-2">
            <div className="text-2xl font-semibold">Selected Order</div>
            <ol className="list-inside list-decimal text-lg">
              {selectedItems.map((item, index) => (
                <li key={index} className="text-md">
                  {item.toString()}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinningWheel;