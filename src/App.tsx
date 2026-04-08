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
  Brain,
  FlaskConical,
  Languages,
  Cpu,
  Square,
  Plus,
  User,
  Volume2,
  LogIn,
  Loader2,
  Trash2,
  AlertCircle,
  Bot,
  Sparkles
} from 'lucide-react';
import { cn } from './lib/utils';
import { GAMES, UserProfile, ChildProfile } from './types';
import MathGame from './components/MathGame';
import StoryTime from './components/StoryTime';
import QuizSection from './components/QuizSection';
import MathStars from './components/games/MathStars';
import WordBlocks from './components/games/WordBlocks';
import { speakText } from './services/gemini';
import { isAIConnected } from './services/gemini';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, query, where, orderBy, limit, addDoc, Timestamp } from 'firebase/firestore';

// Sound Utility
const playSound = (type: 'click' | 'success' | 'pop' | 'level-up') => {
  const sounds = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    pop: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
    'level-up': 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
  };
  const audio = new Audio(sounds[type]);
  audio.volume = 0.4;
  audio.play().catch(() => {}); // Ignore autoplay blocks
};

const IconMap: Record<string, any> = {
  Star,
  Square,
  Cpu,
  FlaskConical,
  Languages,
  Gamepad2
};

// Error Boundary Component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught error:", error);
      setHasError(true);
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
        <div className="bento-card p-12 bg-white max-w-md">
          <h2 className="text-3xl font-black text-brand-red mb-4">عذراً، حدث خطأ ما</h2>
          <p className="text-gray-600 mb-6">يرجى المحاولة مرة أخرى أو التواصل مع الدعم إذا استمرت المشكلة.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-bento btn-bento-primary"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

// Abstract Shapes Component
const AbstractShapes = () => (
  <>
    <div className="abstract-shape semi-circle top-10 left-10 rotate-45 opacity-20" />
    <div className="abstract-shape yellow-circle bottom-20 right-10 opacity-20" />
    <div className="abstract-shape semi-circle bottom-10 left-20 -rotate-12 opacity-10" />
  </>
);

// Pages
const Home = ({ currentChild, games, aiConnected }: { currentChild: ChildProfile | null, games: any[], aiConnected: boolean }) => {
  const navigate = useNavigate();

  if (!currentChild) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="bento-card p-12 text-center space-y-6 max-w-md">
          <User className="w-20 h-20 mx-auto text-brand-purple" />
          <h2 className="text-3xl font-bold">مرحباً بك!</h2>
          <p className="text-gray-600">يرجى إضافة طفل من لوحة الوالدين للبدء في المغامرة.</p>
          <Link to="/parent" className="btn-bento btn-bento-primary inline-block">
            الذهاب للوحة الوالدين
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 relative">
      <AbstractShapes />
      <section className="text-center space-y-4 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
        >
          مرحباً {currentChild.name}!
        </motion.h1>
        <p className="text-2xl font-bold text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          مستعد لمغامرة جديدة في سن الـ {currentChild.age}؟
        </p>
        
        {!aiConnected && (
          <div className="bg-brand-red/20 border-2 border-brand-red p-4 max-w-md mx-auto mt-4 text-white font-bold">
            ⚠️ تنبيه: الذكاء الاصطناعي غير متصل. سيتم استخدام المحتوى الاحتياطي.
            <br/>
            <span className="text-sm font-normal opacity-80">يرجى التأكد من إعداد GEMINI_API_KEY في إعدادات النشر (Environment Variables).</span>
          </div>
        )}
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button 
            onClick={() => {
              playSound('click');
              const availableGames = games.filter(g => currentChild.age >= g.minAge && currentChild.age <= g.maxAge);
              if (availableGames.length > 0) {
                const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)];
                navigate(`/game/${randomGame.id}`);
              }
            }}
            className="btn-bento btn-bento-primary flex items-center gap-2 text-xl px-10"
          >
            <Play className="w-6 h-6 fill-current" />
            لعب سريع
          </button>
          
          <button 
            onClick={() => {
              playSound('pop');
              navigate('/stories', { state: { autoLoad: 'عالم الروبوتات' } });
            }}
            className="btn-bento bg-brand-blue text-white flex items-center gap-2 text-xl px-10"
          >
            <Bot className="w-6 h-6" />
            قصة روبوت
          </button>

          <Link 
            to="/quizzes"
            onClick={() => playSound('click')}
            className="btn-bento bg-brand-purple text-white flex items-center gap-2 text-xl px-10"
          >
            <Brain className="w-6 h-6" />
            تحدي اليوم
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.filter(g => currentChild.age >= g.minAge && currentChild.age <= g.maxAge).map((game, index) => {
          const Icon = IconMap[game.icon] || Gamepad2;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => playSound('click')}
            >
              <Link to={`/game/${game.id}`} className="block group">
                <div className={cn(
                  "bento-card p-8 h-full flex flex-col items-center text-center space-y-6 relative overflow-hidden",
                  "group-hover:bg-gray-50"
                )}>
                  <div className={cn("p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", game.color)}>
                    <Icon className="w-12 h-12 text-black" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black">{game.title}</h3>
                    <p className="text-lg font-medium text-gray-600">{game.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold bg-black text-white px-4 py-1">
                    <Star className="w-4 h-4 fill-brand-yellow text-brand-yellow" />
                    <span>سن {game.minAge}-{game.maxAge}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const GameView = ({ currentChild, games, onUpdateProgress }: { currentChild: ChildProfile | null, games: any[], onUpdateProgress: (points: number) => void }) => {
  const { id } = useParams();
  const game = games.find(g => g.id === id);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  if (!currentChild) return <Home currentChild={null} games={games} aiConnected={false} />;
  if (!game) return (
    <div className="text-center py-20 space-y-4">
      <h2 className="text-3xl font-bold text-white">عذراً، اللعبة غير موجودة</h2>
      <button onClick={() => navigate('/')} className="btn-bento bg-white">العودة للرئيسية</button>
    </div>
  );

  const renderGame = () => {
    switch (id) {
      case 'math-stars':
        return <MathStars onComplete={(p) => { onUpdateProgress(p); setIsPlaying(false); }} />;
      case 'word-blocks':
        return <WordBlocks onComplete={(p) => { onUpdateProgress(p); setIsPlaying(false); }} />;
      default:
        return (
          <MathGame 
            age={currentChild.age} 
            level={currentChild.level} 
            onComplete={(points) => {
              onUpdateProgress(points);
              setIsPlaying(false);
            }} 
          />
        );
    }
  };

  if (isPlaying) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setIsPlaying(false)}
          className="flex items-center gap-2 text-white font-bold hover:underline"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>إنهاء اللعبة</span>
        </button>
        {renderGame()}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white font-bold hover:underline"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>العودة للرئيسية</span>
      </button>

      <div className="bento-card p-12 bg-white min-h-[500px] flex flex-col items-center justify-center space-y-8 relative">
        <AbstractShapes />
        <div className={cn("p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]", game.color)}>
          <Gamepad2 className="w-24 h-24 text-black" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-5xl font-black">{game.title}</h2>
          <p className="text-2xl font-bold text-gray-500">مرحلة التعلم النشط</p>
        </div>
        
        <div className="w-full max-w-md p-8 bg-gray-50 border-4 border-black border-dashed text-center">
          <p className="text-2xl font-bold text-gray-600 mb-6">هل أنت مستعد يا {currentChild.name}؟</p>
          <button 
            onClick={() => {
              playSound('pop');
              setIsPlaying(true);
            }}
            className="btn-bento btn-bento-primary w-full flex items-center justify-center gap-2 text-2xl"
          >
            <Play className="w-8 h-8 fill-current" />
            ابدأ اللعب الآن!
          </button>
        </div>
      </div>
    </div>
  );
};

const ParentDashboard = ({ user, setUser }: { user: UserProfile, setUser: React.Dispatch<React.SetStateAction<UserProfile>> }) => {
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState(4);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const addChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName) return;
    playSound('pop');

    const newChild: ChildProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: newChildName,
      age: newChildAge,
      level: 1,
      points: 0,
      progress: {}
    };

    const updatedUser = {
      ...user,
      children: [...user.children, newChild],
      currentChildId: user.currentChildId || newChild.id
    };

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), updatedUser);
      }
      setUser(updatedUser);
      setNewChildName('');
      setNewChildAge(4);
      setShowAddForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
    }
  };

  const deleteChild = async (id: string) => {
    playSound('click');
    const updatedUser = {
      ...user,
      children: user.children.filter(c => c.id !== id),
      currentChildId: user.currentChildId === id ? (user.children.find(c => c.id !== id)?.id || null) : user.currentChildId
    };

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), updatedUser);
      }
      setUser(updatedUser);
      setDeleteConfirmId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
    }
  };

  const currentChild = user.children.find(c => c.id === user.currentChildId);

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-5xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">لوحة الوالدين</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-bento btn-bento-primary flex items-center gap-2"
        >
          <Plus className="w-6 h-6" />
          <span>إضافة طفل</span>
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bento-card p-8 bg-white max-w-md mx-auto"
          >
            <form onSubmit={addChild} className="space-y-6">
              <h3 className="text-2xl font-black">إضافة طفل جديد</h3>
              <div className="space-y-2">
                <label className="block font-bold">اسم الطفل</label>
                <input 
                  type="text" 
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full p-3 border-2 border-black focus:outline-none focus:bg-gray-50"
                  placeholder="مثال: أحمد"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-bold">العمر ({newChildAge} سنوات)</label>
                <input 
                  type="range" 
                  min="4" 
                  max="13" 
                  value={newChildAge}
                  onChange={(e) => setNewChildAge(parseInt(e.target.value))}
                  className="w-full accent-brand-purple"
                />
              </div>
              <button type="submit" className="btn-bento btn-bento-primary w-full">حفظ</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Children List */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-3xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">الأطفال</h3>
            <div className="space-y-4">
            {user.children.map(child => (
              <div key={child.id} className="relative group">
                <button
                  onClick={async () => {
                    playSound('click');
                    const updatedUser = { ...user, currentChildId: child.id };
                    if (auth.currentUser) {
                      await setDoc(doc(db, 'users', auth.currentUser.uid), updatedUser);
                    }
                    setUser(updatedUser);
                  }}
                  className={cn(
                    "bento-card p-6 w-full flex items-center gap-4 text-right transition-all",
                    user.currentChildId === child.id ? "bg-brand-yellow" : "bg-white hover:bg-gray-50"
                  )}
                >
                  <div className="w-12 h-12 bg-brand-purple border-2 border-black flex items-center justify-center text-white">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-black">{child.name}</p>
                    <p className="font-bold text-gray-600">{child.age} سنوات</p>
                  </div>
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(child.id)}
                  className="absolute -top-2 -left-2 p-2 bg-brand-red text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteConfirmId && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bento-card p-8 bg-white max-w-sm w-full space-y-6"
                >
                  <div className="flex items-center gap-4 text-brand-red">
                    <AlertCircle className="w-10 h-10" />
                    <h3 className="text-2xl font-black">هل أنت متأكد؟</h3>
                  </div>
                  <p className="text-gray-600 font-bold">سيتم حذف جميع بيانات هذا الطفل بشكل نهائي.</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => deleteChild(deleteConfirmId)}
                      className="btn-bento bg-brand-red text-white flex-1"
                    >
                      حذف
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(null)}
                      className="btn-bento bg-gray-200 flex-1"
                    >
                      إلغاء
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Current Child Stats */}
        {currentChild && (
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-3xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">إحصائيات {currentChild.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bento-card p-8 bg-brand-blue">
                <p className="text-lg font-black uppercase">النقاط الكلية</p>
                <p className="text-5xl font-black mt-2">{currentChild.points}</p>
              </div>
              <div className="bento-card p-8 bg-brand-green">
                <p className="text-lg font-black uppercase">المستوى</p>
                <p className="text-5xl font-black mt-2">{currentChild.level}</p>
              </div>
            </div>

            <div className="bento-card p-8 bg-white">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
                <Trophy className="text-brand-yellow" />
                التقدم في المهارات
              </h3>
              <div className="space-y-8">
                {[
                  { label: 'الرياضيات', value: 85, color: 'bg-brand-yellow' },
                  { label: 'اللغة العربية', value: 60, color: 'bg-brand-blue' },
                  { label: 'العلوم', value: 45, color: 'bg-brand-green' },
                  { label: 'المنطق', value: 90, color: 'bg-brand-purple' },
                ].map(skill => (
                  <div key={skill.label} className="space-y-3">
                    <div className="flex justify-between font-black text-xl">
                      <span>{skill.label}</span>
                      <span>{skill.value}%</span>
                    </div>
                    <div className="h-6 w-full bg-gray-100 border-2 border-black overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.value}%` }}
                        className={cn("h-full", skill.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

const AppContent = () => {
  const [user, setUser] = useState<UserProfile>({
    currentChildId: null,
    children: []
  });
  const [games, setGames] = useState<any[]>(GAMES);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [aiConnected, setAiConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAI = async () => {
      try {
        const connected = await isAIConnected();
        setAiConnected(connected);
      } catch (error) {
        console.error("AI Connection check failed:", error);
        setAiConnected(false);
      }
    };
    checkAI();
    
    const interval = setInterval(checkAI, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesSnap = await getDocs(collection(db, 'games'));
        if (!gamesSnap.empty) {
          const gamesData = gamesSnap.docs.map(doc => doc.data());
          setGames(gamesData);
        } else if (auth.currentUser?.email === "ahmedmahmoud22990@gmail.com") {
          for (const game of GAMES) {
            await setDoc(doc(db, 'games', game.id), game);
          }
          setGames(GAMES);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        fetchGames();
        try {
          const docRef = doc(db, 'users', fUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          } else {
            const initialProfile = { currentChildId: null, children: [] };
            await setDoc(docRef, initialProfile);
            setUser(initialProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${fUser.uid}`);
        }
      } else {
        setGames(GAMES);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // No notifications listener
  }, [firebaseUser]);

  const currentChild = user.children.find(c => c.id === user.currentChildId) || null;

  const updateProgress = async (points: number) => {
    if (!user.currentChildId || !firebaseUser) return;
    
    playSound('success');
    
    const updatedUser = {
      ...user,
      children: user.children.map(c => {
        if (c.id === user.currentChildId) {
          const newPoints = c.points + points;
          const oldLevel = c.level;
          const newLevel = Math.floor(newPoints / 500) + 1;
          
          if (newLevel > oldLevel) {
            playSound('level-up');
          }

          return {
            ...c,
            points: newPoints,
            level: newLevel
          };
        }
        return c;
      })
    };

    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser);
      setUser(updatedUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("خطأ: هذا النطاق (Domain) غير مصرح له بتسجيل الدخول. يرجى إضافة رابط الموقع إلى قائمة 'Authorized Domains' في Firebase Console.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Ignore
      } else {
        alert("حدث خطأ أثناء تسجيل الدخول: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser({ currentChildId: null, children: [] });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-16 h-16 text-white animate-spin" />
        <p className="text-2xl font-black text-white">جاري تحميل عالم المعرفة...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
        <AbstractShapes />
        <div className="bento-card p-12 bg-white text-center space-y-8 max-w-lg relative">
          <div className="w-24 h-24 bg-brand-yellow border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mx-auto flex items-center justify-center text-5xl font-black">
            ن
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black">نبراس المعرفة</h1>
            <p className="text-xl font-bold text-gray-500">منصة تعليمية آمنة وممتعة لأطفالك</p>
          </div>
          <button 
            onClick={handleLogin}
            className="btn-bento btn-bento-primary w-full flex items-center justify-center gap-4 text-2xl"
          >
            <LogIn className="w-8 h-8" />
            تسجيل الدخول باستخدام جوجل
          </button>
          <p className="text-sm text-gray-400">نحن نحافظ على خصوصية بيانات أطفالك</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation */}
          <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-14 h-14 bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black font-black text-3xl">
                  ن
                </div>
                <span className="text-3xl font-black text-black hidden sm:block">نبراس المعرفة</span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/" className="p-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                  <HomeIcon className="w-7 h-7" />
                </Link>
                <Link to="/quizzes" className="p-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                  <Brain className="w-7 h-7" />
                </Link>
                <Link to="/stories" className="p-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                  <BookOpen className="w-7 h-7" />
                </Link>
                <div className="w-1 h-10 bg-black mx-2" />
                <Link to="/parent" className="flex items-center gap-2 px-6 py-3 bg-brand-purple text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black">
                  <LayoutDashboard className="w-6 h-6" />
                  <span className="hidden md:block">لوحة الوالدين</span>
                </Link>
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white border-2 border-black text-xs font-bold">
                  <div className={cn("w-2 h-2 rounded-full", aiConnected ? "bg-green-500" : "bg-red-500")} />
                  <span>AI: {aiConnected ? "متصل" : "غير متصل"}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-3 border-2 border-black bg-brand-red text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                  <LogOut className="w-7 h-7" />
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full relative">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home currentChild={currentChild} games={games} aiConnected={aiConnected} />} />
                <Route path="/games" element={<Home currentChild={currentChild} games={games} aiConnected={aiConnected} />} />
                <Route path="/game/:id" element={<GameView currentChild={currentChild} games={games} onUpdateProgress={updateProgress} />} />
                <Route path="/quizzes" element={<QuizSection age={currentChild?.age || 6} level={currentChild?.level || 1} onComplete={updateProgress} />} />
                <Route path="/parent" element={<ParentDashboard user={user} setUser={setUser} />} />
                <Route path="/stories" element={<StoryTime age={currentChild?.age || 6} onComplete={() => updateProgress(20)} />} />
                <Route path="*" element={<Home currentChild={currentChild} games={games} aiConnected={aiConnected} />} />
              </Routes>
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className="bg-black py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-white font-bold">
              <p>© 2026 نبراس المعرفة - منصة تعليمية آمنة للأطفال</p>
            </div>
          </footer>
        </div>
  );
};

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
