import { Course, HorseProfile } from '../types/game';

export const HORSES: HorseProfile[] = [
  {
    id: 'valkyrie',
    name: 'ヴァルキリー (Valkyrie)',
    subName: 'Valkyrie · Gyro Zeppeli',
    riderName: 'ジャイロ・ツェペリ',
    colorName: '白斑点栗毛 (Flaxen Chestnut)',
    coatColor: '#B45309', // Warm chestnut
    maneColor: '#FEF08A', // Flaxen blond mane
    jockeyColor: '#059669', // Zeppeli Emerald green
    jockeyCapColor: '#10B981', // Green wide-brim hat
    baseMaxSpeed: 75,
    accelerationRate: 3.0,
    staminaMax: 100,
    agility: 1.25,
    description: 'ツェペリ家の誇る名馬。鉄球の回転エネルギーを宿し、危険な障害物のギリギリをすり抜けるたびスピンが猛烈に加速する！',
    specialAbility: '黄金の回転：ギリギリ回避でスピンが倍速チャージ',
  },
  {
    id: 'slow_dancer',
    name: 'スローダンサー (Slow Dancer)',
    subName: 'Slow Dancer · Johnny',
    riderName: 'ジョニィ',
    colorName: '芦毛アパルーサ (Appaloosa)',
    coatColor: '#94A3B8', // Silver gray
    maneColor: '#F8FAFC', // Pure white
    jockeyColor: '#3B82F6', // Blue cap/silks
    jockeyCapColor: '#60A5FA',
    baseMaxSpeed: 73,
    accelerationRate: 2.8,
    staminaMax: 110,
    agility: 1.35,
    description: '爪弾の軌跡と共に跳躍する名馬。ジャンプの滞空性能が高く、生垣ハードルや巨大岩を軽々と飛び越える。',
    specialAbility: 'ハイトップジャンプ：滞空時間+30%',
  },
  {
    id: 'silver_bullet',
    name: 'シルバーバレット (Silver Bullet)',
    subName: 'Silver Bullet · Diego',
    riderName: 'ディエゴ',
    colorName: '青鹿毛 (Raven Black)',
    coatColor: '#1C1917', // Pitch black
    maneColor: '#0C0A09',
    jockeyColor: '#EAB308', // Gold / Yellow sweater
    jockeyCapColor: '#CA8A04',
    baseMaxSpeed: 76,
    accelerationRate: 3.2,
    staminaMax: 95,
    agility: 1.5,
    description: '野性の嗅覚で最短コースを疾走する駿馬。目にも留まらぬ速さで左右のレーンへ素早く身を翻す！',
    specialAbility: 'クイックスウェー：レーン移動速度+50%',
  },
  {
    id: 'hey_ya',
    name: 'ヘイ・ヤー (Hey Ya!)',
    subName: 'Hey Ya! · Pocoloco',
    riderName: 'ポコロコ',
    colorName: '鹿毛 (Rich Bay)',
    coatColor: '#78350F',
    maneColor: '#451A03',
    jockeyColor: '#EF4444',
    jockeyCapColor: '#F97316',
    baseMaxSpeed: 72,
    accelerationRate: 2.5,
    staminaMax: 130,
    agility: 1.0,
    description: '絶対的な「幸運」に愛された馬。ぬかるみや流砂に突っ込んでも失速しにくく、スタミナも無尽蔵。',
    specialAbility: 'ラッキーフォーチュン：泥水・流砂の減速50%軽減',
  },
];

export const COURSES: Course[] = [
  {
    id: 'stage_1_coast',
    name: 'サンディエゴ・コースト',
    stageName: 'STAGE 1',
    grade: 'STAGE 1',
    distance: 1200,
    trackType: 'TURF',
    obstacleDensity: 'LOW',
    rewardTitle: '海岸スプリンター',
    description: '大陸横断レースの幕開け！海風吹き抜ける直線コース。基本の生垣ジャンプとサボテン回避をマスターせよ！',
    skyTheme: 'day',
  },
  {
    id: 'stage_2_desert',
    name: 'アリゾナ・バレー荒野',
    stageName: 'STAGE 2',
    grade: 'STAGE 2',
    distance: 1600,
    trackType: 'DESERT',
    obstacleDensity: 'MEDIUM',
    rewardTitle: '砂漠の鉄球使い',
    description: '灼熱の峡谷にトゲ付きサボテンと泥水トラップが頻発。鉄球を集めてスピンダッシュを発動させろ！',
    skyTheme: 'sunset',
  },
  {
    id: 'stage_3_canyon',
    name: 'ロッキー・ボルダー峠',
    stageName: 'STAGE 3',
    grade: 'STAGE 3',
    distance: 2000,
    trackType: 'DIRT',
    obstacleDensity: 'HIGH',
    rewardTitle: '岩礁ブレイカー',
    description: '巨大な落石と急峻な障害物が次々と迫る難所。ジャンプできない大岩は左右に素早くかわすべし！',
    skyTheme: 'overcast',
  },
  {
    id: 'stage_4_final',
    name: 'ニューヨーク・栄光の大平原',
    stageName: 'FINAL STAGE',
    grade: 'FINAL STAGE',
    distance: 2400,
    trackType: 'TURF',
    obstacleDensity: 'EXTREME',
    rewardTitle: 'STEEL BALL RUN 覇者',
    description: '全ライバル騎手が激突する運命のファイナル！無数の障害物を回避しきり、奇跡のゴールへ飛び込め！',
    skyTheme: 'sunset',
  },
];
