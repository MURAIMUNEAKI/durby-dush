import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, Disc } from 'lucide-react';
import { GameOrientation } from '../types/game';

interface ControlsProps {
  onSpinDash: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  isRacing: boolean;
  spinGauge: number;
  orientation?: GameOrientation;
}

export const Controls: React.FC<ControlsProps> = ({
  onSpinDash,
  onMoveLeft,
  onMoveRight,
  onJump,
  isRacing,
  spinGauge,
}) => {
  const [spinPulse, setSpinPulse] = useState(false);
  const isSpinReady = spinGauge >= 30;

  const handleSpinTrigger = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!isRacing) return;
    setSpinPulse(true);
    setTimeout(() => setSpinPulse(false), 120);
    onSpinDash();
  };

  const handleLeftTrigger = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!isRacing) return;
    onMoveLeft();
  };

  const handleRightTrigger = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!isRacing) return;
    onMoveRight();
  };

  const handleJumpTrigger = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (!isRacing) return;
    onJump();
  };

  return (
    <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4 pointer-events-none z-30 select-none pb-4 md:pb-6">
      <div className="w-full max-w-lg mx-auto flex items-end justify-between gap-2 sm:gap-4 px-1">
        {/* Left Side: Steering & Jump Controls (Thumb Zone) */}
        <div className="pointer-events-auto flex flex-col gap-2">
          {/* Jump Button */}
          <button
            onClick={handleJumpTrigger}
            onPointerDown={handleJumpTrigger}
            disabled={!isRacing}
            type="button"
            className="cursor-pointer group active:scale-95 transition-all flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-b from-blue-500 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/30 border border-blue-400/40 hover:brightness-110 disabled:opacity-50"
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 group-active:-translate-y-1 transition-transform" />
            <span>ジャンプ [S / ↑]</span>
          </button>

          {/* Left / Right Lane Shift Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLeftTrigger}
              onPointerDown={handleLeftTrigger}
              disabled={!isRacing}
              type="button"
              aria-label="Move Left"
              className="cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1 w-14 h-12 sm:w-16 sm:h-14 rounded-2xl bg-slate-950/90 backdrop-blur-md text-white font-bold text-sm shadow-xl border border-slate-700/70 hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-mono text-slate-400">A</span>
            </button>

            <button
              onClick={handleRightTrigger}
              onPointerDown={handleRightTrigger}
              disabled={!isRacing}
              type="button"
              aria-label="Move Right"
              className="cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1 w-14 h-12 sm:w-16 sm:h-14 rounded-2xl bg-slate-950/90 backdrop-blur-md text-white font-bold text-sm shadow-xl border border-slate-700/70 hover:bg-slate-800 disabled:opacity-50"
            >
              <span className="text-[10px] font-mono text-slate-400">D</span>
              <ChevronRight className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Right Side: Golden Spin Dash Button */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="text-[10px] sm:text-xs font-bold text-emerald-300 drop-shadow mb-1 tracking-wide">
            {isSpinReady ? '回転エネルギー装填完了！ [Space]' : '鉄球回収かギリギリ回避でチャージ'}
          </div>

          <button
            onClick={handleSpinTrigger}
            onPointerDown={handleSpinTrigger}
            disabled={!isRacing}
            type="button"
            className={`cursor-pointer relative group active:scale-90 transition-all duration-75 flex flex-col items-center justify-center w-36 h-28 sm:w-44 sm:h-32 rounded-3xl text-white font-black shadow-2xl border-4 ${
              isSpinReady
                ? 'bg-gradient-to-b from-emerald-500 via-teal-600 to-green-800 border-emerald-300 shadow-emerald-600/50 hover:brightness-110 ring-2 ring-emerald-400/60'
                : 'bg-slate-800 border-slate-700 opacity-70'
            } ${spinPulse ? 'scale-95 ring-4 ring-emerald-300' : ''}`}
          >
            <div className="absolute inset-x-2 top-1 h-5 rounded-full bg-white/20 pointer-events-none" />

            <div className="flex items-center gap-1.5 text-sm sm:text-lg tracking-tight">
              <Disc className={`w-5 h-5 ${isSpinReady ? 'animate-spin text-emerald-200' : 'text-slate-400'}`} />
              <span>黄金の回転</span>
            </div>

            <span className="text-[11px] sm:text-xs font-bold text-emerald-100 tracking-wider">
              SPIN DASH!
            </span>

            <span className="text-[10px] font-mono text-white/85 mt-0.5">
              スピン: {Math.round(spinGauge)}%
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
