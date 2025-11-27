

import { Student, GradeResult } from '../types';

export const calculateGrade = (student: Student): GradeResult => {
  // If special status exists, return it immediately as the grade representation
  if (student.status === 'ร') {
    return { totalScore: 0, grade: 'ร', isPass: false };
  }
  if (student.status === 'มส.') {
    return { totalScore: 0, grade: 'มส.', isPass: false };
  }

  // Calculate Total Score
  const collectedSum = student.scores.collected.reduce((a, b) => a + (b || 0), 0);
  const midterm = student.scores.midterm || 0;
  const final = student.scores.final || 0;
  
  const total = collectedSum + midterm + final;

  let grade = 0;
  if (total >= 80) grade = 4;
  else if (total >= 75) grade = 3.5;
  else if (total >= 70) grade = 3;
  else if (total >= 65) grade = 2.5;
  else if (total >= 60) grade = 2;
  else if (total >= 55) grade = 1.5;
  else if (total >= 50) grade = 1;
  else grade = 0;

  return {
    totalScore: total,
    grade: grade,
    isPass: grade >= 1
  };
};

export const getGradeColor = (grade: number | string): string => {
  if (typeof grade === 'string') return 'text-red-500 font-bold';
  if (grade >= 3) return 'text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]';
  if (grade >= 2) return 'text-blue-400 font-bold';
  if (grade >= 1) return 'text-amber-400 font-bold';
  return 'text-red-500 font-bold';
};

// ==========================================
// RANK SYSTEM (ROBLOX JUNGLE STYLE)
// ==========================================

export interface RankInfo {
  tier: string;
  thaiName: string;
  minScore: number;
  textColor: string;
  ringColor: string;
  bgGradient: string;
  shadowColor: string;
  description: string;
  borderClass: string;
  hexColor: string; // For Avatar generation
}

export const RANKS: RankInfo[] = [
  { 
    tier: 'Novice Scout',
    thaiName: 'นักสำรวจฝึกหัด',
    minScore: 0, 
    textColor: 'text-stone-400',
    ringColor: 'border-stone-400',
    bgGradient: 'from-stone-800 via-stone-900 to-black',
    shadowColor: 'shadow-stone-400',
    description: 'First step into the wild.',
    borderClass: 'border-stone-400',
    hexColor: 'a8a29e' // Stone 400
  },
  { 
    tier: 'Pathfinder',
    thaiName: 'ผู้บุกเบิก',
    minScore: 40, 
    textColor: 'text-emerald-400',
    ringColor: 'border-emerald-400',
    bgGradient: 'from-green-900 via-emerald-950 to-black',
    shadowColor: 'shadow-emerald-400',
    description: 'Finding the way through the thicket.',
    borderClass: 'border-emerald-400',
    hexColor: '34d399' // Emerald 400
  },
  { 
    tier: 'Hunter',
    thaiName: 'นายพราน',
    minScore: 50, 
    textColor: 'text-amber-600',
    ringColor: 'border-amber-600',
    bgGradient: 'from-amber-900 via-orange-950 to-black',
    shadowColor: 'shadow-amber-600',
    description: 'Survival of the fittest.',
    borderClass: 'border-amber-600',
    hexColor: 'd97706' // Amber 600
  },
  { 
    tier: 'Ranger',
    thaiName: 'ผู้พิทักษ์ป่า',
    minScore: 60, 
    textColor: 'text-teal-400',
    ringColor: 'border-teal-400',
    bgGradient: 'from-teal-900 via-cyan-950 to-black',
    shadowColor: 'shadow-teal-400',
    description: 'One with the forest.',
    borderClass: 'border-teal-400',
    hexColor: '2dd4bf' // Teal 400
  },
  { 
    tier: 'Druid',
    thaiName: 'นักปราชญ์ไพร',
    minScore: 70, 
    textColor: 'text-fuchsia-400',
    ringColor: 'border-fuchsia-400',
    bgGradient: 'from-fuchsia-900 via-purple-950 to-black',
    shadowColor: 'shadow-fuchsia-400',
    description: 'Ancient wisdom unleashed.',
    borderClass: 'border-fuchsia-400',
    hexColor: 'e879f9' // Fuchsia 400
  },
  { 
    tier: 'Chieftain',
    thaiName: 'หัวหน้าเผ่า',
    minScore: 80, 
    textColor: 'text-yellow-400',
    ringColor: 'border-yellow-400',
    bgGradient: 'from-yellow-900 via-amber-950 to-black',
    shadowColor: 'shadow-yellow-400',
    description: 'Leader of the pack.',
    borderClass: 'border-yellow-400',
    hexColor: 'facc15' // Yellow 400
  },
  { 
    tier: 'Jungle King',
    thaiName: 'เจ้าป่า',
    minScore: 85, 
    textColor: 'text-orange-500',
    ringColor: 'border-orange-500',
    bgGradient: 'from-orange-800 via-red-900 to-black',
    shadowColor: 'shadow-orange-500',
    description: 'Ruler of the wild.',
    borderClass: 'border-orange-500',
    hexColor: 'f97316' // Orange 500
  },
  { 
    tier: 'Ancient Guardian',
    thaiName: 'เทพพิทักษ์',
    minScore: 90, 
    textColor: 'text-cyan-300',
    ringColor: 'border-cyan-300',
    bgGradient: 'from-cyan-900 via-blue-950 to-black',
    shadowColor: 'shadow-cyan-300',
    description: 'The Eternal Legend of Nature.',
    borderClass: 'border-cyan-300',
    hexColor: '67e8f9' // Cyan 300
  }
];

// Internal logic uses standard class names, mapped to Adventure themes in UI
export type HeroClass = 'Warrior' | 'Mage' | 'Assassin' | 'Carry' | 'Tank' | 'Support';

// HERO ASSETS MAPPING (ROBLOX STYLE - Rank Based)
// We use DiceBear Bottts to simulate "Blocky/Roblox" characters.
const RANK_IMAGES: Record<string, string> = {
  'Novice Scout': 'https://api.dicebear.com/9.x/bottts/svg?seed=NoviceScout&baseColor=a8a29e',
  'Pathfinder': 'https://api.dicebear.com/9.x/bottts/svg?seed=Pathfinder&baseColor=34d399',
  'Hunter': 'https://api.dicebear.com/9.x/bottts/svg?seed=Hunter&baseColor=d97706',
  'Ranger': 'https://api.dicebear.com/9.x/bottts/svg?seed=Ranger&baseColor=2dd4bf',
  'Druid': 'https://api.dicebear.com/9.x/bottts/svg?seed=Druid&baseColor=e879f9',
  'Chieftain': 'https://api.dicebear.com/9.x/bottts/svg?seed=Chieftain&baseColor=facc15',
  'Jungle King': 'https://api.dicebear.com/9.x/bottts/svg?seed=JungleKing&baseColor=f97316',
  'Ancient Guardian': 'https://api.dicebear.com/9.x/bottts/svg?seed=AncientGuardian&baseColor=67e8f9'
};

const SKIN_PREFIXES = {
  'Novice Scout': 'Noob',
  'Pathfinder': 'Explorer',
  'Hunter': 'Pro',
  'Ranger': 'Veteran',
  'Druid': 'Master',
  'Chieftain': 'Epic',
  'Jungle King': 'Legendary',
  'Ancient Guardian': 'Godlike'
};

const getGender = (name: string): 'male' | 'female' => {
  if (name.startsWith('ด.ญ.') || name.startsWith('น.ส.') || name.startsWith('นาง') || name.includes('หญิง')) return 'female';
  return 'male';
};

const getHeroClass = (id: string): HeroClass => {
  const num = parseInt(id.replace(/\D/g, '')) || 0;
  const classes: HeroClass[] = ['Warrior', 'Mage', 'Assassin', 'Carry', 'Tank', 'Support'];
  return classes[num % classes.length];
}

export const getSkinName = (tier: string, heroClass: HeroClass): string => {
  const prefix = SKIN_PREFIXES[tier as keyof typeof SKIN_PREFIXES] || 'Player';
  const classMap = {
    Warrior: 'Fighter',
    Mage: 'Wizard',
    Assassin: 'Ninja',
    Carry: 'Gunner',
    Tank: 'Defender',
    Support: 'Medic'
  };
  return `[${prefix}] ${classMap[heroClass]}`;
}

export const getTicketInfo = (rankIndex: number, redeemed: number) => {
    // Logic: Earn 1 ticket per rank reached (excluding Novice)
    // Novice (idx 0) = 0 tickets
    // Pathfinder (idx 1) = 1 ticket
    // ...
    // Ancient Guardian (idx 7) = 7 tickets
    const earned = rankIndex; 
    const available = Math.max(0, earned - redeemed);
    return { earned, available, redeemed };
};

export const getRankInfo = (score: number, studentName: string, studentId: string): { 
  current: RankInfo, 
  next: RankInfo | null, 
  progress: number, 
  avatarUrl: string,
  heroClass: HeroClass,
  gender: 'male' | 'female',
  skinName: string,
  rankIndex: number
} => {
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];
  let rankIndex = 0;

  for (let i = 0; i < RANKS.length; i++) {
    if (score >= RANKS[i].minScore) {
      currentRank = RANKS[i];
      rankIndex = i;
      nextRank = RANKS[i + 1] || null;
    } else {
      break;
    }
  }

  // Calculate Progress
  let progress = 100;
  if (nextRank) {
    const range = nextRank.minScore - currentRank.minScore;
    const currentInRank = score - currentRank.minScore;
    progress = (currentInRank / range) * 100;
  }

  const gender = getGender(studentName);
  const heroClass = getHeroClass(studentId);
  const skinName = getSkinName(currentRank.tier, heroClass);
  const avatarUrl = RANK_IMAGES[currentRank.tier] || RANK_IMAGES['Novice Scout'];

  return { current: currentRank, next: nextRank, progress, avatarUrl, heroClass, gender, skinName, rankIndex };
};
