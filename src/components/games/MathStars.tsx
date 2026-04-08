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
    <div className="bento-card p-12 text-center space-y-8 bg-white relative overflow-hidden">
      <div className="flex justify-center gap-4 text-7xl font-black text-brand-purple drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <span>{num1}</span>
        <span>+</span>
        <span>{num2}</span>
        <span>=</span>
        <input 
          type="number" 
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-32 border-b-8 border-black text-center outline-none focus:border-brand-blue bg-transparent"
          autoFocus
        />
      </div>

      <button 
        onClick={checkAnswer}
        disabled={!answer || !!feedback}
        className="btn-bento btn-bento-primary w-full max-w-md text-2xl"
      >
        تحقق من الإجابة
      </button>

      {feedback && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "flex items-center justify-center gap-4 text-4xl font-black",
            feedback === 'correct' ? "text-brand-green" : "text-brand-red"
          )}
        >
          {feedback === 'correct' ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
          <span>{feedback === 'correct' ? 'أحسنت!' : 'حاول مرة أخرى'}</span>
        </motion.div>
      )}

      <div className="flex justify-center gap-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={cn(
              "w-12 h-12 border-2 border-black p-1",
              i < count ? "bg-brand-yellow text-black fill-current" : "bg-gray-100 text-gray-300"
            )} 
          />
        ))}
      </div>
    </div>
  );
}
