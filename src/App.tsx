import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Star, Clock, MapPin, ArrowRight, Instagram, Twitter, Facebook, LogIn, User, ShieldCheck } from 'lucide-react';
import { BackgroundEffects } from './components/BackgroundEffects';
import { BookingModal } from './components/BookingModal';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Navbar = ({ onBook, onLogin, user, isAdmin, onNavigate }: {
  onBook: () => void,
  onLogin: () => void,
  user: any,
  isAdmin: boolean,
  onNavigate: (page: 'home' | 'admin') => void
}) => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 cursor-pointer"
      onClick={() => onNavigate('home')}
    >
      <div className="h-10 w-10 rounded-lg overflow-hidden border border-brand-cream/10">
        <img
          src="./input_file_0.png"
          alt="Tim's Clips Logo"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <span className="text-lg font-display font-bold tracking-tighter text-brand-cream">TIM'S CLIPS</span>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-8"
    >
      <div className="hidden md:flex gap-8 text-sm font-medium text-brand-cream/60">
        {['Services', 'Portfolio'].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-brand-cream transition-colors">
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="p-2 hover:bg-brand-burgundy/20 rounded-full text-brand-burgundy transition-colors"
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 text-sm text-brand-cream/40 hover:text-brand-cream"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-2 text-sm text-brand-cream/60 hover:text-brand-cream"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
        )}
        <button
          onClick={onBook}
          className="bg-brand-burgundy text-brand-cream px-6 py-2 rounded-full text-sm font-bold hover:bg-brand-burgundy/80 transition-all"
        >
          Book Now
        </button>
      </div>
    </motion.div>
  </nav>
);

const Button = ({ children, className = "", variant = "primary", onClick }: { children: React.ReactNode, className?: string, variant?: "primary" | "secondary", onClick?: () => void }) => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative px-10 py-4 font-bold rounded-full overflow-hidden transition-all duration-300 ${variant === "primary"
        ? "bg-brand-cream text-brand-black"
        : "bg-transparent text-brand-cream border border-brand-cream/20"
        } ${className}`}
    >
      {/* Cursor Proximity Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle 60px at ${mousePos.x}px ${mousePos.y}px, rgba(74, 14, 14, 0.4), transparent)`,
        }}
      />

      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>

      {/* Subtle Burgundy Border Glow on Hover */}
      <div className="absolute inset-0 rounded-full border border-brand-burgundy/0 group-hover:border-brand-burgundy/50 transition-colors duration-500" />
    </motion.button>
  );
};

const Hero = ({ onBook }: { onBook: () => void }) => (
  <section className="relative h-screen flex flex-col items-center justify-center text-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-brand-burgundy mb-6">
        Established 2025
      </span>
      <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter leading-[0.9] mb-8 text-balance text-brand-cream">
        Elite Quality. <br />
        <span className="text-brand-burgundy">For only $15.</span>
      </h1>
      <p className="max-w-xl mx-auto text-lg md:text-xl text-brand-cream/50 leading-relaxed mb-12 text-balance">
        Just a clean cut tailored to your head shape. No rush, no fuss—just a personalized experience for every client.
      </p>
      <Button onClick={onBook} className="shadow-[0_0_30px_rgba(74,14,14,0.2)]">
        Reserve Your Chair <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
    >
      <div className="w-[1px] h-12 bg-gradient-to-b from-brand-burgundy/40 to-transparent" />
      <span className="text-[10px] uppercase tracking-widest text-brand-cream/20">Scroll to explore</span>
    </motion.div>
  </section>
);

const ValueProp = () => {
  const features = [
    {
      icon: Scissors,
      title: "Master Craftsmanship",
      desc: "Every cut is a deliberate act of precision, executed with world-class tools and techniques."
    },
    {
      icon: Clock,
      title: "Unrushed Experience",
      desc: "We value your time, but we never rush perfection. Every session is a dedicated block of focus."
    },
    {
      icon: Star,
      title: "Personalized For You",
      desc: "We analyze your head shape and growth patterns to ensure a tailored look that actually lasts."
    }
  ];

  return (
    <section id="services" className="py-32 px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="group p-8 rounded-3xl glass hover:bg-brand-burgundy/[0.03] transition-all duration-500"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-cream/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-burgundy/20 transition-all">
              <f.icon className="w-6 h-6 text-brand-cream/80 group-hover:text-brand-cream" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-4 text-brand-cream">{f.title}</h3>
            <p className="text-brand-cream/40 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Portfolio = () => {
  const images = [
    { src: "./input_file_1.png", title: "Precision Taper" },
    { src: "./input_file_2.png", title: "Tailored Texture" },
  ];

  return (
    <section id="portfolio" className="py-32 bg-brand-burgundy/[0.02] border-y border-brand-cream/5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-20">
          <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-6 text-brand-cream">The Work.</h2>
          <p className="text-xl text-brand-cream/40">Real results for real clients. No filters, just skill.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-[40px] aspect-[4/5] bg-brand-dark border border-brand-cream/5"
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-10 left-10">
                <h3 className="text-2xl font-display font-bold text-brand-cream">{img.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = ({ onBook }: { onBook: () => void }) => (
  <section id="book" className="py-48 px-8 text-center relative overflow-hidden">
    <div className="absolute inset-0 bg-brand-burgundy/[0.03] mask-radial-faded" />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative z-10"
    >
      <h2 className="text-6xl md:text-9xl font-display font-bold tracking-tighter mb-12 text-brand-cream">Ready for <br /><span className="text-brand-burgundy">Your Upgrade?</span></h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        <Button onClick={onBook} className="px-12 py-6 text-xl shadow-[0_0_50px_rgba(74,14,14,0.3)]">
          Book Appointment
        </Button>
        <div className="flex items-center gap-4 text-brand-cream/40">
          <MapPin className="w-5 h-5" />
          <span>116 Bolt Hall(Calvin University)</span>
        </div>
      </div>
    </motion.div>
  </section>
);

const Footer = () => (
  <footer className="py-20 px-8 border-t border-brand-cream/5">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg overflow-hidden border border-brand-cream/10">
          <img
            src="./input_file_0.png"
            alt="Tim's Clips Logo"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="font-display font-bold tracking-tighter text-brand-cream">TIM'S CLIPS</span>
      </div>
      <div className="flex gap-12 text-sm text-brand-cream/40">
        <a href="#" className="hover:text-brand-cream transition-colors">Privacy</a>
        <a href="#" className="hover:text-brand-cream transition-colors">Terms</a>
        <a href="#" className="hover:text-brand-cream transition-colors">Careers</a>
      </div>
      <div className="flex gap-6">
        <a href="https://www.instagram.com/tims_clips_calvin/?igsh=c3k1MXpvazkxMWxh&utm_source=qr" target="_blank" rel="noopener noreferrer">
          <Instagram className="w-5 h-5 text-brand-cream/20 hover:text-brand-burgundy transition-colors cursor-pointer" />
        </a>
      </div>
    </div>
    <div className="text-center mt-12 text-[10px] uppercase tracking-widest text-brand-cream/10">
      © 2025 Tim's Clips Barber Shop. All rights reserved.
    </div>
  </footer>
);

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'admin'>('home');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check for admin role
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setIsAdmin(data.role === 'admin');
          if (data.status === undefined && data.role !== 'admin') {
            await setDoc(doc(db, 'users', u.uid), { status: 'pending' }, { merge: true });
            setIsApproved(false);
          } else {
            setIsApproved(data.status === 'approved' || data.role === 'admin');
          }
        } else {
          // Create user doc if it doesn't exist
          const role = u.email === 'timmyjn19@gmail.com' ? 'admin' : 'client';
          const status = role === 'admin' ? 'approved' : 'pending';
          await setDoc(doc(db, 'users', u.uid), {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName || u.email?.split('@')[0] || 'User',
            role: role,
            status: status,
            createdAt: new Date().toISOString()
          });
          setIsAdmin(role === 'admin');
          setIsApproved(status === 'approved');
        }
      } else {
        setIsAdmin(false);
        setIsApproved(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleBookClick = () => {
    if (!user) {
      setIsLoginOpen(true);
    } else if (!isApproved && !isAdmin) {
      alert('Your account is currently pending approval. Please wait for the admin to approve your sign up before booking.');
    } else {
      setIsBookingOpen(true);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-burgundy/30">
      <BackgroundEffects />
      <Navbar
        onBook={handleBookClick}
        onLogin={() => setIsLoginOpen(true)}
        user={user}
        isAdmin={isAdmin}
        onNavigate={setCurrentPage}
      />

      {currentPage === 'home' ? (
        <main>
          <Hero onBook={handleBookClick} />
          <ValueProp />
          <Portfolio />
          <CTA onBook={handleBookClick} />
        </main>
      ) : (
        <AdminDashboard />
      )}

      <Footer />
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
