"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Slider } from "~/components/ui/slider";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Info } from "lucide-react";
import { cn } from "~/lib/utils";
import { Bar, BarChart, YAxis, ReferenceLine } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import Link from "next/link";

interface WindowWithWebkitAudioContext extends Window {
  webkitAudioContext: typeof AudioContext;
}

const noiseLevels = [
  { db: 10, description: "Normal breathing" },
  { db: 20, description: "Leaves rustling, mosquito buzzing" },
  { db: 30, description: "Whispering" },
  { db: 40, description: "Quiet office or residential area, light rain" },
  { db: 50, description: "Moderate rainfall, refrigerator" },
  { db: 60, description: "Normal conversation, electric toothbrush" },
  { db: 70, description: "Washing machine, dishwasher" },
  { db: 80, description: "Noisy restaurant, vacuum cleaner, garbage disposal" },
  { db: 85, description: "Blender, heavy traffic" },
  { db: 90, description: "Lawnmower, shouting conversation" },
  { db: 95, description: "Electric drill" },
  { db: 100, description: "Night club, train, snowmobile" },
  { db: 110, description: "Power saw, jackhammer, motorcycle" },
  { db: 120, description: "Ambulance siren, chainsaw, rock concert" },
  { db: 130, description: "Stock car race, jet engine" },
  { db: 135, description: "Loud squeaky toy (next to ear)" },
  { db: 140, description: "Airplane takeoff" },
  { db: 145, description: "Fireworks" },
  { db: 150, description: "Shotgun blast" },
];

const exposureTimes = [
  { db: 85, time: "8 hours" },
  { db: 88, time: "4 hours" },
  { db: 91, time: "2 hours" },
  { db: 94, time: "1 hour" },
  { db: 97, time: "30 minutes" },
  { db: 100, time: "15 minutes" },
  { db: 103, time: "7.5 minutes" },
  { db: 106, time: "3.75 minutes" },
];

const NoiseMonitor: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [maxNoiseLevel, setMaxNoiseLevel] = useState(0);
  const [threshold, setThreshold] = useState(85);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState([{ time: 0, level: 0 }]);
  const [thresholdExceededCount, setThresholdExceededCount] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const klaxonAudio = useRef<HTMLAudioElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const thresholdExceededStartTime = useRef<number | null>(null);
  const lastExceededTime = useRef(0);

  const playAlarm = useCallback(() => {
    if (klaxonAudio.current) {
      klaxonAudio.current.currentTime = 0;
      void klaxonAudio.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, []);

  const monitorNoiseLevel = useCallback(() => {
    if (!analyser.current) {
      console.log("Analyser not set up, cannot monitor");
      return;
    }

    const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
    const updateNoise = () => {
      analyser.current?.getByteFrequencyData(dataArray);
      const average =
        dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;

      const db = Math.max(
        20 * Math.log10(Math.max(average, 1) / 255) * 4 + 100,
        0,
      );

      setNoiseLevel(db);
      setMaxNoiseLevel((prevMax) => Math.max(prevMax, db));
      setChartData((prevData) => {
        const newData = [
          ...prevData,
          { time: prevData.length, level: db },
        ].slice(-50);
        return newData;
      });

      const currentTime = Date.now();

      if (db >= threshold) {
        if (thresholdExceededStartTime.current === null) {
          thresholdExceededStartTime.current = currentTime;
        } else if (currentTime - thresholdExceededStartTime.current >= 500) {
          if (currentTime - lastExceededTime.current >= 1000) {
            setThresholdExceededCount((prevCount) => prevCount + 1);
            lastExceededTime.current = currentTime;
            playAlarm();
          }
        }
      } else {
        thresholdExceededStartTime.current = null;
      }

      if (isListening) {
        animationFrameId.current = requestAnimationFrame(updateNoise);
      }
    };
    updateNoise();
  }, [isListening, threshold, playAlarm]);

  useEffect(() => {
    klaxonAudio.current = new Audio("/red-alert-klaxon-re-creation-107222.mp3");
    klaxonAudio.current.load();
    return () => {
      void audioContext.current?.close();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      monitorNoiseLevel();
    } else if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, [isListening, monitorNoiseLevel]);

  const startListening = async () => {
    setError(null);
    setThresholdExceededCount(0);
    setMaxNoiseLevel(0);
    thresholdExceededStartTime.current = null;
    lastExceededTime.current = 0;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const AudioContextClass: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as WindowWithWebkitAudioContext).webkitAudioContext;
      audioContext.current = new AudioContextClass();
      analyser.current = audioContext.current.createAnalyser();
      microphone.current = audioContext.current.createMediaStreamSource(stream);
      microphone.current.connect(analyser.current);
      analyser.current.fftSize = 256;

      setIsListening(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError(
        `Failed to access microphone: ${(error as Error).message}. Please ensure you've granted permission and are using HTTPS.`,
      );
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setNoiseLevel(0);
    void microphone.current?.disconnect();
    void audioContext.current?.close();
  };

  const getNoiseDescription = (level: number) => {
    const matchingLevel = noiseLevels.reduce((prev, curr) =>
      Math.abs(curr.db - level) < Math.abs(prev.db - level) ? curr : prev,
    );
    return matchingLevel.description;
  };

  const getSafetyStatus = (level: number) => {
    if (level < 85) return "Safe";
    if (level < 120) return "Potentially Harmful";
    return "Dangerous";
  };

  const getSafetyColor = (level: number) => {
    if (level < 85) return "text-primary";
    if (level < 120) return "text-warning";
    return "text-destructive";
  };

  const getExposureTime = (level: number) => {
    const matchingExposure = exposureTimes.reduce((prev, curr) =>
      level >= curr.db ? curr : prev,
    );
    return matchingExposure ? matchingExposure.time : "Less than 3.75 minutes";
  };

  const chartConfig = {
    level: {
      label: "Noise Level",
      color: "hsl(var(--chart-1))",
    },
    threshold: {
      label: "Threshold",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl bg-card p-6 shadow-md">
      <h2 className="text-2xl font-bold text-foreground">
        Noise Level Monitor
      </h2>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <span className="text-foreground">
          Current Noise Level: {noiseLevel.toFixed(2)} dB
        </span>
        <span className={cn("font-bold", getSafetyColor(noiseLevel))}>
          {getSafetyStatus(noiseLevel)}
        </span>
      </div>
      <div className="text-sm text-muted-foreground">
        {getNoiseDescription(noiseLevel)}
      </div>
      <div className="text-sm font-semibold text-warning">
        Threshold Exceeded: {thresholdExceededCount} times
      </div>
      <div className="text-sm font-semibold text-primary">
        Maximum dB: {maxNoiseLevel.toFixed(2)} dB
      </div>
      <div className="text-sm text-muted-foreground">
        Max Level Description: {getNoiseDescription(maxNoiseLevel)}
      </div>

      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <BarChart data={chartData}>
          <YAxis
            dataKey="level"
            domain={[0, 150]}
            tickCount={6}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => `${value}dB`}
          />
          <Bar
            dataKey="level"
            fill="var(--color-level)"
            radius={[4, 4, 0, 0]}
          />
          <ReferenceLine
            y={threshold}
            stroke="var(--color-threshold)"
            strokeDasharray="3 3"
            label={{
              value: "Threshold",
              position: "insideTopRight",
              fill: "var(--color-threshold)",
            }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </BarChart>
      </ChartContainer>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Threshold: {threshold} dB
        </label>
        <Slider
          value={[threshold]}
          onValueChange={(value) => setThreshold(value[0] ?? 85)}
          max={150}
          step={1}
        />
      </div>
      <div className="text-sm text-muted-foreground">
        Threshold Description: {getNoiseDescription(threshold)}
      </div>
      <div className="text-sm text-muted-foreground">
        Max Exposure Time: {getExposureTime(noiseLevel)}
      </div>
      <Button onClick={isListening ? stopListening : startListening}>
        {isListening ? "Stop Monitoring" : "Start Monitoring"}
      </Button>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Noise Level Guide</AlertTitle>
        <AlertDescription>
          <ul className="list-inside list-disc text-sm">
            <li className="text-primary">0-84 dB: Safe</li>
            <li className="text-warning">85-119 dB: Potentially Harmful</li>
            <li className="text-destructive">120+ dB: Dangerous</li>
          </ul>
          <Link
            className="underline"
            href={
              "https://lexiehearing.com/us/library/decibel-examples-noise-levels-of-common-sounds"
            }
          >
            Data source
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default NoiseMonitor;
