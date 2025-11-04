'use client'; import { motion } from 'framer-motion'; import React from 'react';
export default function ProgressFlame({level=0.4}:{level?:number}){
  const glow=Math.max(0.2,level);
  return (
    <div className="relative inline-flex items-center">
      <motion.div className="absolute -inset-4 rounded-full" style={{boxShadow:`0 0 40px rgba(231,200,115,${0.35*glow})`}}
        animate={{opacity:[0.6,1,0.6]}} transition={{duration:3,repeat:Infinity}} />
      <svg width="40" height="64" viewBox="0 0 40 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff2c4"/><stop offset="100%" stopColor="#E7C873"/></linearGradient></defs>
        <path d="M20 4 C26 18, 36 22, 32 36 C29 50, 11 50, 8 36 C4 22, 14 18, 20 4 Z" fill="url(#g)" opacity="0.9"/></svg>
      <div className="ml-3 text-sm text-neutral-400"><div className="text-gold font-semibold">Progress Flame</div>
        <div>Alignment ~ {(level*100).toFixed(0)}%</div></div>
    </div>
  );
}
