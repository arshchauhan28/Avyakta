import { Achievement, LearnerRank } from '../types/progression';

export const LEARNER_RANKS: LearnerRank[] = [
  { tier: 1, title: 'Jijnasu', titleSanskrit: 'जिज्ञासु', minXP: 0, badge: '🌱' },
  { tier: 2, title: 'Sadhaka', titleSanskrit: 'साधक', minXP: 250, badge: '🪷' },
  { tier: 3, title: 'Vidyarthi', titleSanskrit: 'विद्यार्थी', minXP: 750, badge: '📜' },
  { tier: 4, title: 'Viveki', titleSanskrit: 'विवेकी', minXP: 1500, badge: '⚔️' },
  { tier: 5, title: 'Yogarudha', titleSanskrit: 'योगारूढ', minXP: 3000, badge: '🧘' },
  { tier: 6, title: 'Sthitaprajna', titleSanskrit: 'स्थितप्रज्ञ', minXP: 5000, badge: '🔱' },
  { tier: 7, title: 'Paramahamsa', titleSanskrit: 'परमहंस', minXP: 7000, badge: '👑' }
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    title: 'First Step on Dharma’s Field',
    titleHindi: 'धर्मक्षेत्रे प्रथमः पदः',
    description: 'Complete the very first level of the Bhagavad Gita (Shloka 1.1).',
    descriptionHindi: 'भगवद्गीता के पहले श्लोक (1.1) का अध्ययन पूर्ण करें।',
    icon: '🚩',
    category: 'special',
    requiredLevelId: '1.1'
  },
  {
    id: 'arjuna-surrender',
    title: 'Disciple of the Divine',
    titleHindi: 'शिष्यस्तेऽहं शाधि मां त्वां प्रपन्नम्',
    description: 'Master Shloka 2.7, where Arjuna surrenders his doubts to Lord Krishna as his Guru.',
    descriptionHindi: 'श्लोक 2.7 में पारंगत हों, जहाँ अर्जुन संशय त्यागकर भगवान श्री कृष्ण को गुरु रूप में स्वीकार करते हैं।',
    icon: '🙏',
    category: 'special',
    requiredLevelId: '2.7'
  },
  {
    id: 'karmanye-vadhikaraste',
    title: 'Master of Selfless Action',
    titleHindi: 'कर्मण्येवाधिकारस्ते',
    description: 'Master Shloka 2.47, the seminal teaching of Nishkama Karma Yoga.',
    descriptionHindi: 'श्लोक 2.47 में पारंगत हों—निष्काम कर्मयोग का परम आधारभूत उपदेश।',
    icon: '⚖️',
    category: 'special',
    requiredLevelId: '2.47'
  },
  {
    id: 'charioteer-wisdom',
    title: 'The Beginning of Wisdom',
    titleHindi: 'प्रज्ञायाः आरम्भः',
    description: 'Complete all 47 levels of Chapter 1 (Arjuna Vishada Yoga).',
    descriptionHindi: 'अध्याय 1 (अर्जुनविषादयोग) के सभी 47 स्तरों को पूर्ण करें।',
    icon: '🏹',
    category: 'chapter',
    requiredCompletedCount: 47
  },
  {
    id: 'path-of-action',
    title: 'Architect of Duty',
    titleHindi: 'कर्मयोग सिद्धिः',
    description: 'Complete all levels of Chapter 3 (Karma Yoga).',
    descriptionHindi: 'अध्याय 3 (कर्मयोग) के सभी स्तरों को पूर्ण करें।',
    icon: '⚙️',
    category: 'chapter',
    requiredLevelId: '3.43'
  },
  {
    id: 'mindful-stillness',
    title: 'The Still Flame',
    titleHindi: 'यथा दीपो निवातस्थः',
    description: 'Complete Chapter 6 (Dhyana Yoga) and learn the art of steady meditation.',
    descriptionHindi: 'अध्याय 6 (आत्मसंयमयोग) को पूर्ण कर अविचल ध्यान की कला सीखें।',
    icon: '🕯️',
    category: 'chapter',
    requiredLevelId: '6.47'
  },
  {
    id: 'cosmic-vision',
    title: 'Cosmic Vision Beheld',
    titleHindi: 'विश्वरूप दर्शनम्',
    description: 'Experience the revelation of the Universal Form in Chapter 11.',
    descriptionHindi: 'अध्याय 11 में भगवान के विराट विश्वरूप के अलौकिक दर्शन प्राप्त करें।',
    icon: '🌌',
    category: 'chapter',
    requiredLevelId: '11.55'
  },
  {
    id: 'the-eternal-tree',
    title: 'He Who Knows the Ashvattha',
    titleHindi: 'ऊर्ध्वमूलमधःशाखम्',
    description: 'Understand the mystery of the cosmic tree in Chapter 15.',
    descriptionHindi: 'अध्याय 15 में संसार रूपी दिव्य अश्वत्थ वृक्ष का रहस्य समझें।',
    icon: '🌳',
    category: 'chapter',
    requiredLevelId: '15.20'
  },
  {
    id: 'supreme-refuge',
    title: 'Supreme Surrender',
    titleHindi: 'सर्वधर्मान्परित्यज्य',
    description: 'Master the Charama Shloka 18.66: Abandon all varieties of religion and take refuge in Me alone.',
    descriptionHindi: 'चरम श्लोक 18.66 में पारंगत हों: सब धर्मों को त्यागकर केवल मेरी शरण में आओ।',
    icon: '🪷',
    category: 'special',
    requiredLevelId: '18.66'
  },
  {
    id: 'the-final-victory',
    title: 'Where Krishna & Arjuna Stand',
    titleHindi: 'यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः',
    description: 'Complete the 700th and final shloka (18.78), achieving ultimate spiritual triumph.',
    descriptionHindi: 'गीता के 700वें व अंतिम श्लोक (18.78) को पूर्ण कर परम विजय और सिद्धि प्राप्त करें।',
    icon: '👑',
    category: 'special',
    requiredLevelId: '18.78'
  },
  // Milestones
  {
    id: 'count-10',
    title: 'Diligent Seeker',
    titleHindi: 'दश श्लोकाः',
    description: 'Complete your first 10 shloka learning levels.',
    descriptionHindi: 'अपनी यात्रा के प्रथम 10 श्लोक स्तर पूर्ण करें।',
    icon: '✨',
    category: 'mastery',
    requiredCompletedCount: 10
  },
  {
    id: 'count-50',
    title: 'Firm Resolve',
    titleHindi: 'पञ्चाशत् श्लोकाः',
    description: 'Complete 50 shloka levels on your journey.',
    descriptionHindi: 'ज्ञान मार्ग पर 50 श्लोक स्तर पूर्ण करें।',
    icon: '🌟',
    category: 'mastery',
    requiredCompletedCount: 50
  },
  {
    id: 'count-100',
    title: 'A Century of Wisdom',
    titleHindi: 'शत श्लोकाः',
    description: 'Master 100 verses of the sacred dialogue.',
    descriptionHindi: 'पवित्र संवाद के 100 श्लोकों में निपुणता प्राप्त करें।',
    icon: '💫',
    category: 'mastery',
    requiredCompletedCount: 100
  },
  {
    id: 'count-250',
    title: 'Unwavering Practitioner',
    titleHindi: 'सार्धद्विशत श्लोकाः',
    description: 'Reach 250 completed levels across the chapter worlds.',
    descriptionHindi: 'अध्याय लोकों में 250 श्लोक स्तरों का अध्ययन पूर्ण करें।',
    icon: '🛡️',
    category: 'mastery',
    requiredCompletedCount: 250
  },
  {
    id: 'count-350',
    title: 'Halfway Through the Journey',
    titleHindi: 'मध्यमार्ग पूर्णम्',
    description: 'Reach the exact halfway milestone of 350 shlokas.',
    descriptionHindi: '350 श्लोकों के साथ यात्रा का ठीक आधा पड़ाव पूरा करें।',
    icon: '🧭',
    category: 'mastery',
    requiredCompletedCount: 350
  },
  {
    id: 'count-500',
    title: 'Wisdom Explorer',
    titleHindi: 'पञ्चशत श्लोकाः',
    description: 'Attain 500 mastered shlokas in the journey of consciousness.',
    descriptionHindi: 'चेतना की इस पावन यात्रा में 500 श्लोकों पर विजय प्राप्त करें।',
    icon: '💎',
    category: 'mastery',
    requiredCompletedCount: 500
  },
  {
    id: 'grand-journey-700',
    title: 'The Complete 700-Shloka Journey',
    titleHindi: 'सप्तशत श्लोकाः सम्पूर्णम्',
    description: 'Complete all 700 canonical levels of the holy Bhagavad Gita.',
    descriptionHindi: 'श्रीमद्भगवद्गीता के सभी 700 प्रामाणिक श्लोकों की पूर्ण यात्रा संपन्न करें।',
    icon: '🏆',
    category: 'special',
    requiredCompletedCount: 700
  }
];

export class AchievementService {
  static getRankForXP(xp: number): LearnerRank {
    for (let i = LEARNER_RANKS.length - 1; i >= 0; i--) {
      if (xp >= LEARNER_RANKS[i].minXP) {
        return LEARNER_RANKS[i];
      }
    }
    return LEARNER_RANKS[0];
  }

  static getNextRank(xp: number): LearnerRank | null {
    for (let i = 0; i < LEARNER_RANKS.length; i++) {
      if (xp < LEARNER_RANKS[i].minXP) {
        return LEARNER_RANKS[i];
      }
    }
    return null;
  }

  static evaluateNewAchievements(
    completedLevelIds: string[],
    unlockedAchievementIds: string[],
    justCompletedLevelId?: string
  ): Achievement[] {
    const existing = new Set(unlockedAchievementIds);
    const newUnlocks: Achievement[] = [];
    const count = completedLevelIds.length;

    for (const ach of ALL_ACHIEVEMENTS) {
      if (existing.has(ach.id)) continue;

      let isEarned = false;

      // Check level-specific requirement
      if (ach.requiredLevelId) {
        if (completedLevelIds.includes(ach.requiredLevelId) || justCompletedLevelId === ach.requiredLevelId) {
          isEarned = true;
        }
      }

      // Check count requirement
      if (ach.requiredCompletedCount && count >= ach.requiredCompletedCount) {
        isEarned = true;
      }

      if (isEarned) {
        newUnlocks.push({
          ...ach,
          unlockedAt: new Date().toISOString()
        });
      }
    }

    return newUnlocks;
  }

  static getAllAchievementsWithStatus(unlockedAchievementIds: string[]): Array<Achievement & { isUnlocked: boolean }> {
    const unlockedSet = new Set(unlockedAchievementIds);
    return ALL_ACHIEVEMENTS.map((a) => ({
      ...a,
      isUnlocked: unlockedSet.has(a.id)
    }));
  }
}
