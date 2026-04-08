export interface Game {
  id: string;
  title: string;
  description: string;
  category: 'math' | 'language' | 'science' | 'logic';
  minAge: number;
  maxAge: number;
  color: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  age: number;
  level: number;
  points: number;
  progress: Record<string, number>;
}

export const GAMES: Game[] = [
  {
    id: 'math-stars',
    title: 'نجوم الحساب',
    description: 'تعلم الجمع والطرح مع النجوم اللامعة',
    category: 'math',
    minAge: 4,
    maxAge: 7,
    color: 'bg-brand-yellow',
    icon: 'Star'
  },
  {
    id: 'word-blocks',
    title: 'مكعبات الكلمات',
    description: 'ابنِ كلماتك الأولى باستخدام المكعبات السحرية',
    category: 'language',
    minAge: 5,
    maxAge: 9,
    color: 'bg-brand-blue',
    icon: 'Square'
  },
  {
    id: 'logic-maze',
    title: 'متاهة المنطق',
    description: 'حل الألغاز الهندسية لتجد الطريق',
    category: 'logic',
    minAge: 8,
    maxAge: 13,
    color: 'bg-brand-purple',
    icon: 'Cpu'
  },
  {
    id: 'science-lab',
    title: 'مختبر العلوم',
    description: 'اكتشف أسرار الكواكب والنجوم في رحلة فضائية',
    category: 'science',
    minAge: 6,
    maxAge: 12,
    color: 'bg-brand-green',
    icon: 'FlaskConical'
  },
  {
    id: 'language-safari',
    title: 'مغامرة الحروف',
    description: 'استكشف غابة الحروف وكون جملك الأولى',
    category: 'language',
    minAge: 4,
    maxAge: 8,
    color: 'bg-brand-red',
    icon: 'Languages'
  }
];
