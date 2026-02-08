// hooks/use-game-time.ts
"use client";

import { useQuery } from "convex/react";
import { useState, useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";
import {
  getGameHour,
  getTimePhase,
  getAmbientLighting,
  formatGameTime,
  TIME_PHASES,
  GAME_DAY_DURATION_MS,
  TIME_EPOCH,
  type TimePhase,
} from "@/convex/timeConstants";

export interface GameTimeState {
  gameHour: number;
  phase: TimePhase;
  phaseLabel: string;
  formatted: string;
  ambient: ReturnType<typeof getAmbientLighting>;
  dayProgress: number;
}

/** Quantize a float to fixed decimal places to prevent unnecessary re-renders */
function q(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function computeTimeState(clockOffset: number): GameTimeState {
  const correctedNow = Date.now() + clockOffset;
  const gameHour = getGameHour(correctedNow);
  const phase = getTimePhase(gameHour);
  const elapsed = correctedNow - TIME_EPOCH;
  const dayProgress = (elapsed % GAME_DAY_DURATION_MS) / GAME_DAY_DURATION_MS;

  const raw = getAmbientLighting(gameHour);

  return {
    gameHour: q(gameHour, 2),
    phase,
    phaseLabel: TIME_PHASES[phase].label,
    formatted: formatGameTime(gameHour),
    ambient: {
      overlayColor: raw.overlayColor,
      overlayAlpha: q(raw.overlayAlpha, 3),
      tintR: q(raw.tintR, 2),
      tintG: q(raw.tintG, 2),
      tintB: q(raw.tintB, 2),
      sunlightIntensity: q(raw.sunlightIntensity, 2),
      streetLightAlpha: q(raw.streetLightAlpha, 2),
    },
    dayProgress: q(dayProgress, 4),
  };
}

/** Check if two ambient states are meaningfully different */
function hasChanged(a: GameTimeState, b: GameTimeState): boolean {
  return (
    a.phase !== b.phase ||
    a.ambient.overlayColor !== b.ambient.overlayColor ||
    a.ambient.overlayAlpha !== b.ambient.overlayAlpha ||
    a.ambient.tintR !== b.ambient.tintR ||
    a.ambient.tintG !== b.ambient.tintG ||
    a.ambient.tintB !== b.ambient.tintB ||
    a.ambient.streetLightAlpha !== b.ambient.streetLightAlpha ||
    a.formatted !== b.formatted
  );
}

const UPDATE_INTERVAL_MS = 250; // ~4 updates per second

export function useGameTime(): GameTimeState {
  const serverTime = useQuery(api.time.getGameTime);
  const clockOffsetRef = useRef(0);
  const lastStateRef = useRef<GameTimeState | null>(null);

  useEffect(() => {
    if (serverTime?.serverTimestamp) {
      clockOffsetRef.current = serverTime.serverTimestamp - Date.now();
    }
  }, [serverTime?.serverTimestamp]);

  const [state, setState] = useState<GameTimeState>(() => computeTimeState(0));

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const tick = () => {
      const next = computeTimeState(clockOffsetRef.current);
      if (!lastStateRef.current || hasChanged(lastStateRef.current, next)) {
        lastStateRef.current = next;
        setState(next);
      }
    };

    tick();
    // eslint-disable-next-line prefer-const
    timer = setInterval(tick, UPDATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return state;
}
