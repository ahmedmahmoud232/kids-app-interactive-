import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  Gamepad2, 
  BookOpen, 
  Video, 
  Settings, 
  Star, 
  Trophy,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Play,
  Brain
} from 'lucide-react';
import { cn } from './lib/utils';
import { GAMES, UserProfile } from './types';
import MathGame from './components/MathGame';
import StoryTime from './components/StoryTime';
import QuizSection from './components/QuizSection';

// Pages
const Home = () => {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-4 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-brand-purple"
        >
          مرحباً بك في عالم المعرفة!
        </motion.h1>
        <p className="text-xl text-gray-600">اختر مغامرتك التعليمية اليوم</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {GAMES.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={`/game/${game.id}`} className="block group">
              <div className={cn(
                "kids-card p-8 h-full flex flex-col items-center text-center space-y-4",
                "group-hover:border-brand-blue"
              )}>
                <div className={cn("p-6 rounded-full", game.color)}>
                  <Gamepad2 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold">{game.title}</h3>
                <p className="text-gray-600">{game.description}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-brand-purple bg-purple-50 px-4 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-current" />
                  <span>سن {game.minAge}-{game.maxAge}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const GameView = ({ user, onUpdateProgress }: { user: UserProfile, onUpdateProgress: (points: number) => void }) => {
  const { id } = useParams();
  const game = GAMES.find(g => g.id === id);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  if (!game) return <div>اللعبة غير موجودة</div>;

  if (isPlaying) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setIsPlaying(false)}
          className="flex items-center gap-2 text-gray-600 hover:text-brand-purple transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>إنهاء اللعبة</span>
        </button>
        <MathGame 
          age={user.age} 
          level={user.level} 
          onComplete={(points) => {
            onUpdateProgress(points);
            setIsPlaying(false);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-brand-purple transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>العودة للرئيسية</span>
      </button>

      <div className="kids-card p-12 bg-white min-h-[500px] flex flex-col items-center justify-center space-y-8">
        <div className={cn("p-8 rounded-full", game.color)}>
          <Gamepad2 className="w-24 h-24 text-white" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold">{game.title}</h2>
          <p className="text-xl text-gray-500">مرحلة التعلم النشط</p>
        </div>
        
        <div className="w-full max-w-md p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
          <p className="text-lg text-gray-600 mb-6">هل أنت مستعد للبدء؟</p>
          <button 
            onClick={() => setIsPlaying(true)}
            className="btn-kids bg-brand-green text-white w-full flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6 fill-current" />
            ابدأ اللعب الآن!
          </button>
        </div>
      </div>
    </div>
  );
};

const ParentDashboard = ({ user, setUser }: { user: UserProfile, setUser: React.Dispatch<React.SetStateAction<UserProfile>> }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">لوحة تحكم الوالدين</h1>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <span className="text-gray-500 ml-2">الطفل:</span>
            <span className="font-bold">{user.name}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="kids-card p-6 bg-brand-blue/10 border-brand-blue/20">
          <p className="text-sm text-brand-blue font-bold uppercase tracking-wider">النقاط الكلية</p>
          <p className="text-4xl font-bold mt-2">{user.points}</p>
        </div>
        <div className="kids-card p-6 bg-brand-green/10 border-brand-green/20">
          <p className="text-sm text-brand-green font-bold uppercase tracking-wider">عمر الطفل</p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-4xl font-bold">{user.age}</p>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => setUser(prev => ({ ...prev, age: Math.min(13, prev.age + 1) }))}
                className="p-1 hover:bg-white rounded shadow-sm"
              >
                <Star className="w-4 h-4 text-brand-green fill-current" />
              </button>
              <button 
                onClick={() => setUser(prev => ({ ...prev, age: Math.max(4, prev.age - 1) }))}
                className="p-1 hover:bg-white rounded shadow-sm"
              >
                <Star className="w-4 h-4 text-gray-300 fill-current" />
              </button>
            </div>
          </div>
        </div>
        <div className="kids-card p-6 bg-brand-yellow/10 border-brand-yellow/20">
          <p className="text-sm text-brand-yellow font-bold uppercase tracking-wider">الألعاب المكتملة</p>
          <p className="text-4xl font-bold mt-2">12</p>
        </div>
        <div className="kids-card p-6 bg-brand-purple/10 border-brand-purple/20">
          <p className="text-sm text-brand-purple font-bold uppercase tracking-wider">المستوى الحالي</p>
          <p className="text-4xl font-bold mt-2">{user.level}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="kids-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="text-brand-yellow" />
            التقدم في المهارات
          </h3>
          <div className="space-y-6">
            {[
              { label: 'الرياضيات', value: 85, color: 'bg-brand-yellow' },
              { label: 'اللغة العربية', value: 60, color: 'bg-brand-blue' },
              { label: 'العلوم', value: 45, color: 'bg-brand-green' },
              { label: 'المنطق', value: 90, color: 'bg-brand-purple' },
            ].map(skill => (
              <div key={skill.label} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{skill.label}</span>
                  <span>{skill.value}%</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.value}%` }}
                    className={cn("h-full rounded-full", skill.color)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kids-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Star className="text-brand-purple" />
            آخر النشاطات
          </h3>
          <div className="space-y-4">
            {[
              { game: 'نجوم الحساب', date: 'منذ 10 دقائق', points: '+50' },
              { game: 'مكعبات الكلمات', date: 'منذ ساعة', points: '+30' },
              { game: 'متاهة المنطق', date: 'أمس', points: '+100' },
            ].map((activity, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold">{activity.game}</p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
                <span className="font-bold text-brand-green">{activity.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : {
      name: 'أحمد',
      age: 6,
      level: 1,
      points: 0,
      progress: {}
    };
  });

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(user));
  }, [user]);

  const updateProgress = (points: number) => {
    setUser(prev => ({
      ...prev,
      points: prev.points + points,
      level: Math.floor((prev.points + points) / 500) + 1
    }));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                ن
              </div>
              <span className="text-2xl font-bold text-brand-purple hidden sm:block">نبراس المعرفة</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-6">
              <Link to="/" className="p-2 hover:bg-gray-50 rounded-xl transition-colors group">
                <HomeIcon className="w-6 h-6 text-gray-400 group-hover:text-brand-purple" />
              </Link>
              <Link to="/games" className="p-2 hover:bg-gray-50 rounded-xl transition-colors group">
                <Gamepad2 className="w-6 h-6 text-gray-400 group-hover:text-brand-blue" />
              </Link>
              <Link to="/quizzes" className="p-2 hover:bg-gray-50 rounded-xl transition-colors group">
                <Brain className="w-6 h-6 text-gray-400 group-hover:text-brand-purple" />
              </Link>
              <Link to="/stories" className="p-2 hover:bg-gray-50 rounded-xl transition-colors group">
                <BookOpen className="w-6 h-6 text-gray-400 group-hover:text-brand-green" />
              </Link>
              <Link to="/videos" className="p-2 hover:bg-gray-50 rounded-xl transition-colors group">
                <Video className="w-6 h-6 text-gray-400 group-hover:text-brand-red" />
              </Link>
              <div className="w-px h-8 bg-gray-100 mx-2" />
              <Link to="/parent" className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <LayoutDashboard className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-bold text-gray-600 hidden md:block">لوحة الوالدين</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<Home />} />
              <Route path="/game/:id" element={<GameView user={user} onUpdateProgress={updateProgress} />} />
              <Route path="/quizzes" element={<QuizSection age={user.age} level={user.level} onComplete={updateProgress} />} />
              <Route path="/parent" element={<ParentDashboard user={user} setUser={setUser} />} />
              <Route path="/stories" element={<StoryTime age={user.age} onComplete={() => updateProgress(20)} />} />
              <Route path="/videos" element={<Placeholder title="فيديوهات تعليمية" color="bg-brand-red" />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
            <p>© 2026 نبراس المعرفة - منصة تعليمية آمنة للأطفال</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function Placeholder({ title, color }: { title: string, color: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className={cn("w-32 h-32 rounded-full flex items-center justify-center text-white", color)}>
        <Star className="w-16 h-16" />
      </div>
      <h2 className="text-3xl font-bold">{title}</h2>
      <p className="text-gray-500">قريباً في مغامرتنا القادمة!</p>
    </div>
  );
}
