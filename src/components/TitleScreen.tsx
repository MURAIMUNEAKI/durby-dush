import React, { useEffect } from 'react';
import { Play, Volume2, VolumeX, HelpCircle, Smartphone, Monitor, Disc, ShieldAlert, Award } from 'lucide-react';
import { Course, HorseProfile, GameOrientation } from '../types/game';
import { HORSES, COURSES } from '../data/coursesAndHorses';
import { HorsePreview } from './HorsePreview';

interface TitleScreenProps {
  selectedHorse: HorseProfile;
  selectedCourse: Course;
  onSelectHorse: (horse: HorseProfile) => void;
  onSelectCourse: (course: Course) => void;
  onStartRace: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  orientation: GameOrientation;
  onToggleOrientation: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedHorse,
  selectedCourse,
  onSelectHorse,
  onSelectCourse,
  onStartRace,
  isMuted,
  onToggleMute,
  orientation,
  onToggleOrientation,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onStartRace();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStartRace]);

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 pb-24 md:pb-28">
      {/* Top Bar Contract: 3 Zones */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3.5 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="text-emerald-400">GO! GO! ZEPPELI</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              障害レース
            </span>
          </span>
        </div>

        {/* Zone 2: Navigation */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400 font-medium">
          <span>自動疾走</span>
          <span aria-hidden="true">·</span>
          <span>障害物回避 & ジャンプ</span>
          <span aria-hidden="true">·</span>
          <span>黄金の回転ダッシュ</span>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* Orientation Toggle */}
          <button
            onClick={onToggleOrientation}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold"
            title="縦向き / 横向きの切り替え"
          >
            {orientation === 'portrait' ? (
              <>
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>縦向き</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span>横向き</span>
              </>
            )}
          </button>

          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={isMuted ? 'サウンドON' : 'ミュート'}
            aria-label="Sound Toggle"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Quick Start Button */}
          <button
            onClick={onStartRace}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>レース出走！</span>
          </button>
        </div>
      </header>

      {/* Hero Visual Banner Section (Clickable) */}
      <div className="relative w-full max-w-6xl mx-auto px-4 pt-4 md:pt-6 pb-2">
        <div
          onClick={onStartRace}
          className="group cursor-pointer relative rounded-3xl overflow-hidden border border-slate-800 hover:border-emerald-400/60 shadow-2xl transition-all duration-200"
        >
          <div className="h-64 sm:h-72 md:h-80 w-full relative">
            <img
              src="/src/assets/images/zeppeli_gallop_hero_1790915463058.jpg"
              alt="GO! GO! ZEPPELI Hero Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {/* Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-5 md:p-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                <Disc className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Steel Ball Run Style Obstacle Racing · クリックで即出走</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                GO! GO! ZEPPELI
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-200 mt-1 max-w-2xl text-balance font-medium">
                連打不要の自動疾走！立ちはだかる巨大落石・生垣ハードル・サボテンをかわし、鉄球のスピンで大陸横断ゴールを目指せ！
              </p>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartRace();
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-green-600 group-hover:brightness-110 text-slate-950 font-black text-sm md:text-base flex items-center gap-2 shadow-xl shadow-emerald-600/40 active:scale-95 transition-all"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>愛馬でレーススタート！ [Space]</span>
                </button>
                <span className="text-xs text-emerald-300 font-semibold hidden sm:inline">
                  ※ 連打不要！回避・ジャンプ・スピンで勝負！
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Selection Area */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Horse Selection (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              1. 参戦騎手＆愛馬を選択
            </h2>
            <span className="text-xs text-slate-400 font-medium">大陸横断の猛者たち</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HORSES.map(horse => {
              const isSelected = selectedHorse.id === horse.id;
              return (
                <button
                  key={horse.id}
                  onClick={() => onSelectHorse(horse)}
                  className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/15'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm shrink-0"
                          style={{ backgroundColor: horse.coatColor }}
                        />
                        <span className="font-bold text-sm text-white">{horse.name}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-300 mb-1.5">
                        騎手: {horse.riderName} ({horse.colorName})
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                        {horse.description}
                      </p>
                    </div>

                    {/* Live Vertical Gallop Preview */}
                    <div className="shrink-0 flex flex-col items-center justify-center p-1 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <HorsePreview horse={horse} width={68} height={84} />
                      <span className="text-[9px] font-mono text-emerald-400 font-bold mt-0.5">縦向き疾走</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg px-2.5 py-1 mt-1">
                    ★ {horse.specialAbility}
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/20 px-2 py-0.5 rounded-full border border-emerald-400/40">
                      選択中 ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Guide Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2 mt-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>操作方法（連打不要・回避アクション）</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-emerald-400 font-bold block mb-0.5">↔️ レーン移動で回避</span>
                <span>左右ボタン または [A / D] で落石や障害物をかわす！</span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-blue-400 font-bold block mb-0.5">🦘 ジャンプ飛越</span>
                <span>[ジャンプ] ボタン または [S / ↑] で生垣やサボテンを跳躍！</span>
              </div>
              <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/50">
                <span className="text-amber-400 font-bold block mb-0.5">🌀 黄金の回転突進</span>
                <span>鉄球回収やギリギリ回避でスピンを溜め [Space] で無敵突破！</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Stage Selection (5 cols) */}
        <section className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                2. 大陸横断ステージを選択
              </h2>
              <span className="text-xs text-slate-400 font-medium">全4ステージ</span>
            </div>

            <div className="space-y-2.5">
              {COURSES.map(course => {
                const isSelected = selectedCourse.id === course.id;
                return (
                  <button
                    key={course.id}
                    onClick={() => onSelectCourse(course)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/15'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {course.grade}
                        </span>
                        <span className="font-bold text-sm text-white">{course.name}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
                        {course.distance}m
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1.5">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>障害密度: <strong className="text-slate-200">{course.obstacleDensity}</strong></span>
                      {isSelected && (
                        <span className="text-emerald-400 font-bold">選択中 ✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Launch Big Button in Column */}
          <div className="pt-2">
            <button
              onClick={onStartRace}
              className="w-full py-4 md:py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-lg md:text-xl flex items-center justify-center gap-3 shadow-2xl shadow-emerald-600/40 active:scale-95 transition-all cursor-pointer group"
            >
              <Play className="w-6 h-6 fill-slate-950 group-hover:scale-110 transition-transform" />
              <span>GO! GO! ZEPPELI レース出走！</span>
            </button>
            <div className="text-center text-[11px] text-slate-400 mt-2">
              出走: {selectedHorse.name} × {selectedCourse.name}
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Floating Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 md:p-4 z-40 shadow-2xl flex items-center justify-between gap-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/40"
            style={{ backgroundColor: selectedHorse.coatColor }}
          />
          <div className="flex flex-col truncate">
            <span className="text-xs md:text-sm font-bold text-white truncate">
              {selectedHorse.name}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {selectedCourse.name} ({selectedCourse.distance}m)
            </span>
          </div>
        </div>

        <button
          onClick={onStartRace}
          className="shrink-0 px-5 md:px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:brightness-110 text-slate-950 font-black text-sm md:text-base flex items-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-95 transition-all"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>レース出走！</span>
        </button>
      </div>
    </div>
  );
};
