'use client'; import { motion } from 'framer-motion';
export default function AmbientBackground(){
  return (
    <div className="pointer-events-none fixed inset-0 bg-field vignette">
      <motion.div className="absolute inset-0" initial={{opacity:0.25}} animate={{opacity:[0.2,0.35,0.25]}}
        transition={{duration:12,repeat:Infinity,ease:'easeInOut'}} />
      <motion.div className="absolute right-[15%] top-[25%] h-24 w-24 rounded-full blur-3xl"
        style={{background:'radial-gradient(closest-side, rgba(231,200,115,0.18), transparent)'}}
        animate={{y:[0,-6,0]}} transition={{duration:10,repeat:Infinity,ease:'easeInOut'}} />
    </div>
  );
}
