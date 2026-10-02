import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Course, HorseProfile, ObstacleType, RaceObstacle, RaceItem, RivalHorse, RaceStats } from '../types/game';
import { sound } from '../utils/audio';
import { drawVerticalHorse } from '../utils/horseRenderer';

export interface RaceCanvasHandle {
  spinDash: () => void;
  jump: () => void;
  moveLeft: () => void;
  moveRight: () => void;
}

interface RaceCanvasProps {
  course: Course;
  playerHorse: HorseProfile;
  onGoal: (stats: RaceStats) => void;
  onSpeedChange: (
    speed: number,
    maxSpeed: number,
    stamina: number,
    maxStamina: number,
    distanceLeft: number,
    spinGauge: number,
    combo: number
  ) => void;
  isRacing: boolean;
  orientation?: 'portrait' | 'landscape';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export const RaceCanvas = forwardRef<RaceCanvasHandle, RaceCanvasProps>(({
  course,
  playerHorse,
  onGoal,
  onSpeedChange,
  isRacing,
  orientation = 'portrait',
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game State Ref
  const gameStateRef = useRef({
    distance: 0,
    speed: 62, // in km/h (Automatic cruising speed)
    targetSpeed: 62,
    baseCruisingSpeed: 62,
    maxSpeed: playerHorse.baseMaxSpeed + 10,
    stamina: playerHorse.staminaMax,
    maxStamina: playerHorse.staminaMax,
    spinGauge: 30, // 0 to 100
    combo: 0,
    nearMisses: 0,
    lane: 1.5, // 0 to 3 float
    targetLane: 1.5,
    isJumping: false,
    jumpProgress: 0,
    jumpHeight: 0,
    stumbleTimer: 0,
    spinDashTimer: 0, // seconds of active Golden Spin Dash
    obstaclesCleared: 0,
    obstaclesHit: 0,
    steelBallsCollected: 0,
    carrotsCollected: 0,
    topSpeedReached: 62,
    startTime: 0,
    elapsedTime: 0,
    hasFinished: false,
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    obstacles: [] as RaceObstacle[],
    items: [] as RaceItem[],
    rivals: [] as RivalHorse[],
    screenShake: 0,
  });

  const nextTextId = useRef(1);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Generate course obstacles, items, and rivals on init
  useEffect(() => {
    const totalDist = course.distance;
    const obstacles: RaceObstacle[] = [];
    const items: RaceItem[] = [];

    // Frequency based on density
    let stepDist = 55;
    if (course.obstacleDensity === 'LOW') stepDist = 80;
    if (course.obstacleDensity === 'HIGH') stepDist = 42;
    if (course.obstacleDensity === 'EXTREME') stepDist = 32;

    let obsId = 1;
    let itemId = 1;

    for (let d = 90; d < totalDist - 100; d += stepDist) {
      const actualD = d + (Math.random() * 16 - 8);
      const lane = Math.floor(Math.random() * 4);

      // Obstacle distribution
      const rand = Math.random();
      let type: ObstacleType = 'HURDLE';
      if (rand < 0.35) type = 'HURDLE';
      else if (rand < 0.65) type = 'BOULDER';
      else if (rand < 0.85) type = 'MUD';
      else type = 'CACTUS';

      obstacles.push({
        id: obsId++,
        type,
        distance: actualD,
        lane,
        width: 0.85,
      });

      // Spawn Steel Ball or Golden Carrot in a different lane
      if (Math.random() < 0.5) {
        const itemLane = (lane + (Math.random() > 0.5 ? 1 : 3)) % 4;
        const itemType = Math.random() < 0.65 ? 'STEEL_BALL' : 'GOLDEN_CARROT';
        items.push({
          id: itemId++,
          type: itemType,
          distance: actualD + (Math.random() * 25 - 12),
          lane: itemLane,
        });
      }
    }

    // Rivals (SBR themed competitors)
    const rivalTemplates = [
      { name: 'スローダンサー', rider: 'ジョニィ', coat: '#94A3B8', mane: '#F8FAFC', jockey: '#3B82F6', targetSpd: 65 },
      { name: 'シルバーバレット', rider: 'ディエゴ', coat: '#1C1917', mane: '#0C0A09', jockey: '#EAB308', targetSpd: 68 },
      { name: 'ヘイ・ヤー', rider: 'ポコロコ', coat: '#78350F', mane: '#451A03', jockey: '#EF4444', targetSpd: 64 },
      { name: 'エル・コンドル', rider: 'サンドマン', coat: '#57534E', mane: '#292524', jockey: '#14B8A6', targetSpd: 66 },
    ];

    const rivals: RivalHorse[] = rivalTemplates.map((t, idx) => ({
      id: `rival_${idx}`,
      name: t.name,
      riderName: t.rider,
      coatColor: t.coat,
      maneColor: t.mane,
      jockeyColor: t.jockey,
      currentDistance: 10 + idx * 12,
      speed: 60 + Math.random() * 4,
      targetSpeed: t.targetSpd,
      lane: idx,
      targetLane: idx,
      yJump: 0,
      isJumping: false,
      stumbleTimer: 0,
    }));

    gameStateRef.current = {
      ...gameStateRef.current,
      distance: 0,
      speed: 62,
      targetSpeed: 62,
      baseCruisingSpeed: 62,
      maxSpeed: playerHorse.baseMaxSpeed + 10,
      stamina: playerHorse.staminaMax,
      maxStamina: playerHorse.staminaMax,
      spinGauge: 30,
      combo: 0,
      nearMisses: 0,
      lane: 1.5,
      targetLane: 1.5,
      isJumping: false,
      jumpProgress: 0,
      jumpHeight: 0,
      stumbleTimer: 0,
      spinDashTimer: 0,
      obstaclesCleared: 0,
      obstaclesHit: 0,
      steelBallsCollected: 0,
      carrotsCollected: 0,
      topSpeedReached: 62,
      startTime: performance.now(),
      elapsedTime: 0,
      hasFinished: false,
      particles: [],
      floatingTexts: [],
      obstacles,
      items,
      rivals,
      screenShake: 0,
    };
  }, [course, playerHorse]);

  // Activate Golden Spin Dash
  const handleSpinDash = useCallback(() => {
    if (!isRacing || gameStateRef.current.hasFinished) return;
    const state = gameStateRef.current;

    if (state.spinGauge < 30 && state.spinDashTimer <= 0) {
      addFloatingText('スピン不足！', '#94A3B8');
      return;
    }

    sound.playSpinDash();
    state.spinDashTimer = 4.0; // 4 seconds invincible rush
    state.spinGauge = Math.max(0, state.spinGauge - 40);
    state.targetSpeed = state.maxSpeed + 8;
    addFloatingText('黄金の回転突進！！', '#10B981');

    // Spin emerald sparks
    for (let i = 0; i < 12; i++) {
      state.particles.push({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 120,
        vy: -Math.random() * 80 - 40,
        size: Math.random() * 5 + 3,
        color: '#10B981',
        alpha: 1.0,
        life: 0,
        maxLife: 0.5,
      });
    }
  }, [isRacing]);

  // Jump Action
  const handleJump = useCallback(() => {
    if (!isRacing || gameStateRef.current.hasFinished) return;
    const state = gameStateRef.current;
    if (state.isJumping) return;

    sound.playJump();
    state.isJumping = true;
    state.jumpProgress = 0;
    state.jumpHeight = 0;

    addFloatingText('JUMP!', '#60A5FA');
  }, [isRacing]);

  // Move Left / Right
  const handleMoveLane = useCallback((direction: 'left' | 'right') => {
    if (!isRacing || gameStateRef.current.hasFinished) return;
    const state = gameStateRef.current;
    const step = 1.0;
    if (direction === 'left') {
      state.targetLane = Math.max(0, Math.round(state.targetLane - step));
    } else {
      state.targetLane = Math.min(3, Math.round(state.targetLane + step));
    }
  }, [isRacing]);

  // Imperative handle
  useImperativeHandle(ref, () => ({
    spinDash: handleSpinDash,
    jump: handleJump,
    moveLeft: () => handleMoveLane('left'),
    moveRight: () => handleMoveLane('right'),
  }), [handleSpinDash, handleJump, handleMoveLane]);

  const addFloatingText = (text: string, color: string) => {
    const state = gameStateRef.current;
    state.floatingTexts.push({
      id: nextTextId.current++,
      x: 0,
      y: 0,
      text,
      color,
      alpha: 1.0,
      vy: -60,
    });
  };

  // Direct canvas pointer handlers
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isRacing || gameStateRef.current.hasFinished) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    touchStartRef.current = { x, y, time: performance.now() };

    // Tap on left 40% -> steer left
    if (x < w * 0.4) {
      handleMoveLane('left');
    } else if (x > w * 0.6) {
      // Tap on right 40% -> steer right
      handleMoveLane('right');
    } else {
      // Center tap -> Jump!
      handleJump();
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isRacing || !touchStartRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const endY = e.clientY - rect.top;
    const diffY = touchStartRef.current.y - endY;
    if (diffY > 30) {
      handleJump();
    }
    touchStartRef.current = null;
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['KeyA', 'ArrowLeft'].includes(e.code)) {
        e.preventDefault();
        handleMoveLane('left');
      } else if (['KeyD', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        handleMoveLane('right');
      } else if (['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown', 'KeyJ'].includes(e.code)) {
        e.preventDefault();
        handleJump();
      } else if (['Space', 'Enter'].includes(e.code)) {
        e.preventDefault();
        handleSpinDash();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump, handleMoveLane, handleSpinDash]);

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let hoofbeatAccumulator = 0;

    const render = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const width = canvas.clientWidth || 420;
      const height = canvas.clientHeight || 750;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const state = gameStateRef.current;

      // Update state when racing
      if (isRacing && !state.hasFinished) {
        state.elapsedTime += dt;

        // Timers
        if (state.stumbleTimer > 0) state.stumbleTimer -= dt;
        if (state.spinDashTimer > 0) state.spinDashTimer -= dt;

        // Lane smoothing
        const laneSpeed = 10 * playerHorse.agility;
        state.lane += (state.targetLane - state.lane) * Math.min(1, dt * laneSpeed);

        // Jump physics
        if (state.isJumping) {
          const jumpDuration = playerHorse.id === 'slow_dancer' ? 0.75 : 0.6;
          state.jumpProgress += dt / jumpDuration;
          if (state.jumpProgress >= 1.0) {
            state.isJumping = false;
            state.jumpProgress = 0;
            state.jumpHeight = 0;
          } else {
            const p = state.jumpProgress;
            state.jumpHeight = Math.sin(p * Math.PI) * (playerHorse.id === 'slow_dancer' ? 110 : 92);
          }
        }

        // Automatic Cruising Speed (Increases as combo builds)
        const targetCruising = state.spinDashTimer > 0
          ? state.maxSpeed + 8
          : state.baseCruisingSpeed + Math.min(15, state.combo * 1.5);

        state.speed += (targetCruising - state.speed) * Math.min(1, dt * 2.5);

        // Top speed record
        if (state.speed > state.topSpeedReached) {
          state.topSpeedReached = Math.round(state.speed);
        }

        // Advance distance (m/s = speed / 3.6)
        const metersPerSec = Math.max(12, state.speed / 3.6);
        state.distance += metersPerSec * dt;

        // Audio Hoofbeats
        hoofbeatAccumulator += dt;
        const hoofInterval = Math.max(0.12, 0.35 - (state.speed / 100) * 0.2);
        if (hoofbeatAccumulator >= hoofInterval) {
          hoofbeatAccumulator = 0;
          sound.playSingleHoofbeat(state.speed / 65);
        }

        // Near goal crowd cheer
        if (course.distance - state.distance < 300 && Math.random() < 0.02) {
          sound.playCheerSwell();
        }

        // Update Rivals
        state.rivals.forEach((r, idx) => {
          const distToEnd = course.distance - r.currentDistance;
          let burst = 0;
          if (distToEnd < 400) {
            burst = 4 + (idx % 2) * 3;
          }
          if (Math.random() < 0.015) {
            r.targetLane = Math.floor(Math.random() * 4);
          }
          r.lane += (r.targetLane - r.lane) * Math.min(1, dt * 2.5);

          const rTarget = r.targetSpeed + burst + Math.sin(now * 0.001 + idx) * 3;
          r.speed += (rTarget - r.speed) * Math.min(1, dt * 2);
          r.currentDistance += (Math.max(10, r.speed / 3.6)) * dt;
        });

        // Obstacle Collisions & Near Miss Detections
        state.obstacles.forEach(obs => {
          const relDist = obs.distance - state.distance;

          // Check if player passed obstacle safely
          if (relDist < -2 && !obs.cleared && !obs.hit) {
            obs.cleared = true;
            state.obstaclesCleared++;
            state.combo++;
          }

          // Near Miss Detection! (Barely avoiding an obstacle in an adjacent lane)
          if (Math.abs(relDist) < 1.2 && !obs.nearMissAwarded && !obs.hit) {
            const laneDiff = Math.abs(state.lane - obs.lane);
            if (laneDiff >= 0.65 && laneDiff <= 1.25) {
              obs.nearMissAwarded = true;
              state.nearMisses++;
              sound.playNearMiss();
              const spinBoost = playerHorse.id === 'valkyrie' ? 24 : 15;
              state.spinGauge = Math.min(100, state.spinGauge + spinBoost);
              state.combo++;
              addFloatingText(`NEAR MISS! +SPIN`, '#10B981');
            }
          }

          // Collision detection window (-1.4m to +1.4m)
          if (Math.abs(relDist) < 1.4 && !obs.hit && !obs.cleared) {
            const laneDiff = Math.abs(state.lane - obs.lane);
            if (laneDiff < 0.6) {
              // Check if jump or spin dash clears it
              const isSpinActive = state.spinDashTimer > 0;
              const canBeJumped = obs.type === 'HURDLE' || obs.type === 'MUD' || obs.type === 'CACTUS';
              const jumped = state.isJumping && state.jumpHeight > 40 && canBeJumped;

              if (isSpinActive) {
                // Golden Spin Dash smashes obstacles!
                obs.cleared = true;
                state.obstaclesCleared++;
                state.combo++;
                sound.playCarrot();
                addFloatingText('SPIN SMASH!!', '#34D399');
              } else if (jumped) {
                // Clean Jump
                obs.cleared = true;
                state.obstaclesCleared++;
                state.combo++;
                state.spinGauge = Math.min(100, state.spinGauge + 10);
                sound.playCarrot();
                addFloatingText('CLEAN JUMP!', '#38BDF8');
              } else {
                // HIT! (Damage & Momentum Lost)
                obs.hit = true;
                state.obstaclesHit++;
                state.combo = 0; // reset combo
                sound.playHit();
                state.screenShake = 0.35;
                state.stumbleTimer = 0.8;

                if (obs.type === 'BOULDER') {
                  state.speed = Math.max(20, state.speed * 0.4);
                  state.stamina = Math.max(0, state.stamina - 20);
                  addFloatingText('大岩に激突！ 失速！', '#EF4444');
                } else if (obs.type === 'MUD') {
                  const reduce = playerHorse.id === 'hey_ya' ? 0.8 : 0.6;
                  state.speed = Math.max(25, state.speed * reduce);
                  addFloatingText('流砂・泥水に足を取られた！', '#F97316');
                } else if (obs.type === 'CACTUS') {
                  state.speed = Math.max(25, state.speed * 0.55);
                  state.stamina = Math.max(0, state.stamina - 15);
                  addFloatingText('サボテン接触！', '#EF4444');
                } else {
                  // Hurdle
                  state.speed = Math.max(25, state.speed * 0.5);
                  addFloatingText('生垣に激突！', '#DC2626');
                }
              }
            }
          }
        });

        // Items Collection (Steel Balls & Carrots)
        state.items.forEach(item => {
          if (item.collected) return;
          const relDist = item.distance - state.distance;
          if (Math.abs(relDist) < 1.6) {
            const laneDiff = Math.abs(state.lane - item.lane);
            if (laneDiff < 0.7) {
              item.collected = true;
              if (item.type === 'STEEL_BALL') {
                sound.playNearMiss();
                state.steelBallsCollected++;
                state.spinGauge = Math.min(100, state.spinGauge + 30);
                state.combo++;
                addFloatingText('鉄球回収！ SPIN +30%', '#10B981');
              } else {
                sound.playCarrot();
                state.carrotsCollected++;
                state.stamina = Math.min(state.maxStamina, state.stamina + 30);
                addFloatingText('人参！ スタミナ回復', '#F59E0B');
              }
            }
          }
        });

        // Notify parent HUD
        const distLeft = Math.max(0, course.distance - state.distance);
        onSpeedChange(
          state.speed,
          state.maxSpeed,
          state.stamina,
          state.maxStamina,
          distLeft,
          state.spinGauge,
          state.combo
        );

        // Check Goal
        if (state.distance >= course.distance && !state.hasFinished) {
          state.hasFinished = true;
          sound.playFanfare();

          const allHorses = [
            { name: playerHorse.name, dist: state.distance, isPlayer: true },
            ...state.rivals.map(r => ({ name: r.name, dist: r.currentDistance, isPlayer: false })),
          ].sort((a, b) => b.dist - a.dist);

          const playerRank = allHorses.findIndex(h => h.isPlayer) + 1;

          const stats: RaceStats = {
            finishTime: Number(state.elapsedTime.toFixed(2)),
            rank: playerRank,
            topSpeed: state.topSpeedReached,
            obstaclesCleared: state.obstaclesCleared,
            obstaclesHit: state.obstaclesHit,
            nearMisses: state.nearMisses,
            steelBallsCollected: state.steelBallsCollected,
            carrotsCollected: state.carrotsCollected,
            totalDistance: course.distance,
            horseName: playerHorse.name,
            courseName: course.name,
            date: new Date().toLocaleDateString('ja-JP'),
          };

          setTimeout(() => {
            onGoal(stats);
          }, 1800);
        }
      }

      // Screen Shake
      if (state.screenShake > 0) {
        state.screenShake -= dt;
        const shakeX = (Math.random() - 0.5) * 12;
        const shakeY = (Math.random() - 0.5) * 8;
        ctx.translate(shakeX, shakeY);
      }

      const isPortrait = orientation === 'portrait' || height > width;

      // Draw routine
      drawBackground(ctx, width, height, course.skyTheme, state.distance, state.speed, isPortrait);
      drawTrack(ctx, width, height, state.distance, state.speed, course.trackType, isPortrait);
      drawCourseObjects(ctx, width, height, state, isPortrait);
      drawRivals(ctx, width, height, state, isPortrait);
      drawPlayerHorse(ctx, width, height, state, playerHorse, isPortrait);
      drawSpeedLinesAndParticles(ctx, width, height, state, dt, isPortrait);
      drawFloatingTexts(ctx, width, height, state, dt, isPortrait);

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [course, playerHorse, isRacing, onGoal, onSpeedChange, orientation]);

  // ---------------- DRAWING HELPERS ----------------

  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    skyTheme: 'day' | 'sunset' | 'overcast',
    dist: number,
    speed: number,
    isPortrait: boolean
  ) => {
    const horizon = isPortrait ? height * 0.23 : height * 0.38;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    if (skyTheme === 'sunset') {
      skyGrad.addColorStop(0, '#7C2D12');
      skyGrad.addColorStop(0.4, '#C2410C');
      skyGrad.addColorStop(0.8, '#F59E0B');
      skyGrad.addColorStop(1, '#FEF08A');
    } else if (skyTheme === 'overcast') {
      skyGrad.addColorStop(0, '#334155');
      skyGrad.addColorStop(0.7, '#64748B');
      skyGrad.addColorStop(1, '#94A3B8');
    } else {
      skyGrad.addColorStop(0, '#0284C7');
      skyGrad.addColorStop(0.6, '#38BDF8');
      skyGrad.addColorStop(1, '#BAE6FD');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizon);

    // Desert Canyon Buttes & Mountains
    ctx.fillStyle = skyTheme === 'sunset' ? '#5A1A05' : '#1E293B';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    const mountainStep = isPortrait ? 60 : 90;
    for (let x = 0; x <= width + mountainStep; x += mountainStep) {
      const my = horizon - (isPortrait ? 24 : 32) - Math.sin((x + dist * 0.05) * 0.015) * 20;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(width, horizon);
    ctx.closePath();
    ctx.fill();

    // Distant canyon mesa layer
    ctx.fillStyle = skyTheme === 'sunset' ? '#3B0D03' : '#0F172A';
    ctx.fillRect(0, horizon - 12, width, 12);
  };

  const drawTrack = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dist: number,
    speed: number,
    trackType: 'TURF' | 'DIRT' | 'DESERT',
    isPortrait: boolean
  ) => {
    const horizon = isPortrait ? height * 0.23 : height * 0.38;
    const trackBottom = isPortrait ? height * 0.90 : height;
    const horizonWidth = isPortrait ? width * 0.44 : width * 0.36;
    const horizonLeft = (width - horizonWidth) / 2;
    const horizonRight = horizonLeft + horizonWidth;

    // Desert/Wasteland borders outside track
    const borderGrad = ctx.createLinearGradient(0, horizon, 0, height);
    if (trackType === 'DESERT') {
      borderGrad.addColorStop(0, '#C2410C');
      borderGrad.addColorStop(1, '#9A3412');
    } else {
      borderGrad.addColorStop(0, '#15803D');
      borderGrad.addColorStop(1, '#166534');
    }
    ctx.fillStyle = borderGrad;
    ctx.fillRect(0, horizon, width, height - horizon);

    // Track surface
    const trackGrad = ctx.createLinearGradient(0, horizon, 0, height);
    if (trackType === 'DESERT' || trackType === 'DIRT') {
      trackGrad.addColorStop(0, '#B45309');
      trackGrad.addColorStop(0.5, '#92400E');
      trackGrad.addColorStop(1, '#78350F');
    } else {
      trackGrad.addColorStop(0, '#15803D');
      trackGrad.addColorStop(0.3, '#16A34A');
      trackGrad.addColorStop(1, '#22C55E');
    }

    ctx.fillStyle = trackGrad;
    ctx.beginPath();
    ctx.moveTo(horizonLeft, horizon);
    ctx.lineTo(horizonRight, horizon);
    ctx.lineTo(isPortrait ? width * 0.97 : width * 0.95, trackBottom);
    ctx.lineTo(isPortrait ? width * 0.03 : width * 0.05, trackBottom);
    ctx.closePath();
    ctx.fill();

    // Moving stripes
    const stripeDist = 20;
    const offset = (dist % stripeDist) / stripeDist;
    const numStripes = isPortrait ? 18 : 14;

    for (let i = 0; i < numStripes; i++) {
      const p1 = Math.pow((i + offset) / numStripes, isPortrait ? 2.6 : 2.2);
      const p2 = Math.pow((i + offset + 0.5) / numStripes, isPortrait ? 2.6 : 2.2);

      const y1 = horizon + (trackBottom - horizon) * p1;
      const y2 = horizon + (trackBottom - horizon) * p2;

      const xl1 = horizonLeft + ((isPortrait ? width * 0.03 : width * 0.05) - horizonLeft) * p1;
      const xr1 = horizonRight + ((isPortrait ? width * 0.97 : width * 0.95) - horizonRight) * p1;
      const xl2 = horizonLeft + ((isPortrait ? width * 0.03 : width * 0.05) - horizonLeft) * p2;
      const xr2 = horizonRight + ((isPortrait ? width * 0.97 : width * 0.95) - horizonRight) * p2;

      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.moveTo(xl1, y1);
        ctx.lineTo(xr1, y1);
        ctx.lineTo(xr2, y2);
        ctx.lineTo(xl2, y2);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Lane dividing dashed lines
    for (let laneIdx = 1; laneIdx <= 3; laneIdx++) {
      const laneFrac = laneIdx / 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);

      ctx.beginPath();
      const topX = horizonLeft + horizonWidth * laneFrac;
      const botX = (isPortrait ? width * 0.03 : width * 0.05) + ((isPortrait ? width * 0.94 : width * 0.9)) * laneFrac;
      ctx.moveTo(topX, horizon);
      ctx.lineTo(botX, trackBottom);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const projectCoord = (
    lane: number,
    relDist: number,
    width: number,
    height: number,
    isPortrait: boolean
  ): { x: number; y: number; scale: number; visible: boolean } => {
    const horizon = isPortrait ? height * 0.23 : height * 0.38;
    const trackBottom = isPortrait ? height * 0.88 : height * 0.92;
    const horizonWidth = isPortrait ? width * 0.44 : width * 0.36;
    const horizonLeft = (width - horizonWidth) / 2;

    const maxViewDist = isPortrait ? 180 : 140;
    if (relDist < -8 || relDist > maxViewDist) {
      return { x: 0, y: 0, scale: 0, visible: false };
    }

    const norm = Math.max(0, Math.min(1, 1 - relDist / maxViewDist));
    const p = Math.pow(norm, isPortrait ? 2.8 : 2.5);

    const y = horizon + (trackBottom - horizon) * p;
    const currentTrackLeft = horizonLeft + ((isPortrait ? width * 0.03 : width * 0.05) - horizonLeft) * p;
    const currentTrackRight = (horizonLeft + horizonWidth) + ((isPortrait ? width * 0.97 : width * 0.95) - (horizonLeft + horizonWidth)) * p;
    const currentTrackWidth = currentTrackRight - currentTrackLeft;

    const laneSlotWidth = currentTrackWidth / 4;
    const x = currentTrackLeft + (lane + 0.5) * laneSlotWidth;
    const scale = (isPortrait ? 0.18 : 0.15) + p * (isPortrait ? 0.82 : 0.85);

    return { x, y, scale, visible: true };
  };

  const drawCourseObjects = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: typeof gameStateRef.current,
    isPortrait: boolean
  ) => {
    const drawables: Array<{
      type: 'OBSTACLE' | 'ITEM' | 'GOAL_LINE' | 'DISTANCE_BOARD';
      distance: number;
      relDist: number;
      lane: number;
      data?: RaceObstacle | RaceItem | number;
    }> = [];

    const goalRel = course.distance - state.distance;
    const maxLook = isPortrait ? 180 : 140;
    if (goalRel > -20 && goalRel < maxLook) {
      drawables.push({ type: 'GOAL_LINE', distance: course.distance, relDist: goalRel, lane: 1.5 });
    }

    [800, 600, 400, 200, 100].forEach(m => {
      const markDist = course.distance - m;
      const rel = markDist - state.distance;
      if (rel > -10 && rel < maxLook) {
        drawables.push({ type: 'DISTANCE_BOARD', distance: markDist, relDist: rel, lane: 3.5, data: m });
      }
    });

    state.obstacles.forEach(obs => {
      const relDist = obs.distance - state.distance;
      if (relDist > -10 && relDist < maxLook) {
        drawables.push({ type: 'OBSTACLE', distance: obs.distance, relDist, lane: obs.lane, data: obs });
      }
    });

    state.items.forEach(item => {
      if (item.collected) return;
      const relDist = item.distance - state.distance;
      if (relDist > -10 && relDist < maxLook) {
        drawables.push({ type: 'ITEM', distance: item.distance, relDist, lane: item.lane, data: item });
      }
    });

    drawables.sort((a, b) => b.relDist - a.relDist);

    drawables.forEach(item => {
      const proj = projectCoord(item.lane, item.relDist, width, height, isPortrait);
      if (!proj.visible) return;

      if (item.type === 'GOAL_LINE') {
        drawGoalBanner(ctx, width, height, proj.y, proj.scale);
      } else if (item.type === 'DISTANCE_BOARD') {
        drawDistanceSign(ctx, proj.x, proj.y, proj.scale, item.data as number);
      } else if (item.type === 'OBSTACLE') {
        const obs = item.data as RaceObstacle;
        drawSingleObstacle(ctx, proj.x, proj.y, proj.scale, obs);
      } else if (item.type === 'ITEM') {
        const raceItem = item.data as RaceItem;
        drawSingleItem(ctx, proj.x, proj.y, proj.scale, raceItem);
      }
    });
  };

  const drawDistanceSign = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    metersLeft: number
  ) => {
    ctx.save();
    ctx.translate(x + 30 * scale, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(-3, -65, 6, 65);

    ctx.fillStyle = '#10B981';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-28, -100, 56, 38, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`残り`, 0, -86);
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`${metersLeft}m`, 0, -68);

    ctx.restore();
  };

  const drawGoalBanner = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    y: number,
    scale: number
  ) => {
    ctx.save();
    const tapeHeight = 12 * scale;
    ctx.fillStyle = '#10B981';
    ctx.fillRect(0, y - tapeHeight / 2, width, tapeHeight);

    ctx.fillStyle = '#FFFFFF';
    const boxSize = 16 * scale;
    for (let bx = 0; bx < width; bx += boxSize * 2) {
      ctx.fillRect(bx, y - tapeHeight / 2, boxSize, tapeHeight);
    }

    const archH = 120 * scale;
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 8 * scale;
    ctx.beginPath();
    ctx.moveTo(width * 0.05, y);
    ctx.lineTo(width * 0.05, y - archH);
    ctx.lineTo(width * 0.95, y - archH);
    ctx.lineTo(width * 0.95, y);
    ctx.stroke();

    ctx.fillStyle = '#064E3B';
    ctx.fillRect(width * 0.2, y - archH - 30 * scale, width * 0.6, 36 * scale);
    ctx.fillStyle = '#FEF08A';
    ctx.font = `bold ${Math.max(12, 24 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🏆 GO! GO! ZEPPELI · FINISH 🏆', width * 0.5, y - archH - 6 * scale);

    ctx.restore();
  };

  const drawSingleObstacle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    obs: RaceObstacle
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (obs.hit) {
      ctx.globalAlpha = 0.5;
    }

    if (obs.type === 'HURDLE') {
      // Steeplechase barrier
      const w = 70;
      const h = 40;

      ctx.fillStyle = '#78350F';
      ctx.fillRect(-w / 2 - 4, -h, 8, h);
      ctx.fillRect(w / 2 - 4, -h, 8, h);

      ctx.fillStyle = '#14532D';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h + 6, w, h - 6, [8, 8, 2, 2]);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-w / 2 - 6, -h - 4, w + 12, 10);
      ctx.fillStyle = '#10B981';
      ctx.fillRect(-18, -h - 4, 12, 10);
      ctx.fillRect(10, -h - 4, 12, 10);

    } else if (obs.type === 'BOULDER') {
      // Giant Canyon Boulder (落石)
      ctx.fillStyle = '#57534E';
      ctx.beginPath();
      ctx.ellipse(0, -18, 34, 26, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Rock highlights & cracks
      ctx.fillStyle = '#78716C';
      ctx.beginPath();
      ctx.ellipse(-8, -26, 18, 12, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Shadow crack
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-10, -32);
      ctx.lineTo(-4, -14);
      ctx.lineTo(8, -6);
      ctx.stroke();

    } else if (obs.type === 'CACTUS') {
      // Desert Cactus Patch (サボテン)
      ctx.fillStyle = '#15803D';
      // Main stem
      ctx.fillRect(-6, -42, 12, 42);
      // Left arm
      ctx.fillRect(-22, -32, 16, 8);
      ctx.fillRect(-22, -44, 8, 16);
      // Right arm
      ctx.fillRect(6, -26, 16, 8);
      ctx.fillRect(14, -38, 8, 16);

      // Thorns
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(-8, -36, 3, 2);
      ctx.fillRect(6, -34, 3, 2);

    } else {
      // Mud / Quicksand pool
      ctx.fillStyle = '#451A03';
      ctx.beginPath();
      ctx.ellipse(0, 0, 44, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#291102';
      ctx.beginPath();
      ctx.ellipse(4, 2, 34, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawSingleItem = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    item: RaceItem
  ) => {
    ctx.save();
    ctx.translate(x, y - 26 * scale);
    ctx.scale(scale, scale);

    const bob = Math.sin(performance.now() * 0.007) * 5;
    const spinAngle = (performance.now() * 0.005) % (Math.PI * 2);
    ctx.translate(0, bob);

    if (item.type === 'STEEL_BALL') {
      // 鉄球 (Steel Ball with emerald spiral energy)
      // Glow aura
      const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, 26);
      aura.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
      aura.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      // Steel Ball sphere
      ctx.save();
      ctx.rotate(spinAngle);

      const sphereGrad = ctx.createRadialGradient(-5, -5, 2, 0, 0, 15);
      sphereGrad.addColorStop(0, '#6EE7B7');
      sphereGrad.addColorStop(0.5, '#059669');
      sphereGrad.addColorStop(1, '#022C22');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();

      // Spiral Grooves (Zeppeli Steel Ball Engraving)
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 1.5);
      ctx.stroke();

      ctx.restore();

    } else {
      // Golden Carrot
      const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
      aura.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
      aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.moveTo(-8, -12);
      ctx.lineTo(8, -12);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.ellipse(0, -18, 3, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawRivals = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: typeof gameStateRef.current,
    isPortrait: boolean
  ) => {
    state.rivals.forEach(r => {
      const relDist = r.currentDistance - state.distance;
      const proj = projectCoord(r.lane, relDist, width, height, isPortrait);
      if (!proj.visible) return;

      const rBankAngle = (r.targetLane - r.lane) * 0.12;

      drawVerticalHorse(
        ctx,
        proj.x,
        proj.y,
        proj.scale * (isPortrait ? 0.85 : 0.9),
        {
          coatColor: r.coatColor,
          maneColor: r.maneColor,
          jockeyColor: r.jockeyColor,
          jockeyCapColor: '#10B981',
          speed: r.speed,
          yJump: 0,
          isSpinAuraActive: false,
          bankAngle: rBankAngle,
          nameTag: r.name,
          horseId: r.name === 'スローダンサー' ? 'slow_dancer' : 'silver_bullet',
        }
      );
    });
  };

  const drawPlayerHorse = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: typeof gameStateRef.current,
    horse: HorseProfile,
    isPortrait: boolean
  ) => {
    const proj = projectCoord(state.lane, 0, width, height, isPortrait);
    const bankAngle = (state.targetLane - state.lane) * 0.16;

    drawVerticalHorse(
      ctx,
      proj.x,
      proj.y,
      isPortrait ? 1.05 : 1.15,
      {
        coatColor: horse.coatColor,
        maneColor: horse.maneColor,
        jockeyColor: horse.jockeyColor,
        jockeyCapColor: horse.jockeyCapColor,
        speed: state.speed,
        yJump: state.jumpHeight,
        isSpinAuraActive: state.spinDashTimer > 0,
        bankAngle,
        nameTag: horse.name,
        horseId: horse.id,
      }
    );
  };

  const drawSpeedLinesAndParticles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: typeof gameStateRef.current,
    dt: number,
    isPortrait: boolean
  ) => {
    // Turf dust particles
    if (state.speed > 45 && Math.random() < 0.6) {
      const proj = projectCoord(state.lane, 0, width, height, isPortrait);
      state.particles.push({
        x: proj.x + (Math.random() - 0.5) * 40,
        y: proj.y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 60,
        vy: -Math.random() * 80 - 40,
        size: Math.random() * 5 + 2,
        color: state.spinDashTimer > 0 ? '#10B981' : '#B45309',
        alpha: 0.9,
        life: 0,
        maxLife: 0.4,
      });
    }

    state.particles = state.particles.filter(p => {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
      const a = p.alpha * (1 - p.life / p.maxLife);

      if (a > 0) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1.0;
        return true;
      }
      return false;
    });

    // Speed lines
    if (state.speed > 70) {
      const intensity = Math.min(1, (state.speed - 70) / 25);
      const numLines = Math.floor(14 * intensity);
      ctx.strokeStyle = state.spinDashTimer > 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2;

      for (let i = 0; i < numLines; i++) {
        const lx = Math.random() * width;
        const ly = height * 0.23 + Math.random() * (height * 0.7);
        const len = 30 + Math.random() * 80 * intensity;

        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - (lx - width / 2) * 0.35, ly - len);
        ctx.stroke();
      }
    }
  };

  const drawFloatingTexts = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: typeof gameStateRef.current,
    dt: number,
    isPortrait: boolean
  ) => {
    const proj = projectCoord(state.lane, 0, width, height, isPortrait);

    state.floatingTexts = state.floatingTexts.filter(ft => {
      ft.alpha -= dt * 0.9;
      ft.y += ft.vy * dt;

      if (ft.alpha > 0) {
        ctx.save();
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';

        const drawX = proj.x;
        const drawY = proj.y - 85 + ft.y;

        ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.lineWidth = 4;
        ctx.strokeText(ft.text, drawX, drawY);

        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.fillText(ft.text, drawX, drawY);
        ctx.restore();
        return true;
      }
      return false;
    });
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block bg-slate-900 cursor-pointer touch-none"
        onPointerDown={handleCanvasPointerDown}
        onPointerUp={handleCanvasPointerUp}
      />
    </div>
  );
});

RaceCanvas.displayName = 'RaceCanvas';
