'use client'; import Shell from '@/components/Shell'; import { useState } from 'react';
const prompts=['Sit. Breathe. What is the simplest true sentence about today?','Where is ego negotiating for comfort instead of truth?','Name one small, honest action that restores alignment now.'];
export default function ReflectPage(){ const [i,setI]=useState(0); const [text,setText]=useState('');
  return (<Shell><h1 className="text-xl font-semibold text-gold">Reflect</h1><p className="text-neutral-400 mt-1">Guided journaling — Temple of Truth style.</p>
    <div className="mt-6 card p-5"><div className="text-gold text-sm font-medium mb-2">Prompt</div><p className="text-neutral-300">{prompts[i]}</p>
      <textarea className="mt-4 w-full h-44 bg-neutral-950 border border-neutral-800 rounded-xl p-3 outline-none focus:border-gold/60" value={text} onChange={e=>setText(e.target.value)} placeholder="Write from the quiet center..."/>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={()=>setI((i+1)%prompts.length)} className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-sm">New prompt</button>
        <button onClick={()=>{setText(''); alert('Demo: would save to Supabase.');}} className="px-3 py-2 rounded-lg bg-gold/20 border border-gold/40 hover:bg-gold/30 text-gold text-sm">Save (demo)</button>
      </div></div></Shell>); }
