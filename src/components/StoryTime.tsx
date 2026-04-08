import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Loader2, ChevronRight, Volume2 } from 'lucide-react';
import { generateInteractiveStory, speakText } from '../services/gemini';
import { cn } from '../lib/utils';

interface StoryTimeProps {
  age: number;
  onComplete: () => void;
}

export default function StoryTime({ age, onComplete }: StoryTimeProps) {
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const topics = [
    { id: 'space', title: 'مغامرة الفضاء', icon: '🚀', color: 'bg-brand-purple' },
    { id: 'shapes', title: 'مدينة الأشكال', icon: '📐', color: 'bg-brand-yellow' },
    { id: 'robots', title: 'عالم الروبوتات', icon: '🤖', color: 'bg-brand-blue' },
  ];

  const loadStory = async (topic: string) => {
    setLoading(true);
    const text = await generateInteractiveStory(topic, age);
    setStory(text);
    setLoading(false);
    handleSpeak(text);
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

  if (loading && !story) {
    return (
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">وقت القصة</h1>
          <p className="text-2xl font-bold text-white">اختر موضوعاً لنبدأ الحكاية</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => loadStory(topic.title)}
              className={cn(
                "bento-card p-10 flex flex-col items-center gap-6 group",
                topic.color
              )}
            >
              <span className="text-7xl group-hover:scale-110 transition-transform">{topic.icon}</span>
              <span className="text-3xl font-black">{topic.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
        <p className="text-2xl font-black text-white">جاري تأليف القصة...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bento-card p-12 bg-white space-y-8 relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => handleSpeak(story)}
            disabled={isSpeaking}
            className={cn(
              "p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all",
              isSpeaking ? "bg-gray-100" : "bg-brand-blue hover:bg-brand-blue/80"
            )}
          >
            <Volume2 className={cn("w-6 h-6", isSpeaking && "animate-pulse")} />
          </button>
        </div>

        <div className="flex items-center gap-4 text-brand-purple">
          <BookOpen className="w-10 h-10" />
          <h2 className="text-3xl font-black">حكاية اليوم</h2>
        </div>

        <div className="prose prose-2xl max-w-none">
          <p className="text-3xl font-bold leading-relaxed text-right whitespace-pre-wrap">
            {story}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-4 border-black border-dashed">
          <button 
            onClick={() => { setStory(''); setLoading(true); }}
            className="btn-bento flex-1 text-xl"
          >
            قصة أخرى
          </button>
          <button 
            onClick={onComplete}
            className="btn-bento btn-bento-primary flex-1 flex items-center justify-center gap-2 text-xl"
          >
            لقد استمتعت بالقصة!
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
