import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, RefreshCcw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { generateAdaptiveQuiz, QuizQuestion } from '../services/gemini';
import { cn } from '../lib/utils';

interface MathGameProps {
  age: number;
  level: number;
  onComplete: (points: number) => void;
}

export default function MathGame({ age, level, onComplete }: MathGameProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [level]);

  const loadQuestions = async () => {
    setLoading(true);
    const newQuestions = await generateAdaptiveQuiz('الرياضيات والأرقام', age, level);
    setQuestions(newQuestions);
    setLoading(false);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
  };

  const handleAnswer = (option: string) => {
    if (selectedOption) return;
    
    setSelectedOption(option);
    const correct = option === questions[currentIndex].correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 10);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
        <p className="text-xl font-bold text-gray-500">نحن نجهز لك تحديات ممتعة...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8 p-8"
      >
        <div className="relative inline-block">
          <Trophy className="w-32 h-32 text-brand-yellow mx-auto" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-4 -right-4 bg-brand-red text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl"
          >
            {score}
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-brand-purple">عمل رائع!</h2>
          <p className="text-xl text-gray-600">لقد أكملت جميع التحديات بنجاح</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={loadQuestions}
            className="btn-kids bg-brand-blue text-white flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            العب مرة أخرى
          </button>
          <button 
            onClick={() => onComplete(score)}
            className="btn-kids bg-brand-green text-white"
          >
            العودة للمغامرات
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            className="h-full bg-brand-blue"
          />
        </div>
        <span className="font-bold text-gray-400">{currentIndex + 1} / {questions.length}</span>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="kids-card p-8 space-y-8"
        >
          <h3 className="text-3xl font-bold text-center leading-relaxed">
            {currentQuestion.question}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedOption}
                className={cn(
                  "p-6 rounded-2xl text-xl font-bold border-4 transition-all",
                  !selectedOption && "hover:border-brand-blue hover:bg-blue-50 border-gray-100",
                  selectedOption === option && option === currentQuestion.correctAnswer && "bg-brand-green border-brand-green text-white",
                  selectedOption === option && option !== currentQuestion.correctAnswer && "bg-brand-red border-brand-red text-white",
                  selectedOption && option === currentQuestion.correctAnswer && "border-brand-green bg-green-50",
                  selectedOption && option !== currentQuestion.correctAnswer && "opacity-50"
                )}
              >
                {option}
              </button>
            ))}
          </div>

          {selectedOption && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-xl flex items-center gap-3",
                isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}
            >
              {isCorrect ? <CheckCircle2 /> : <XCircle />}
              <p className="font-medium">{currentQuestion.explanation}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
