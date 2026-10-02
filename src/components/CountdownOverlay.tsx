import React, { useEffect, useState } from 'react';
import { sound } from '../utils/audio';

interface CountdownOverlayProps {
  onComplete: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete }) => {
  const [count, setCount] = useState<number | string>(3);

  useEffect(() => {
    sound.playBeep(false);

    const timer1 = setTimeout(() => {
      setCount(2);
      sound.playBeep(false);
    }, 800);

    const timer2 = setTimeout(() => {
      setCount(1);
      sound.playBeep(false);
    }, 1600);

    const timer3 = setTimeout(() => {
      setCount('START!!');
      sound.playBeep(true);
    }, 2400);

    const timer4 = setTimeout(() => {
      onComplete();
    }, 2900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm cursor-pointer select-none"
    >
      <div className="text-center p-6">
        <div className="text-amber-400 font-bold tracking-widest text-sm md:text-base mb-2 uppercase drop-shadow">
          GATE OPEN READY...
        </div>
        <div
          key={String(count)}
          className="text-7xl md:text-9xl font-black text-white font-mono tracking-tighter drop-shadow-2xl animate-in zoom-in-50 duration-200"
        >
          {typeof count === 'number' ? (
            <span className="text-amber-400">{count}</span>
          ) : (
            <span className="text-rose-500">{count}</span>
          )}
        </div>
        <div className="text-slate-300 text-xs md:text-sm font-semibold mt-4">
          ボタンまたはスペースキーを連打してロケットスタート！
        </div>
        <div className="mt-2 text-[11px] text-amber-300/80 bg-slate-900/80 px-3 py-1 rounded-full inline-block border border-amber-400/30">
          ※ 画面クリックでカウントダウンをスキップ
        </div>
      </div>
    </div>
  );
};
