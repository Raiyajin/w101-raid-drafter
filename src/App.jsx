// src/App.jsx
import React, { useState } from 'react';
import { RAIDS, SCHOOLS, SCHOOL_COLORS, SCHOOL_ICONS } from './raidData';
import { Shield, Zap, Heart, Crosshair, Sparkles, Copy, Check } from 'lucide-react';

const ROLE_ICONS = {
  'Main Hitter': Zap,
  'Off-Hitter': Crosshair,
  'Buffer': Shield,
  'Healer/Tank': Heart,
  'Utility/Breaker': Sparkles,
};

const ROLES = Object.keys(ROLE_ICONS);

const INITIAL_SLOTS = Array.from({ length: 8 }, (_, i) => {
  const isTeamA = i < 4;
  return {
    id: i + 1,
    team: isTeamA ? 'Team A' : 'Team B',
    playerName: '',
    primarySchool: isTeamA ? 'Storm' : 'Any',
    archmasterySchool: 'Any',
    role: isTeamA ? 'Main Hitter' : 'Buffer',
  };
});

export default function App() {
  const [selectedRaidId, setSelectedRaidId] = useState('ghastly-conspiracy');
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [copied, setCopied] = useState(false);

  const activeRaid = RAIDS.find((r) => r.id === selectedRaidId) || RAIDS[0];

  const updateSlot = (id, field, value) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };

  const copyDiscordFormat = () => {
    let output = `**[Wizard101 Raid Draft: ${activeRaid.name}]**\n`;
    output += `*${activeRaid.description}*\n\n`;

    ['Team A', 'Team B'].forEach((team) => {
      output += `**${team}:**\n`;
      slots
        .filter((s) => s.team === team)
        .forEach((s) => {
          output += `• Slot #${s.id} (${s.role}): ${s.playerName || 'Unassigned'} - Primary: ${s.primarySchool} | Arch: ${s.archmasterySchool}\n`;
        });
      output += '\n';
    });

    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans w-full">
      {/* Expanded Header */}
      <header className="w-full mb-10 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl xl:text-5xl font-black text-amber-400 tracking-wider flex items-center gap-3">
            <Sparkles className="w-9 h-9 text-amber-400" />
            Wizard101 Raid Drafter
          </h1>
          <p className="text-slate-400 text-base xl:text-lg mt-2">
            Configure full 8-player raid team compositions and Archmastery setups.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedRaidId}
            onChange={(e) => setSelectedRaidId(e.target.value)}
            className="bg-slate-900 border-2 border-amber-500/50 text-amber-300 font-bold px-6 py-3.5 rounded-xl text-base xl:text-lg focus:outline-none focus:border-amber-400"
          >
            {RAIDS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={copyDiscordFormat}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-base xl:text-lg cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
            {copied ? 'Copied!' : 'Export Draft'}
          </button>
        </div>
      </header>

      {/* Full-width Roster Grid */}
      <main className="w-full space-y-12">
        {['Team A', 'Team B'].map((teamName) => (
          <section key={teamName} className="space-y-5">
            <h2 className="text-2xl xl:text-3xl font-black text-slate-100 border-l-4 border-amber-500 pl-4">
              {teamName}
            </h2>

            {/* Always 4 columns wide on desktop to fill empty space */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
              {slots
                .filter((s) => s.team === teamName)
                .map((slot) => {
                  const primaryColor = SCHOOL_COLORS[slot.primarySchool];
                  const RoleIcon = ROLE_ICONS[slot.role];

                  return (
                    <div
                      key={slot.id}
                      className={`p-6 xl:p-7 rounded-2xl border-2 shadow-2xl ${primaryColor.bg} ${primaryColor.border} transition-all space-y-5 flex flex-col justify-between`}
                    >
                      {/* Header Badge & Role Selector */}
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={SCHOOL_ICONS[slot.primarySchool]}
                            alt={slot.primarySchool}
                            className="w-8 h-8 object-contain drop-shadow"
                          />
                          <span className={`text-xs xl:text-sm font-black uppercase px-3 py-1 rounded-full ${primaryColor.badge}`}>
                            Slot #{slot.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <RoleIcon className={`w-5 h-5 ${primaryColor.text}`} />
                          <select
                            value={slot.role}
                            onChange={(e) => updateSlot(slot.id, 'role', e.target.value)}
                            className="bg-slate-950 text-xs xl:text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-700 text-amber-300 focus:outline-none"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Player Input */}
                      <div>
                        <label className="block text-xs xl:text-sm font-semibold text-slate-300 mb-1.5">
                          Wizard / Player Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter character name..."
                          value={slot.playerName}
                          onChange={(e) => updateSlot(slot.id, 'playerName', e.target.value)}
                          className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-medium focus:border-amber-400 focus:outline-none text-slate-100 placeholder-slate-500"
                        />
                      </div>

                      {/* Dual School Options with Icons */}
                      <div className="grid grid-cols-2 gap-3 xl:gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                            Primary
                          </label>
                          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                            <img
                              src={SCHOOL_ICONS[slot.primarySchool]}
                              alt={slot.primarySchool}
                              className="w-5 h-5 object-contain"
                            />
                            <select
                              value={slot.primarySchool}
                              onChange={(e) => updateSlot(slot.id, 'primarySchool', e.target.value)}
                              className="w-full bg-transparent text-xs xl:text-sm font-bold focus:outline-none text-slate-200"
                            >
                              {SCHOOLS.map((s) => (
                                <option key={s} value={s} className="bg-slate-950">
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                            Archmastery
                          </label>
                          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
                            <img
                              src={SCHOOL_ICONS[slot.archmasterySchool]}
                              alt={slot.archmasterySchool}
                              className="w-5 h-5 object-contain"
                            />
                            <select
                              value={slot.archmasterySchool}
                              onChange={(e) => updateSlot(slot.id, 'archmasterySchool', e.target.value)}
                              className="w-full bg-transparent text-xs xl:text-sm font-bold focus:outline-none text-slate-300"
                            >
                              {SCHOOLS.map((s) => (
                                <option key={s} value={s} className="bg-slate-950">
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}