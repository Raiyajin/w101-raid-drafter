// src/raidData.js

export const RAIDS = [
  {
    id: 'ghastly-conspiracy',
    name: 'Ghastly Conspiracy Raid (Lemuria)',
    description: 'Requires coordinated team positioning, precise dual-school Archmastery setups, and strict boss mechanics strategy.',
  },
];

export const SCHOOL_ICONS = {
  Any: '/schools/All.png',
  Fire: '/schools/Fire_School.png',
  Ice: '/schools/Ice_School.png',
  Storm: '/schools/Storm_School.png',
  Myth: '/schools/Myth_School.png',
  Life: '/schools/Life_School.png',
  Death: '/schools/Death_School.png',
  Balance: '/schools/Balance_School.png',
};

export const SCHOOL_COLORS = {
  Any: { bg: 'bg-indigo-950/70', border: 'border-indigo-500/70', text: 'text-indigo-300', badge: 'bg-indigo-900/80 text-indigo-200' },
  Fire: { bg: 'bg-red-950/70', border: 'border-red-500/70', text: 'text-red-300', badge: 'bg-red-900/80 text-red-200' },
  Ice: { bg: 'bg-cyan-950/70', border: 'border-cyan-400/70', text: 'text-cyan-300', badge: 'bg-cyan-900/80 text-cyan-200' },
  Storm: { bg: 'bg-purple-950/70', border: 'border-purple-400/70', text: 'text-purple-300', badge: 'bg-purple-900/80 text-purple-200' },
  Myth: { bg: 'bg-yellow-950/70', border: 'border-yellow-500/70', text: 'text-yellow-300', badge: 'bg-yellow-900/80 text-yellow-200' },
  Life: { bg: 'bg-emerald-950/70', border: 'border-emerald-500/70', text: 'text-emerald-300', badge: 'bg-emerald-900/80 text-emerald-200' },
  Death: { bg: 'bg-slate-900/90', border: 'border-slate-500/70', text: 'text-slate-300', badge: 'bg-slate-800 text-slate-200' },
  Balance: { bg: 'bg-amber-950/70', border: 'border-amber-600/70', text: 'text-amber-300', badge: 'bg-amber-900/80 text-amber-200' },
};

export const SCHOOLS = Object.keys(SCHOOL_COLORS);