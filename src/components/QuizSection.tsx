import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, ChevronLeft, Play, Star, Trophy, RefreshCcw, CheckCircle2, XCircle, Loader2, Volume2 } from 'lucide-react';
import { generateAdaptiveQuiz, QuizQuestion, speakText } from '../services/gemini';
import { cn } from '../lib/utils';

// Sound Utility
const playSound = (type: 'click' | 'success' | 'pop' | 'error') => {
  const sounds = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    pop: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'
  };
  const audio = new Audio(sounds[type]);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

interface QuizSectionProps {
  age: number;
  level: number;
  onComplete: (points: number) => void;
}

export default function QuizSection({ age, level, onComplete }: QuizSectionProps) {
  const [subject, setSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const subjects = [
    { id: 'math', title: 'الرياضيات', icon: '🔢', color: 'bg-brand-yellow' },
    { id: 'science', title: 'العلوم', icon: '🧪', color: 'bg-brand-blue' },
    { id: 'language', title: 'اللغة العربية', icon: '📚', color: 'bg-brand-green' },
    { id: 'logic', title: 'المنطق', icon: '🧩', color: 'bg-brand-purple' },
  ];

  const startQuiz = async (sub: string) => {
    playSound('click');
    setSubject(sub);
    setLoading(true);
    const quiz = await generateAdaptiveQuiz(sub, age, level);
    setQuestions(quiz);
    setLoading(false);
    if (quiz.length > 0) {
      handleSpeak(quiz[0].question);
    }
  };

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
    if (correct) {
      setScore(s => s + 1);
      playSound('success');
    } else {
      playSound('error');
    }

    handleSpeak(correct ? "أحسنت! إجابة صحيحة." : "حاول مرة أخرى في السؤال القادم.");

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setSelectedOption(null);
        setIsCorrect(null);
        handleSpeak(questions[currentIndex + 1].question);
      } else {
        setShowResult(true);
      }
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
        <p className="text-2xl font-black text-white">جاري تحضير التحدي الذكي...</p>
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
        <div className="space-y-2">
          <h2 className="text-5xl font-black">عمل رائع!</h2>
          <p className="text-2xl font-bold text-gray-500">لقد أجبت على {score} من {questions.length} أسئلة</p>
        </div>
        <div className="bento-card p-6 bg-brand-green inline-block">
          <p className="text-3xl font-black">+{totalPoints} نقطة</p>
        </div>
        <button 
          onClick={() => {
            onComplete(totalPoints);
            setSubject(null);
            setShowResult(false);
            setCurrentIndex(0);
            setScore(0);
          }}
          className="btn-bento btn-bento-primary w-full text-2xl"
        >
          العودة للقائمة
        </button>
      </motion.div>
    );
  }

  if (!subject) {
    return (
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">تحدي الذكاء</h1>
          <p className="text-2xl font-bold text-white">اختر موضوعاً لاختبار مهاراتك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => startQuiz(sub.title)}
              className={cn(
                "bento-card p-10 flex flex-col items-center gap-6 group",
                sub.color
              )}
            >
              <span className="text-7xl group-hover:scale-110 transition-transform">{sub.icon}</span>
              <span className="text-4xl font-black">{sub.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center text-white font-black text-2xl">
        <span>السؤال {currentIndex + 1} من {questions.length}</span>
        <div className="flex gap-2">
          {[...Array(questions.length)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-4 h-4 border-2 border-black",
                i < currentIndex ? "bg-brand-green" : i === currentIndex ? "bg-brand-yellow" : "bg-white/20"
              )} 
            />
          ))}
        </div>
      </div>

      <div className="bento-card p-12 bg-white space-y-10 relative overflow-hidden">
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

        <h2 className="text-4xl font-black text-center leading-tight pt-4">
          {currentQuestion.question}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(option)}
              disabled={!!selectedOption}
              className={cn(
                "bento-card p-6 text-2xl font-bold text-right transition-all flex justify-between items-center",
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

        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-6 border-2 border-black font-bold text-xl",
                isCorrect ? "bg-brand-green/10" : "bg-brand-red/10"
              )}
            >
              <p className="flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
