import React from 'react';
import { Volume2, VolumeX, Zap, Flag, Activity, Smartphone, Monitor, Disc } from 'lucide-react';
import { Course, HorseProfile, GameOrientation } from '../types/game';

interface HUDProps {
  course: Course;
  playerHorse: HorseProfile;
  currentSpeed: number;
  maxSpeed: number;
  stamina: number;
  maxStamina: number;
  distanceLeft: number;
  spinGauge: number;
  combo: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onExitRace: () => void;
  orientation: GameOrientation;
  onToggleOrientation: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  course,
  playerHorse,
  currentSpeed,
  maxSpeed,
  stamina,
  maxStamina,
  distanceLeft,
  spinGauge,
  combo,
  isMuted,
  onToggleMute,
  onExitRace,
  orientation,
  onToggleOrientation,
}) => {
  const totalDist = course.distance;
  const progressRatio = Math.max(0, Math.min(1, (totalDist - distanceLeft) / totalDist));
  const staminaRatio = Math.max(0, Math.min(1, stamina / maxStamina));
  const speedRatio = Math.max(0, Math.min(1, currentSpeed / (maxSpeed + 10)));
  const isSpinReady = spinGauge >= 40;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 p-2 md:p-3 flex flex-col gap-1.5 z-20 select-none">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Horse Badge & Zeppeli logo */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-700/70 rounded-xl px-2.5 py-1.5 text-white shadow-lg">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: playerHorse.coatColor }}
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-[170px]">
              {playerHorse.name}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold font-mono">
              {course.stageName} · {course.name}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Orientation Toggle */}
          <button
            onClick={onToggleOrientation}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-1 text-[11px] font-bold"
            title="縦向き / 横向きの切り替え"
          >
            {orientation === 'portrait' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">縦向き</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">横向き</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-lg"
            title={isMuted ? 'サウンドON' : 'ミュート'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Exit */}
          <button
            onClick={onExitRace}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-rose-950/70 transition-colors shadow-lg"
          >
            終了
          </button>
        </div>
      </div>

      {/* Speed & Golden Spin Gauge Dual Panel */}
      <div className="grid grid-cols-2 gap-2">
        {/* Speedometer & Combo */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/70 rounded-xl p-2 md:p-2.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              速度 (自動巡航)
            </span>
            {combo > 1 && (
              <span className="text-[10px] font-bold text-emerald-400 animate-pulse font-mono">
                {combo} 回避連続!
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-xl sm:text-2xl font-black font-mono tabular-nums text-white tracking-tight">
              {currentSpeed.toFixed(1)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">km/h</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-amber-400 transition-all duration-100"
              style={{ width: `${Math.min(100, speedRatio * 100)}%` }}
            />
          </div>
        </div>

        {/* Golden Spin Gauge */}
        <div className={`backdrop-blur-md border rounded-xl p-2 md:p-2.5 shadow-lg flex flex-col justify-between transition-colors ${
          isSpinReady
            ? 'bg-emerald-950/80 border-emerald-500/70 ring-1 ring-emerald-400/40'
            : 'bg-slate-950/90 border-slate-700/70'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <Disc className={`w-3.5 h-3.5 ${isSpinReady ? 'animate-spin text-emerald-300' : 'text-emerald-500'}`} />
              黄金の回転
            </span>
            <span className={`text-[10px] font-mono font-bold ${isSpinReady ? 'text-emerald-300' : 'text-slate-400'}`}>
              {isSpinReady ? 'SPIN READY!' : `${Math.round(spinGauge)}%`}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-0.5">
            <span className={`text-xl sm:text-2xl font-black font-mono tabular-nums ${isSpinReady ? 'text-emerald-300' : 'text-emerald-400'}`}>
              {Math.round(spinGauge)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">/ 100</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                isSpinReady
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-300 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500'
              }`}
              style={{ width: `${Math.min(100, spinGauge)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progress Track Minimap */}
      <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/70 rounded-xl px-3 py-1.5 shadow-lg flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Flag className="w-3 h-3 text-emerald-400" />
            <span>コース進捗</span>
          </span>
          <span className="font-bold text-emerald-400">
            残り {Math.max(0, Math.round(distanceLeft))}m / {totalDist}m
          </span>
        </div>

        <div className="relative w-full bg-slate-800 rounded-full h-2.5 overflow-visible my-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-100"
            style={{ width: `${progressRatio * 100}%` }}
          />
          {/* Running Horse Icon Pin */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-xs select-none transition-all duration-100"
            style={{ left: `${Math.min(96, Math.max(4, progressRatio * 100))}%` }}
          >
            🐎
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-[10px] select-none">
            🏁
          </div>
        </div>
      </div>
    </div>
  );
};
