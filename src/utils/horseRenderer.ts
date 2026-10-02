/**
 * High-fidelity Vertical Thoroughbred Racehorse & Jockey Renderer
 *
 * Renders a racehorse viewed from behind/top-down 3D perspective
 * galloping forward into the screen along the racetrack.
 *
 * Features realistic equine biomechanics:
 * - Natural 2.2-2.6 Hz gallop stride cadence (no uncanny vibration)
 * - Smooth sinusoidal suspension & subtle pelvic sway
 * - Anatomically articulated hind legs (gaskin -> hock -> cannon -> hoof)
 * - Front legs reaching forward naturally beneath the chest
 * - Aerodynamic streaming tail and flowing mane
 * - Aerodynamic jockey crouch with steady rein posture
 */

export interface HorseRenderOptions {
  coatColor: string;
  maneColor: string;
  jockeyColor: string;
  jockeyCapColor: string;
  speed: number;
  yJump?: number;
  isSpinAuraActive?: boolean;
  bankAngle?: number;
  nameTag?: string;
  horseId?: string;
}

export function drawVerticalHorse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  options: HorseRenderOptions
) {
  const {
    coatColor,
    maneColor,
    jockeyColor,
    jockeyCapColor,
    speed,
    yJump = 0,
    isSpinAuraActive = false,
    bankAngle = 0,
    nameTag,
    horseId = 'valkyrie',
  } = options;

  ctx.save();
  ctx.translate(x, y - yJump);
  ctx.scale(scale, scale);

  // 1. Natural Gallop Cadence (2.1 to 2.5 strides per second, realistic thoroughbred speed)
  const clampedSpeed = Math.max(30, Math.min(95, speed));
  const strideFreq = 2.1 + (clampedSpeed - 40) * 0.012; // ~2.34 Hz at 60km/h
  const timeSec = performance.now() * 0.001;
  const cycle = (timeSec * strideFreq * Math.PI * 2) % (Math.PI * 2);

  // Smooth sinusoidal suspension (continuous bounce, no sharp corners)
  const verticalBounce = -Math.sin(cycle) * 3.6;
  const pelvicRoll = Math.sin(cycle) * 0.025 + bankAngle;
  const pitchAngle = Math.cos(cycle) * 0.025;

  // Apply bank & pitch
  ctx.rotate(pelvicRoll);

  // 2. Ground Shadow (stays on the ground surface below the horse)
  ctx.save();
  ctx.translate(0, yJump);
  const shadowAlpha = Math.max(0.12, 0.40 - yJump * 0.003 + (verticalBounce > 0 ? 0.04 : -0.04));
  const shadowScale = 1.0 - yJump * 0.002;
  ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(0, 10, 34 * shadowScale, 13 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Golden Spin Emerald Vortex Aura (if active)
  if (isSpinAuraActive) {
    ctx.save();
    const auraPulse = Math.sin(timeSec * 16) * 4;
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 24 + auraPulse;
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, -32 + verticalBounce, 42 + auraPulse, 34 + auraPulse, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Orbital golden spin energy beads
    const satAngle = timeSec * 10;
    for (let s = 0; s < 4; s++) {
      const a = satAngle + (s * Math.PI) / 2;
      const sx = Math.cos(a) * 44;
      const sy = -32 + verticalBounce + Math.sin(a) * 24;
      ctx.fillStyle = s % 2 === 0 ? '#10B981' : '#FCD34D';
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 4. FRONT LEGS (Under chest, reaching forward into the distance ahead)
  // Front legs attach at withers/shoulders (y = -42)
  const frontPhaseL = cycle + Math.PI * 0.9;
  const frontPhaseR = cycle + Math.PI * 1.8;

  const drawFrontLeg = (phase: number, side: number) => {
    // Phase calculation: smooth extension forward and recovery
    const stride = Math.sin(phase);
    const lift = Math.max(0, -Math.cos(phase)) * 8;

    const shoulderX = side * 9;
    const shoulderY = -42 + verticalBounce;

    // Knee reaches forward along the running line
    const kneeX = side * (8 + stride * 1.5);
    const kneeY = -54 + verticalBounce - lift * 0.5 + stride * 4;

    // Hoof reaches forward into turf ahead
    const hoofX = side * (7 + stride * 2);
    const hoofY = -66 + verticalBounce - lift + stride * 6;

    // Upper forearm
    ctx.strokeStyle = coatColor;
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(kneeX, kneeY);
    ctx.stroke();

    // Cannon bone to hoof
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(hoofX, hoofY);
    ctx.stroke();

    // Dark Front Hoof
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.ellipse(hoofX, hoofY, 3.2, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // Draw front legs peeking forward
  drawFrontLeg(frontPhaseL, -1);
  drawFrontLeg(frontPhaseR, 1);

  // 5. HORSE NECK, HEAD & ALERT EARS (Facing forward/upward into track)
  const neckBaseY = -40 + verticalBounce;
  const headPollY = -62 + verticalBounce + pitchAngle * 10;

  // Neck rising forward from withers to poll
  ctx.fillStyle = coatColor;
  ctx.beginPath();
  ctx.moveTo(-8, neckBaseY);
  ctx.lineTo(-5.5, headPollY);
  ctx.lineTo(5.5, headPollY);
  ctx.lineTo(8, neckBaseY);
  ctx.closePath();
  ctx.fill();

  // Head crown / poll (oval viewed from behind)
  ctx.beginPath();
  ctx.ellipse(0, headPollY - 2, 6, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Muzzle (extending forward into screen)
  ctx.beginPath();
  ctx.ellipse(0, headPollY - 8, 4.2, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Natural Flowing Mane (blowing straight back along neck crest)
  ctx.fillStyle = maneColor;
  const maneWave = Math.sin(cycle * 1.5) * 1.8;
  ctx.beginPath();
  ctx.moveTo(-2.5, neckBaseY);
  ctx.lineTo(-4 + maneWave, neckBaseY - 10);
  ctx.lineTo(0, headPollY - 3);
  ctx.lineTo(4 + maneWave, neckBaseY - 10);
  ctx.lineTo(2.5, neckBaseY);
  ctx.closePath();
  ctx.fill();

  // Alert Pointed Ears (Pricked straight forward / up towards the horizon)
  // Left Ear
  ctx.fillStyle = coatColor;
  ctx.beginPath();
  ctx.moveTo(-4.5, headPollY - 2);
  ctx.lineTo(-6.5, headPollY - 14);
  ctx.lineTo(-1.8, headPollY - 5);
  ctx.closePath();
  ctx.fill();
  // Left ear inner shadow
  ctx.fillStyle = '#3F1703';
  ctx.beginPath();
  ctx.moveTo(-4, headPollY - 3);
  ctx.lineTo(-5.5, headPollY - 12);
  ctx.lineTo(-2.2, headPollY - 5);
  ctx.closePath();
  ctx.fill();

  // Right Ear
  ctx.fillStyle = coatColor;
  ctx.beginPath();
  ctx.moveTo(4.5, headPollY - 2);
  ctx.lineTo(6.5, headPollY - 14);
  ctx.lineTo(1.8, headPollY - 5);
  ctx.closePath();
  ctx.fill();
  // Right ear inner shadow
  ctx.fillStyle = '#3F1703';
  ctx.beginPath();
  ctx.moveTo(4, headPollY - 3);
  ctx.lineTo(5.5, headPollY - 12);
  ctx.lineTo(2.2, headPollY - 5);
  ctx.closePath();
  ctx.fill();

  // 6. HORSE BACK & TORSO (Tapering forward from rump to withers)
  const rumpY = -18 + verticalBounce;
  ctx.fillStyle = coatColor;
  ctx.beginPath();
  ctx.moveTo(-15, rumpY);
  ctx.lineTo(-10, neckBaseY);
  ctx.lineTo(10, neckBaseY);
  ctx.lineTo(15, rumpY);
  ctx.closePath();
  ctx.fill();

  // 7. MUSCULAR HAUNCHES / RUMP (Viewed from Behind)
  // Left Haunch
  ctx.beginPath();
  ctx.ellipse(-12, rumpY, 13.5, 15.5, -0.08, 0, Math.PI * 2);
  ctx.fill();

  // Right Haunch
  ctx.beginPath();
  ctx.ellipse(12, rumpY, 13.5, 15.5, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Central Cleft & Muscle Shading
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.beginPath();
  ctx.ellipse(0, rumpY, 2.8, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Valkyrie distinctive golden/flaxen spots on the flank
  if (horseId === 'valkyrie') {
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(-8, rumpY - 2, 3, 0, Math.PI * 2);
    ctx.arc(8, rumpY - 1, 2.8, 0, Math.PI * 2);
    ctx.arc(-5, rumpY - 8, 2.2, 0, Math.PI * 2);
    ctx.arc(5, rumpY - 10, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. HIND LEGS (Propulsive limbs with natural joints)
  // Left & right gallop phases
  const hindPhaseL = cycle;
  const hindPhaseR = cycle + 0.85;

  const drawHindLeg = (phase: number, side: number) => {
    // Biomechanical gallop motion:
    // Stride cos: extension vs collection
    const extend = Math.cos(phase);
    const lift = Math.max(0, Math.sin(phase)) * 9;

    const hipX = side * 12.5;
    const hipY = rumpY + 6;

    // Hock (bends backward/outward, extends down during push-off)
    const hockX = side * (14.5 + extend * 1.5);
    const hockY = hipY + 12 - lift * 0.4 + extend * 3;

    // Hoof (pushes off turf at bottom or tucks up during recovery)
    const hoofX = side * (13.5 + extend * 2.5);
    const hoofY = hockY + 14 - lift + extend * 4.5;

    // Thigh / Gaskin (hip to hock)
    ctx.strokeStyle = coatColor;
    ctx.lineWidth = 5.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(hockX, hockY);
    ctx.stroke();

    // Lower Leg / Cannon (hock to ankle/hoof)
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.moveTo(hockX, hockY);
    ctx.lineTo(hoofX, hoofY);
    ctx.stroke();

    // Hoof & Iron Horseshoe
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(hoofX - 3.5, hoofY, 7, 3.8);

    // Iron Horseshoe glint
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(hoofX - 2.8, hoofY + 1.2, 5.6, 1.8);
  };

  drawHindLeg(hindPhaseL, -1);
  drawHindLeg(hindPhaseR, 1);

  // 9. FLOWING EQUINE TAIL (Natural Aerodynamic Stream)
  // High dock attached above cleft, streaming straight backward towards the camera
  const dockY = rumpY - 3;
  const tailSway1 = Math.sin(cycle - 0.5) * 2.8;
  const tailSway2 = Math.sin(cycle - 1.2) * 4.2;

  // Main thick tail strand
  ctx.strokeStyle = maneColor;
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, dockY);
  ctx.quadraticCurveTo(tailSway1, dockY + 15, tailSway2, dockY + 30);
  ctx.stroke();

  // Secondary soft tail strand
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(0, dockY);
  ctx.quadraticCurveTo(tailSway1 * 0.7, dockY + 12, tailSway2 * 1.25, dockY + 28);
  ctx.stroke();

  // 10. SADDLE & SADDLE CLOTH
  const saddleY = rumpY - 14;
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(-11.5, saddleY, 23, 11, 3.5);
  ctx.fill();

  // Gold racing saddle border
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // 11. REINS (Leather straps extending from hands forward to bit)
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.3;
  // Left rein
  ctx.beginPath();
  ctx.moveTo(-5.5, saddleY - 10);
  ctx.lineTo(-3.5, headPollY - 2);
  ctx.stroke();
  // Right rein
  ctx.beginPath();
  ctx.moveTo(5.5, saddleY - 10);
  ctx.lineTo(3.5, headPollY - 2);
  ctx.stroke();

  // 12. JOCKEY (Aerodynamic racing tuck, seated firmly)
  // White riding breeches
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.ellipse(0, saddleY + 1, 9.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jockey Silks Torso (leaning forward over withers)
  ctx.fillStyle = jockeyColor;
  ctx.beginPath();
  ctx.moveTo(-10, saddleY - 1);
  ctx.lineTo(-8, saddleY - 13); // left shoulder
  ctx.lineTo(8, saddleY - 13);  // right shoulder
  ctx.lineTo(10, saddleY - 1);
  ctx.closePath();
  ctx.fill();

  // Jockey Arms holding reins firmly
  ctx.strokeStyle = jockeyColor;
  ctx.lineWidth = 4.2;
  ctx.lineCap = 'round';
  // Left arm
  ctx.beginPath();
  ctx.moveTo(-8, saddleY - 11);
  ctx.lineTo(-10.5, saddleY - 8);
  ctx.lineTo(-5.5, saddleY - 12);
  ctx.stroke();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(8, saddleY - 11);
  ctx.lineTo(10.5, saddleY - 8);
  ctx.lineTo(5.5, saddleY - 12);
  ctx.stroke();

  // Rider Gloves
  ctx.fillStyle = '#94A3B8';
  ctx.beginPath();
  ctx.arc(-5.5, saddleY - 12, 2.2, 0, Math.PI * 2);
  ctx.arc(5.5, saddleY - 12, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Blond hair fluttering smoothly in slipstream
  ctx.fillStyle = '#FDE047';
  const hairFlutter = Math.sin(cycle * 1.3) * 1.8;
  ctx.beginPath();
  ctx.moveTo(-5, saddleY - 14);
  ctx.lineTo(-9 + hairFlutter, saddleY - 9);
  ctx.lineTo(0, saddleY - 12);
  ctx.lineTo(9 + hairFlutter, saddleY - 9);
  ctx.lineTo(5, saddleY - 14);
  ctx.closePath();
  ctx.fill();

  // Gyro Zeppeli Hat (Seen from top/rear)
  // Hat Brim
  ctx.fillStyle = jockeyCapColor;
  ctx.beginPath();
  ctx.ellipse(0, saddleY - 16, 16, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hat Crown
  ctx.fillStyle = '#064E3B'; // Deep emerald green
  ctx.beginPath();
  ctx.roundRect(-7, saddleY - 24, 14, 9, [4, 4, 1.5, 1.5]);
  ctx.fill();

  // Gold Checkered Band
  ctx.fillStyle = '#FCD34D';
  ctx.fillRect(-7, saddleY - 18, 14, 2.6);

  // Slit eyelets
  ctx.fillStyle = '#022C22';
  ctx.beginPath();
  ctx.arc(-3.5, saddleY - 21, 1.1, 0, Math.PI * 2);
  ctx.arc(3.5, saddleY - 21, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // 13. Name Tag above horse (if requested)
  if (nameTag) {
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    const textW = ctx.measureText(nameTag).width;
    ctx.fillRect(-textW / 2 - 5, headPollY - 26, textW + 10, 15);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(nameTag, 0, headPollY - 15);
  }

  ctx.restore();
}
