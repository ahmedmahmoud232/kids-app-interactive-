import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Square, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WordBlocksProps {
  onComplete: (points: number) => void;
}

const WORDS = [
  { word: 'قمر', scrambled: ['ر', 'ق', 'م'] },
  { word: 'نجم', scrambled: ['م', 'ن', 'ج'] },
  { word: 'كتاب', scrambled: ['ب', 'ت', 'ا', 'ك'] },
];

export default function WordBlocks({ onComplete }: WordBlocksProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);

  const current = WORDS[currentWordIndex];

  const toggleLetter = (letter: string, index: number) => {
    if (feedback) return;
    setSelectedLetters(prev => [...prev, letter]);
  };

  useEffect(() => {
    if (selectedLetters.length === current.word.length) {
      const isCorrect = selectedLetters.join('') === current.word;
      if (isCorrect) {
        setFeedback('correct');
        setScore(s => s + 20);
      } else {
        setFeedback('wrong');
      }

      setTimeout(() => {
        if (currentWordIndex < WORDS.length - 1) {
          setCurrentWordIndex(i => i + 1);
          setSelectedLetters([]);
          setFeedback(null);
        } else {
          onComplete(score + (isCorrect ? 20 : 0));
        }
      }, 1500);
    }
  }, [selectedLetters]);

  return (
    <div className="kids-card p-12 text-center space-y-12">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-500">رتب الحروف لتكوين الكلمة</h3>
        <div className="flex justify-center gap-4 min-h-[80px]">
          {selectedLetters.map((l, i) => (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={i} 
              className="w-16 h-16 bg-brand-blue text-white rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg"
            >
              {l}
            </motion.div>
          ))}
          {[...Array(current.word.length - selectedLetters.length)].map((_, i) => (
            <div key={i} className="w-16 h-16 border-4 border-dashed border-gray-200 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        {current.scrambled.map((l, i) => (
          <button
            key={i}
            onClick={() => toggleLetter(l, i)}
            className="w-16 h-16 bg-white border-4 border-brand-blue text-brand-blue rounded-xl flex items-center justify-center text-3xl font-bold hover:scale-110 transition-transform shadow-md"
          >
            {l}
          </button>
        ))}
      </div>

      {feedback && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "flex items-center justify-center gap-2 text-2xl font-bold",
            feedback === 'correct' ? "text-brand-green" : "text-brand-red"
          )}
        >
          {feedback === 'correct' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          <span>{feedback === 'correct' ? 'رائع!' : 'حاول مرة أخرى'}</span>
        </motion.div>
      )}

      <button 
        onClick={() => setSelectedLetters([])}
        className="text-gray-400 hover:text-brand-red underline text-sm"
      >
        مسح الحروف
      </button>
    </div>
  );
}
