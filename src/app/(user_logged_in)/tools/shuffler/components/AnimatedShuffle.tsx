import { Shuffle } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { shuffleArray } from "~/server/functions";

interface AnimatedShuffleProps {
  items: ShuffleItem[];
  onShuffleComplete: (shuffled: ShuffleItem[]) => void;
}

type ShuffleItem = string | number;

const ANIMATION_DURATION = 2000;
const ANIMATION_STEPS = 50; // Number of shuffles during animation

const AnimatedShuffle: React.FC<AnimatedShuffleProps> = ({
  items,
  onShuffleComplete,
}) => {
  const [shuffledItems, setShuffledItems] = useState<ShuffleItem[]>(items);
  const [isShuffling, setIsShuffling] = useState(false);
  const [positions, setPositions] = useState<
    Record<number, { top: number; left: number }>
  >({});
  const [isSnapBack, setIsSnapBack] = useState(false);

  const animateShuffle = useCallback(() => {
    setIsShuffling(true);
    setIsSnapBack(false);
    let steps = 0;
    let finalShuffledItems: ShuffleItem[] = [];

    const interval = setInterval(() => {
      setShuffledItems((prev) => {
        const newShuffled = shuffleArray(prev);
        finalShuffledItems = newShuffled; // Store the latest shuffled items
        setPositions((prevPositions) => {
          const newPositions: Record<number, { top: number; left: number }> =
            {};
          newShuffled.forEach((item, index) => {
            const prevIndex = prev.indexOf(item);
            if (prevIndex !== index) {
              newPositions[index] = {
                top: Math.random() * 60 - 30,
                left: Math.random() * 60 - 30,
              };
            } else {
              newPositions[index] = prevPositions[index] ?? { top: 0, left: 0 };
            }
          });
          return newPositions;
        });
        return newShuffled;
      });
      steps++;
      if (steps >= ANIMATION_STEPS) {
        clearInterval(interval);
        setIsSnapBack(true);
        setTimeout(() => {
          setIsShuffling(false);
          setPositions({});
          setIsSnapBack(false);
          onShuffleComplete(finalShuffledItems); // Use the latest shuffled items
        }, 300);
      }
    }, ANIMATION_DURATION / ANIMATION_STEPS);
  }, [onShuffleComplete]);

  useEffect(() => {
    setShuffledItems(items);
    setPositions({});
  }, [items]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 p-4">
      <Button onClick={animateShuffle} disabled={isShuffling} className="mb-4">
        {isShuffling ? (
          <>
            <Shuffle className="mr-2 h-6 w-6 animate-spin" />
            Shuffle
          </>
        ) : (
          <>
            <Shuffle className="mr-2 h-6 w-6" />
            Shuffle
          </>
        )}
      </Button>
      <ol className="grid list-decimal grid-cols-2 gap-3 text-2xl">
        {shuffledItems.map((item, index) => (
          <li
            key={item}
            className="relative col-span-1 ml-10 transform rounded bg-foreground/5 p-2 transition-all duration-150 ease-in-out hover:scale-105"
            style={{
              transform: `translate(${positions[index]?.left ?? 0}px, ${positions[index]?.top ?? 0}px)`,
              transition:
                isShuffling || isSnapBack
                  ? "transform 0.15s ease-in-out"
                  : "none",
            }}
          >
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default AnimatedShuffle;
