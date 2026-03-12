import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const BackgroundEffects: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Soft Animated Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-[#150505] to-brand-black opacity-80" />
      
      {/* Light Field / Beam Texture - Burgundy Accents */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[80%] bg-brand-burgundy/10 blur-[120px] rounded-full rotate-12"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute top-[40%] -right-[10%] w-[50%] h-[70%] bg-brand-burgundy/5 blur-[100px] rounded-full -rotate-12"
      />

      {/* Grid Shimmer - Cream Accents */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{ backgroundImage: 'linear-gradient(#FDFBF7 1px, transparent 1px), linear-gradient(90deg, #FDFBF7 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-cream/10 to-transparent w-full h-full animate-[shimmer_8s_infinite_linear]" />
      </div>

      {/* Particle Drift - Cream Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-brand-cream/10 rounded-full animate-[drift_10s_infinite_ease-in-out]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Slow Parallax Abstract Shapes */}
      <motion.div 
        style={{ y: y1, rotate: 15 }}
        className="absolute top-1/4 left-1/4 w-96 h-96 border border-white/5 rounded-full"
      />
      <motion.div 
        style={{ y: y2, rotate: -15 }}
        className="absolute top-2/3 right-1/4 w-[500px] h-[500px] border border-white/5 rounded-[40px]"
      />
    </div>
  );
};
