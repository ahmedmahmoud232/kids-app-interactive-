import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, ChevronLeft, Play, Star, Trophy, RefreshCcw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { generateAdaptiveQuiz, QuizQuestion } from '../services/gemini';
import { cn } from '../lib/utils';

interface QuizSectionProps {
  age: number;
  level: number;
  onComplete: (points: number) => void;
}

const SUBJECTS = [
  { id: 'math', label: 'الرياضيات', icon: '🔢', color: 'bg-brand-yellow', prompt: 'الرياضيات والأرقام' },
  { id: 'science', label: 'العلوم', icon: '🪐', color: 'bg-brand-green', prompt: 'العلوم والكواكب والنجوم' },
  { id: 'language', label: 'اللغة العربية', icon: '✍️', color: 'bg-brand-blue', prompt: 'اللغة العربية والحروف' },
  { id: 'logic', label: 'المنطق', icon: '🧩', color: 'bg-brand-purple', prompt: 'المنطق والأشكال الهندسية' },
];

export default function QuizSection({ age, level, onComplete }: QuizSectionProps) {
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  const startQuiz = async (subject: typeof SUBJECTS[0]) => {
    setSelectedSubject(subject);
    setLoading(true);
    const newQuestions = await generateAdaptiveQuiz(subject.prompt, age, level);
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

  const reset = () => {
    setSelectedSubject(null);
    setQuestions([]);
    setShowResult(false);
  };

  if (!selectedSubject) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-brand-purple/10 rounded-full text-brand-purple mb-4">
            <Brain className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold">تحدي الذكاء</h2>
          <p className="text-xl text-gray-600">اختر موضوعاً لاختبار معلوماتك!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {SUBJECTS.map((subject) => (
            <motion.button
              key={subject.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startQuiz(subject)}
              className="kids-card p-8 flex items-center gap-6 text-right group"
            >
              <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner", subject.color)}>
                {subject.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">{subject.label}</h3>
                <p className="text-gray-500">تحديات ممتعة في {subject.label}</p>
              </div>
              <Play className="w-6 h-6 text-gray-300 group-hover:text-brand-purple transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-brand-purple animate-spin" />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-brand-yellow animate-pulse" />
        </div>
        <p className="text-2xl font-bold text-gray-600">نحن نجهز لك أسئلة ذكية...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="kids-card p-12 text-center space-y-8 max-w-2xl mx-auto"
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
          <h2 className="text-4xl font-bold text-brand-purple">رائع جداً!</h2>
          <p className="text-xl text-gray-600">لقد أتممت تحدي {selectedSubject.label}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => startQuiz(selectedSubject)}
            className="btn-kids bg-brand-blue text-white flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            حاول مرة أخرى
          </button>
          <button 
            onClick={() => {
              onComplete(score);
              reset();
            }}
            className="btn-kids bg-brand-green text-white"
          >
            العودة للمواضيع
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <button 
          onClick={reset}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-purple font-bold"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>تغيير الموضوع</span>
        </button>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <span className="text-2xl">{selectedSubject.icon}</span>
          <span className="font-bold">{selectedSubject.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            className={cn("h-full", selectedSubject.color.replace('bg-', 'bg-opacity-100 bg-'))}
            style={{ backgroundColor: 'var(--color-brand-purple)' }}
          />
        </div>
        <span className="font-bold text-gray-400">{currentIndex + 1} / {questions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="kids-card p-10 space-y-10"
        >
          <h3 className="text-3xl font-bold text-center leading-relaxed">
            {currentQuestion?.question}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion?.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedOption}
                className={cn(
                  "p-6 rounded-2xl text-xl font-bold border-4 transition-all text-center",
                  !selectedOption && "hover:border-brand-purple hover:bg-purple-50 border-gray-100",
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-6 rounded-2xl flex items-start gap-4",
                isCorrect ? "bg-green-50 text-green-800 border-2 border-green-100" : "bg-red-50 text-red-800 border-2 border-red-100"
              )}
            >
              <div className={cn("p-2 rounded-full", isCorrect ? "bg-green-200" : "bg-red-200")}>
                {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg">{isCorrect ? 'إجابة صحيحة!' : 'حاول مرة أخرى في المرة القادمة'}</p>
                <p className="opacity-90">{currentQuestion.explanation}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
