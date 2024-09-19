import { Shuffle } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { shuffleArray } from "~/server/functions";

interface AnimatedShuffleProps {
  items: ShuffleItem[];
  onShuffleComplete: (shuffled: ShuffleItem[]) => void;
}

const SHUFFLE_DURATION = 1000;
const SHUFFLE_INTERVAL_TIME = 100; // How often to shuffle during initial phase
const REVEAL_INTERVAL_TIME = 750; // 750ms between reveals

type ShuffleItem = string | number;

const AnimatedShuffle: React.FC<AnimatedShuffleProps> = ({
  items,
  onShuffleComplete,
}) => {
  const [shuffledItems, setShuffledItems] = useState<ShuffleItem[]>(items);
  const [isShuffling, setIsShuffling] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);

  const animateShuffle = useCallback(() => {
    setIsShuffling(true);
    setRevealedIndices([]);
    const tempItems = [...items];
    const unrevealedIndices = Array.from({ length: items.length }, (_, i) => i);

    // Start the initial shuffling for 1 second
    const shuffleInterval = setInterval(() => {
      // Shuffle only the unrevealed items
      const indicesToShuffle = unrevealedIndices;
      const itemsToShuffle = indicesToShuffle
        .map((index) => tempItems[index])
        .filter((item): item is ShuffleItem => item !== undefined);
      const shuffled = shuffleArray(itemsToShuffle);
      indicesToShuffle.forEach((originalIndex, newIndex) => {
        if (shuffled[newIndex] !== undefined) {
          tempItems[originalIndex] = shuffled[newIndex];
        }
      });
      setShuffledItems([...tempItems]);
    }, SHUFFLE_INTERVAL_TIME);

    // Stop initial shuffling after 1 second
    setTimeout(() => {
      clearInterval(shuffleInterval);

      // Start revealing students one by one every 750ms
      const revealInterval = setInterval(() => {
        if (unrevealedIndices.length > 0) {
          const nextIndex = unrevealedIndices.shift();
          if (nextIndex !== undefined) {
            setRevealedIndices((prev) => [...prev, nextIndex]);
          }
        }

        // Continue shuffling unrevealed items
        if (unrevealedIndices.length === 0) {
          clearInterval(revealInterval);
          setIsShuffling(false);
          onShuffleComplete(tempItems);
        }
      }, REVEAL_INTERVAL_TIME);

      // Continue shuffling unrevealed items during the reveal phase
      const continueShuffling = setInterval(() => {
        if (unrevealedIndices.length > 0) {
          const indicesToShuffle = unrevealedIndices;
          const itemsToShuffle = indicesToShuffle
            .map((index) => tempItems[index])
            .filter((item): item is ShuffleItem => item !== undefined);
          const shuffled = shuffleArray(itemsToShuffle);
          indicesToShuffle.forEach((originalIndex, newIndex) => {
            if (shuffled[newIndex] !== undefined) {
              tempItems[originalIndex] = shuffled[newIndex];
            }
          });
          setShuffledItems([...tempItems]);
        } else {
          clearInterval(continueShuffling);
        }
      }, SHUFFLE_INTERVAL_TIME);
    }, SHUFFLE_DURATION);
  }, [items, onShuffleComplete]);

  useEffect(() => {
    setShuffledItems(items);
    setRevealedIndices([]);
  }, [items]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 p-4">
      <Button onClick={animateShuffle} disabled={isShuffling} className="mb-4">
        {isShuffling ? (
          <>
            <Shuffle className="mr-2 h-6 w-6 animate-spin" /> Shuffle
          </>
        ) : (
          <>
            <Shuffle className="mr-2 h-6 w-6" /> Shuffle
          </>
        )}
      </Button>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {shuffledItems.map((item, index) => (
          <div
            key={index}
            className={`relative flex h-20 w-60 items-center justify-center rounded border ${
              revealedIndices.includes(index)
                ? "bg-foreground/5"
                : "animate-pulse bg-foreground/20"
            }`}
          >
            <span className="absolute left-2 top-1 text-xl font-semibold text-gray-500">
              {index + 1}
            </span>
            <span className="text-center text-2xl">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedShuffle;
