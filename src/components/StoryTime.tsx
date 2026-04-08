import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { generateInteractiveStory } from '../services/gemini';
import { cn } from '../lib/utils';

interface StoryTimeProps {
  age: number;
  onComplete: () => void;
}

export default function StoryTime({ age, onComplete }: StoryTimeProps) {
  const [story, setStory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState('الفضاء والمجرات');

  useEffect(() => {
    loadStory();
  }, [topic]);

  const loadStory = async () => {
    setLoading(true);
    const text = await generateInteractiveStory(topic, age);
    setStory(text);
    setLoading(false);
  };

  const topics = [
    { id: 'space', label: 'الفضاء', icon: '🚀', color: 'bg-brand-purple' },
    { id: 'shapes', label: 'الأشكال السحرية', icon: '📐', color: 'bg-brand-blue' },
    { id: 'robots', label: 'الروبوتات الصديقة', icon: '🤖', color: 'bg-brand-green' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-12 h-12 text-brand-green animate-spin" />
        <p className="text-xl font-bold text-gray-500">نحن نكتب لك قصة سحرية...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {topics.map(t => (
          <button
            key={t.id}
            onClick={() => setTopic(t.label)}
            className={cn(
              "flex-shrink-0 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all",
              topic === t.label ? "bg-brand-purple text-white shadow-lg scale-105" : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="kids-card p-10 bg-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BookOpen className="w-32 h-32" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3 text-brand-purple">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">قصة اليوم: {topic}</h2>
          </div>

          <div className="prose prose-xl max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {story}
          </div>

          <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
            <button 
              onClick={loadStory}
              className="text-brand-blue font-bold hover:underline"
            >
              قصة أخرى؟
            </button>
            <button 
              onClick={onComplete}
              className="btn-kids bg-brand-purple text-white flex items-center gap-2"
            >
              <span>لقد استمتعت بالقصة!</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
