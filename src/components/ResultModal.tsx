import React, { useEffect, useState } from 'react';
import { Trophy, Clock, Zap, ShieldCheck, RefreshCw, ListFilter, Disc, Sparkles } from 'lucide-react';
import { RaceStats } from '../types/game';

interface ResultModalProps {
  stats: RaceStats;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  stats,
  onRestart,
  onBackToMenu,
}) => {
  const [highScores, setHighScores] = useState<RaceStats[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zeppeli_high_scores');
      let records: RaceStats[] = saved ? JSON.parse(saved) : [];
      records.push(stats);
      records.sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        return a.finishTime - b.finishTime;
      });
      records = records.slice(0, 5);
      localStorage.setItem('zeppeli_high_scores', JSON.stringify(records));
      setHighScores(records);
    } catch {
      // fallback
    }
  }, [stats]);

  let grade = 'B';
  if (stats.rank === 1 && stats.obstaclesHit === 0) {
    grade = 'S';
  } else if (stats.rank === 1) {
    grade = 'A';
  } else if (stats.rank <= 3) {
    grade = 'B';
  } else {
    grade = 'C';
  }

  const isWinner = stats.rank === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl p-6 md:p-8 text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-3">
            <img
              src="/src/assets/images/steel_ball_spin_icon_1790915476779.jpg"
              alt="Steel Ball Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-2xl border-2 border-emerald-400/80 shadow-lg shadow-emerald-500/30"
            />
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full shadow">
              RANK {grade}
            </div>
          </div>

          <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
            GO! GO! ZEPPELI · {stats.courseName}
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            {isWinner ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Trophy className="w-7 h-7 inline text-amber-400" /> 第1位・見事優勝！
              </span>
            ) : (
              <span>第{stats.rank}位でゴールイン！</span>
            )}
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            愛馬 <span className="text-white font-bold">{stats.horseName}</span> と掴んだ栄光の記録
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-3 flex flex-col">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              走破タイム
            </span>
            <span className="text-xl font-black font-mono text-white mt-1 tabular-nums">
              {stats.finishTime} <span className="text-xs font-normal text-slate-400">秒</span>
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-3 flex flex-col">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              ギリギリ回避 (Near Miss)
            </span>
            <span className="text-xl font-black font-mono text-emerald-400 mt-1 tabular-nums">
              {stats.nearMisses} <span className="text-xs font-normal text-slate-400">回成功</span>
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-3 flex flex-col">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              障害物クリア数
            </span>
            <span className="text-xl font-black font-mono text-teal-300 mt-1 tabular-nums">
              {stats.obstaclesCleared} <span className="text-xs font-normal text-slate-400">個 (激突: {stats.obstaclesHit})</span>
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-3 flex flex-col">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Disc className="w-3.5 h-3.5 text-emerald-400" />
              回収した鉄球
            </span>
            <span className="text-xl font-black font-mono text-emerald-400 mt-1 tabular-nums">
              {stats.steelBallsCollected} <span className="text-xs font-normal text-slate-400">個獲得</span>
            </span>
          </div>
        </div>

        {/* High Scores */}
        {highScores.length > 0 && (
          <div className="bg-slate-950/60 rounded-2xl p-3 mb-5 border border-slate-800">
            <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
              <ListFilter className="w-3.5 h-3.5 text-emerald-400" />
              <span>歴代最高記録（殿堂入り）</span>
            </div>
            <div className="space-y-1 text-xs">
              {highScores.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300 font-mono py-1 border-b border-slate-800/60 last:border-none">
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">#{idx + 1}</span>
                    <span className="text-slate-200">{rec.horseName}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-teal-400">{rec.finishTime}s</span>
                    <span className="text-emerald-400 font-bold">{rec.nearMisses}回回避</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>同じステージで再挑戦</span>
          </button>

          <button
            onClick={onBackToMenu}
            className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 active:scale-95 transition-all"
          >
            ステージ選択へ
          </button>
        </div>
      </div>
    </div>
  );
};
