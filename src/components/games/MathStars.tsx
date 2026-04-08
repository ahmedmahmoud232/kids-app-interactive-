import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MathStarsProps {
  onComplete: (points: number) => void;
}

export default function MathStars({ onComplete }: MathStarsProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    generateProblem();
  }, []);

  const generateProblem = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setAnswer('');
    setFeedback(null);
  };

  const checkAnswer = () => {
    const correct = parseInt(answer) === num1 + num2;
    if (correct) {
      setFeedback('correct');
      setScore(s => s + 10);
    } else {
      setFeedback('wrong');
    }
    setCount(c => c + 1);

    setTimeout(() => {
      if (count < 4) {
        generateProblem();
      } else {
        onComplete(score + (correct ? 10 : 0));
      }
    }, 1500);
  };

  return (
    <div className="kids-card p-12 text-center space-y-8">
      <div className="flex justify-center gap-4 text-6xl font-bold text-brand-purple">
        <span>{num1}</span>
        <span>+</span>
        <span>{num2}</span>
        <span>=</span>
        <input 
          type="number" 
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-24 border-b-4 border-brand-purple text-center outline-none focus:border-brand-blue"
          autoFocus
        />
      </div>

      <button 
        onClick={checkAnswer}
        disabled={!answer || !!feedback}
        className="btn-kids bg-brand-blue text-white w-full max-w-xs"
      >
        تحقق من الإجابة
      </button>

      {feedback && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "flex items-center justify-center gap-2 text-2xl font-bold",
            feedback === 'correct' ? "text-brand-green" : "text-brand-red"
          )}
        >
          {feedback === 'correct' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          <span>{feedback === 'correct' ? 'أحسنت!' : 'حاول مرة أخرى'}</span>
        </motion.div>
      )}

      <div className="flex justify-center gap-2">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={cn(
              "w-8 h-8",
              i < count ? "text-brand-yellow fill-current" : "text-gray-200"
            )} 
          />
        ))}
      </div>
    </div>
  );
}
