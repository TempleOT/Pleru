import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors:{ gold:"#E7C873", emerald:"#2ECC71" },
    boxShadow:{ gold:"0 0 0 1px rgba(231,200,115,0.4), 0 8px 24px rgba(231,200,115,0.08)" },
    keyframes:{'drawer-in':{from:{transform:'translateX(-100%)'},to:{transform:'translateX(0)'}},'pulse-glow':{'0%,100%':{opacity:'0.7'},'50%':{opacity:'1'}},'twinkle':{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-2px)'}}},
    animation:{'drawer-in':'drawer-in 200ms ease-out','pulse-glow':'pulse-glow 3s ease-in-out infinite','twinkle':'twinkle 6s ease-in-out infinite'}
  }},
  plugins: []
}; export default config;
