import React, { useState, useCallback, useRef } from 'react';
import { GameState, HorseProfile, Course, RaceStats, GameOrientation } from './types/game';
import { HORSES, COURSES } from './data/coursesAndHorses';
import { TitleScreen } from './components/TitleScreen';
import { RaceCanvas, RaceCanvasHandle } from './components/RaceCanvas';
import { HUD } from './components/HUD';
import { Controls } from './components/Controls';
import { CountdownOverlay } from './components/CountdownOverlay';
import { ResultModal } from './components/ResultModal';
import { sound } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [orientation, setOrientation] = useState<GameOrientation>('portrait');
  const [selectedHorse, setSelectedHorse] = useState<HorseProfile>(HORSES[0]);
  const [selectedCourse, setSelectedCourse] = useState<Course>(COURSES[0]); // Default to Stage 1 Coast

  // Ref to canvas imperative handle
  const canvasHandleRef = useRef<RaceCanvasHandle | null>(null);

  // Realtime HUD states
  const [currentSpeed, setCurrentSpeed] = useState(62);
  const [maxSpeed, setMaxSpeed] = useState(selectedHorse.baseMaxSpeed);
  const [stamina, setStamina] = useState(selectedHorse.staminaMax);
  const [maxStamina, setMaxStamina] = useState(selectedHorse.staminaMax);
  const [distanceLeft, setDistanceLeft] = useState(selectedCourse.distance);
  const [spinGauge, setSpinGauge] = useState(30);
  const [combo, setCombo] = useState(0);

  // Result stats
  const [lastStats, setLastStats] = useState<RaceStats | null>(null);

  // Sound state
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  const handleToggleMute = useCallback(() => {
    const next = sound.toggleMute();
    setIsMuted(next);
  }, []);

  const handleToggleOrientation = useCallback(() => {
    setOrientation(o => (o === 'portrait' ? 'landscape' : 'portrait'));
  }, []);

  const handleStartRace = useCallback(() => {
    setDistanceLeft(selectedCourse.distance);
    setStamina(selectedHorse.staminaMax);
    setMaxStamina(selectedHorse.staminaMax);
    setMaxSpeed(selectedHorse.baseMaxSpeed);
    setCurrentSpeed(62);
    setSpinGauge(30);
    setCombo(0);
    setGameState('COUNTDOWN');
  }, [selectedCourse, selectedHorse]);

  const handleCountdownComplete = useCallback(() => {
    setGameState('RACING');
  }, []);

  const handleGoal = useCallback((stats: RaceStats) => {
    setLastStats(stats);
    setGameState('RESULT');
  }, []);

  const handleSpeedChange = useCallback(
    (
      spd: number,
      maxSpd: number,
      stam: number,
      maxStam: number,
      distRemaining: number,
      spin: number,
      curCombo: number
    ) => {
      setCurrentSpeed(spd);
      setMaxSpeed(maxSpd);
      setStamina(stam);
      setMaxStamina(maxStam);
      setDistanceLeft(distRemaining);
      setSpinGauge(spin);
      setCombo(curCombo);
    },
    []
  );

  const handleRestart = useCallback(() => {
    setGameState('COUNTDOWN');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setGameState('TITLE');
  }, []);

  // Direct imperative triggers
  const handleSpinDash = useCallback(() => {
    canvasHandleRef.current?.spinDash();
  }, []);

  const handleJump = useCallback(() => {
    canvasHandleRef.current?.jump();
  }, []);

  const handleMoveLeft = useCallback(() => {
    canvasHandleRef.current?.moveLeft();
  }, []);

  const handleMoveRight = useCallback(() => {
    canvasHandleRef.current?.moveRight();
  }, []);

  return (
    <div
      className={`relative w-full ${
        gameState === 'TITLE'
          ? 'min-h-screen overflow-y-auto bg-slate-950'
          : 'h-screen overflow-hidden bg-slate-950 select-none'
      } font-sans`}
    >
      {gameState === 'TITLE' && (
        <TitleScreen
          selectedHorse={selectedHorse}
          selectedCourse={selectedCourse}
          onSelectHorse={setSelectedHorse}
          onSelectCourse={setSelectedCourse}
          onStartRace={handleStartRace}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          orientation={orientation}
          onToggleOrientation={handleToggleOrientation}
        />
      )}

      {(gameState === 'COUNTDOWN' || gameState === 'RACING' || gameState === 'GOAL_SLOWMO' || gameState === 'RESULT') && (
        <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
          {/* Background backdrop on desktop */}
          {orientation === 'portrait' && (
            <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden hidden md:block">
              <img
                src="/src/assets/images/racecourse_turf_bg_1790914622871.jpg"
                alt="Backdrop"
                className="w-full h-full object-cover filter blur-xl"
              />
            </div>
          )}

          {/* Game Viewport Container */}
          <div
            className={`relative w-full h-full ${
              orientation === 'portrait'
                ? 'max-w-md sm:max-w-lg md:border-x md:border-slate-800 shadow-2xl'
                : 'max-w-none'
            } bg-slate-900 overflow-hidden flex flex-col`}
          >
            {/* Race Viewport Canvas */}
            <RaceCanvas
              ref={canvasHandleRef}
              key={`${selectedHorse.id}_${selectedCourse.id}_${orientation}_${gameState === 'COUNTDOWN' ? 'fresh' : 'active'}`}
              course={selectedCourse}
              playerHorse={selectedHorse}
              onGoal={handleGoal}
              onSpeedChange={handleSpeedChange}
              isRacing={gameState === 'RACING'}
              orientation={orientation}
            />

            {/* Compact HUD Overlay */}
            <HUD
              course={selectedCourse}
              playerHorse={selectedHorse}
              currentSpeed={currentSpeed}
              maxSpeed={maxSpeed}
              stamina={stamina}
              maxStamina={maxStamina}
              distanceLeft={distanceLeft}
              spinGauge={spinGauge}
              combo={combo}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onExitRace={handleBackToMenu}
              orientation={orientation}
              onToggleOrientation={handleToggleOrientation}
            />

            {/* Interactive Touch & Mouse Controls */}
            {gameState === 'RACING' && (
              <Controls
                onSpinDash={handleSpinDash}
                onMoveLeft={handleMoveLeft}
                onMoveRight={handleMoveRight}
                onJump={handleJump}
                isRacing={gameState === 'RACING'}
                spinGauge={spinGauge}
                orientation={orientation}
              />
            )}

            {/* Gate Countdown Overlay */}
            {gameState === 'COUNTDOWN' && (
              <CountdownOverlay onComplete={handleCountdownComplete} />
            )}

            {/* Result / Victory Modal */}
            {gameState === 'RESULT' && lastStats && (
              <ResultModal
                stats={lastStats}
                onRestart={handleRestart}
                onBackToMenu={handleBackToMenu}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
