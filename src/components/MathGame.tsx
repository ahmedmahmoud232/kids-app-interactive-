import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, RefreshCcw, CheckCircle2, XCircle, Loader2, Volume2 } from 'lucide-react';
import { generateAdaptiveQuiz, QuizQuestion, speakText } from '../services/gemini';
import { cn } from '../lib/utils';

interface MathGameProps {
  age: number;
  level: number;
  onComplete: (points: number) => void;
}

export default function MathGame({ age, level, onComplete }: MathGameProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      const quiz = await generateAdaptiveQuiz('الرياضيات والأرقام', age, level);
      setQuestions(quiz);
      setLoading(false);
      if (quiz.length > 0) {
        handleSpeak(quiz[0].question);
      }
    };
    loadQuiz();
  }, [age, level]);

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    const audioUrl = await speakText(text);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } else {
      setIsSpeaking(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const correct = option === questions[currentIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);

    handleSpeak(correct ? "أحسنت! إجابة صحيحة." : "حاول مرة أخرى.");

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setSelectedOption(null);
        setIsCorrect(null);
        handleSpeak(questions[currentIndex + 1].question);
      } else {
        setShowResult(true);
      }
    }, 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
        <p className="text-2xl font-black text-white">جاري تحضير المسائل الرياضية...</p>
      </div>
    );
  }

  if (showResult) {
    const totalPoints = score * 50;
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bento-card p-12 text-center space-y-8 bg-white max-w-2xl mx-auto"
      >
        <Trophy className="w-24 h-24 mx-auto text-brand-yellow drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" />
        <h2 className="text-5xl font-black">انتهى التحدي!</h2>
        <p className="text-2xl font-bold text-gray-500">لقد حصلت على {totalPoints} نقطة</p>
        <button 
          onClick={() => onComplete(totalPoints)}
          className="btn-bento btn-bento-primary w-full text-2xl"
        >
          العودة للرئيسية
        </button>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bento-card p-12 bg-white space-y-10 relative">
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => handleSpeak(currentQuestion.question)}
            disabled={isSpeaking}
            className={cn(
              "p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all",
              isSpeaking ? "bg-gray-100" : "bg-brand-blue hover:bg-brand-blue/80"
            )}
          >
            <Volume2 className={cn("w-6 h-6", isSpeaking && "animate-pulse")} />
          </button>
        </div>

        <div className="text-center space-y-2">
          <p className="text-brand-purple font-black text-xl uppercase tracking-widest">تحدي الرياضيات</p>
          <h2 className="text-4xl font-black leading-tight">{currentQuestion.question}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(option)}
              disabled={!!selectedOption}
              className={cn(
                "bento-card p-6 text-2xl font-bold transition-all flex justify-between items-center",
                selectedOption === option 
                  ? (isCorrect ? "bg-brand-green" : "bg-brand-red")
                  : "bg-white hover:bg-gray-50"
              )}
            >
              <span>{option}</span>
              {selectedOption === option && (
                isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-2">
          {[...Array(questions.length)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-12 h-3 border-2 border-black",
                i < currentIndex ? "bg-brand-green" : i === currentIndex ? "bg-brand-yellow" : "bg-gray-100"
              )} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
