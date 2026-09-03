import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toPng } from 'html-to-image';
import {
  Shield,
  Zap,
  Heart,
  Crosshair,
  Sparkles,
  Copy,
  Check,
  Calendar,
  Plus,
  Trash2,
  Send,
  Loader2,
  X,
  Pencil,
} from 'lucide-react';

const socket = io();

// Configuration des écoles en anglais
const SCHOOL_CONFIG = {
  Fire: {
    icon: '/schools/Fire_School.png',
    border: 'border-red-500/40 hover:border-red-500/70',
    bg: 'bg-red-950/25',
    glow: 'shadow-red-500/10',
    text: 'text-red-400',
  },
  Ice: {
    icon: '/schools/Ice_School.png',
    border: 'border-cyan-500/40 hover:border-cyan-500/70',
    bg: 'bg-cyan-950/25',
    glow: 'shadow-cyan-500/10',
    text: 'text-cyan-300',
  },
  Storm: {
    icon: '/schools/Storm_School.png',
    border: 'border-purple-500/40 hover:border-purple-500/70',
    bg: 'bg-purple-950/25',
    glow: 'shadow-purple-500/10',
    text: 'text-purple-300',
  },
  Myth: {
    icon: '/schools/Myth_School.png',
    border: 'border-yellow-500/40 hover:border-yellow-500/70',
    bg: 'bg-yellow-950/25',
    glow: 'shadow-yellow-500/10',
    text: 'text-yellow-300',
  },
  Life: {
    icon: '/schools/Life_School.png',
    border: 'border-emerald-500/40 hover:border-emerald-500/70',
    bg: 'bg-emerald-950/25',
    glow: 'shadow-emerald-500/10',
    text: 'text-emerald-300',
  },
  Death: {
    icon: '/schools/Death_School.png',
    border: 'border-slate-500/40 hover:border-slate-500/70',
    bg: 'bg-slate-950/40',
    glow: 'shadow-slate-500/10',
    text: 'text-slate-300',
  },
  Balance: {
    icon: '/schools/Balance_School.png',
    border: 'border-amber-600/40 hover:border-amber-600/70',
    bg: 'bg-amber-950/25',
    glow: 'shadow-amber-500/10',
    text: 'text-amber-400',
  },
  Any: {
    icon: '/schools/All.png',
    border: 'border-slate-800',
    bg: 'bg-slate-900',
    glow: 'shadow-none',
    text: 'text-slate-400',
  },
};

const ROLE_ICONS = {
  'Main Hitter': Zap,
  Buffer: Sparkles,
  Healer: Heart,
  Tank: Shield,
};

const ROLES = ['Main Hitter', 'Buffer', 'Healer', 'Tank'];

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function App() {
  const [schedule, setSchedule] = useState({});
  const [selectedDay, setSelectedDay] = useState('Samedi');
  const [activeRaidId, setActiveRaidId] = useState('raid-1');

  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [copied, setCopied] = useState(false);

  const [editingRaidId, setEditingRaidId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');

  const [webhookUrl, setWebhookUrl] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  const draftRef = useRef(null);

  useEffect(() => {
    socket.on('schedule:init', (data) => setSchedule(data));
    socket.on('schedule:updated', (data) => setSchedule(data));

    return () => {
      socket.off('schedule:init');
      socket.off('schedule:updated');
    };
  }, []);

  const currentDayRaids = schedule[selectedDay] || [];
  const activeRaid = currentDayRaids.find((r) => r.id === activeRaidId) || currentDayRaids[0];

  const showAlert = (title, message, type = 'success') => {
    setModal({ isOpen: true, title, message, type });
  };

  const handleSlotChange = (slotId, field, value) => {
    if (!activeRaid) return;
    socket.emit('slot:update', {
      day: selectedDay,
      raidId: activeRaid.id,
      slotId,
      field,
      value,
    });
  };

  const handleAddRaid = (e) => {
    e.preventDefault();
    if (!newTitle || !newTime) return;
    socket.emit('raid:add', { day: selectedDay, title: newTitle, time: newTime });
    setNewTitle('');
    setNewTime('');
  };

  const handleStartEditing = (raid, e) => {
    e.stopPropagation();
    setEditingRaidId(raid.id);
    setEditTitle(raid.title);
    setEditTime(raid.time);
  };

  const handleSaveRaidEdit = (raidId, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!editTitle || !editTime) return;

    socket.emit('raid:update', {
      day: selectedDay,
      raidId,
      title: editTitle,
      time: editTime,
    });

    setEditingRaidId(null);
  };

  const handleCancelEditing = (e) => {
    e.stopPropagation();
    setEditingRaidId(null);
  };

  const handleDeleteRaid = (raidId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this scheduled raid?')) {
      socket.emit('raid:delete', { day: selectedDay, raidId });
      if (activeRaidId === raidId) {
        setActiveRaidId(null);
      }
    }
  };

  const handleCopyText = () => {
    if (!activeRaid) return;
    let text = `⚔️ **${activeRaid.title} (${activeRaid.time})**\n\n`;

    const teamA = activeRaid.slots.filter((s) => s.team === 'Team A');
    const teamB = activeRaid.slots.filter((s) => s.team === 'Team B');

    text += `**Team A:**\n`;
    teamA.forEach((s) => {
      text += `Slot ${s.id}: ${s.playerName || 'Open'} (${s.primarySchool}/${s.archmasterySchool}) - ${s.role}\n`;
    });

    text += `\n**Team B:**\n`;
    teamB.forEach((s) => {
      text += `Slot ${s.id}: ${s.playerName || 'Open'} (${s.primarySchool}/${s.archmasterySchool}) - ${s.role}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishDiscord = async () => {
    if (!webhookUrl) {
      showAlert('Missing Webhook', 'Please enter a Discord Webhook URL.', 'error');
      return;
    }
    if (!draftRef.current || !activeRaid) return;

    try {
      setPublishing(true);
      const dataUrl = await toPng(draftRef.current, { cacheBust: true });

      const res = await fetch('/api/publish-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          raidTitle: activeRaid.title,
          raidTime: activeRaid.time,
          webhookUrl,
        }),
      });

      if (res.ok) {
        showAlert('Raid Published!', 'Composition image published to Discord successfully.', 'success');
      } else {
        showAlert('Publish Failed', 'Unable to publish to Discord. Check your Webhook URL.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Render Error', 'Failed to generate preview image.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setModal({ ...modal, isOpen: false })}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  modal.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {modal.type === 'success' ? <Send className="w-6 h-6" /> : <X className="w-6 h-6" />}
              </div>
              <h3 className="text-lg font-bold text-slate-100">{modal.title}</h3>
            </div>

            <p className="text-sm text-slate-400">{modal.message}</p>

            <button
              onClick={() => setModal({ ...modal, isOpen: false })}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm py-2.5 rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Wizard101 Raid Planner
          </h1>
          <p className="text-sm text-slate-400">Real-time multiplayer team strategy</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <input
            type="password"
            placeholder="Discord Webhook URL..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded-lg w-64 text-slate-200 outline-none focus:border-amber-500"
          />
          <button
            onClick={handlePublishDiscord}
            disabled={publishing || !activeRaid}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Publish
          </button>
        </div>
      </header>

      {/* Onglets des jours en français */}
      <div className="max-w-7xl mx-auto flex gap-2 mb-8 overflow-x-auto pb-2">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => {
              setSelectedDay(day);
              setActiveRaidId(schedule[day]?.[0]?.id || null);
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedDay === day
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            {day}
            {schedule[day]?.length > 0 && (
              <span className="bg-slate-950/40 text-xs px-2 py-0.5 rounded-full">
                {schedule[day].length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h2 className="text-lg font-bold mb-4 flex items-center justify-between text-slate-200">
              Raids du {selectedDay}
            </h2>

            <div className="space-y-3 mb-6">
              {currentDayRaids.map((raid) => (
              <div
                key={raid.id}
                onClick={() => setActiveRaidId(raid.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  activeRaid?.id === raid.id
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {editingRaidId === raid.id ? (
                  <form
                    onSubmit={(e) => handleSaveRaidEdit(raid.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full space-y-2 cursor-default"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-100 outline-none focus:border-amber-500"
                      placeholder="Raid Title..."
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-100 outline-none focus:border-amber-500"
                      placeholder="Time..."
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-1 rounded transition-all"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditing}
                        className="px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-1 rounded transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <div className="font-extrabold text-slate-100">{raid.title}</div>
                      <div className="text-xs text-slate-400 mt-1">Time: {raid.time}</div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleStartEditing(raid, e)}
                        className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-950/50 rounded-lg transition-all"
                        title="Edit raid"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteRaid(raid.id, e)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-all"
                        title="Delete raid"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

              {currentDayRaids.length === 0 && (
                <p className="text-sm text-slate-500 italic">Aucun raid programmé pour {selectedDay}.</p>
              )}
            </div>

            <form onSubmit={handleAddRaid} className="space-y-3 border-t border-slate-800 pt-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Schedule New Raid
              </span>
              <input
                type="text"
                placeholder="Raid Title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sm px-3 py-2 rounded-lg text-slate-100 outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Time (e.g. 8:00 PM EST)..."
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sm px-3 py-2 rounded-lg text-slate-100 outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Raid
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeRaid ? (
            <>
              <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div>
                  <h2 className="text-xl font-black text-slate-100">{activeRaid.title}</h2>
                  <span className="text-xs text-amber-400 font-medium">{activeRaid.time}</span>
                </div>
                <button
                  onClick={handleCopyText}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Text Format'}
                </button>
              </div>

              <div ref={draftRef} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-8">
                {['Team A', 'Team B'].map((teamName) => (
                  <div key={teamName} className="space-y-4">
                    <h3 className="text-md font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Shield className="w-4 h-4" />
                      {teamName}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeRaid.slots
                        .filter((s) => s.team === teamName)
                        .map((slot) => {
                          const primaryCfg = SCHOOL_CONFIG[slot.primarySchool] || SCHOOL_CONFIG.Any;
                          const archCfg = SCHOOL_CONFIG[slot.archmasterySchool] || SCHOOL_CONFIG.Any;
                          const RoleIcon = ROLE_ICONS[slot.role] || Sparkles;

                          return (
                            <div
                              key={slot.id}
                              className={`border p-4 rounded-xl space-y-3.5 relative transition-all shadow-md ${primaryCfg.bg} ${primaryCfg.border} ${primaryCfg.glow}`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={primaryCfg.icon}
                                    alt={slot.primarySchool}
                                    className="w-10 h-10 object-contain filter drop-shadow-md"
                                  />
                                  <div>
                                    <span className="text-xs font-bold text-slate-400 block leading-none">
                                      Slot #{slot.id}
                                    </span>
                                    <span className={`text-[11px] font-extrabold ${primaryCfg.text}`}>
                                      {slot.primarySchool}
                                    </span>
                                  </div>
                                </div>

                                {/* Menu déroulant (select) original des rôles */}
                                <div className="flex items-center gap-1.5 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-slate-800/80">
                                  <RoleIcon className="w-3.5 h-3.5 text-amber-400" />
                                  <select
                                    value={slot.role}
                                    onChange={(e) => handleSlotChange(slot.id, 'role', e.target.value)}
                                    className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
                                  >
                                    {ROLES.map((r) => (
                                      <option key={r} value={r} className="bg-slate-900 text-slate-200">
                                        {r}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <input
                                type="text"
                                placeholder="Player Name..."
                                value={slot.playerName}
                                onChange={(e) => handleSlotChange(slot.id, 'playerName', e.target.value)}
                                className="w-full bg-slate-950/90 border border-slate-800/80 text-sm font-extrabold px-3 py-2 rounded-lg text-amber-300 outline-none focus:border-amber-500 transition-all"
                              />

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1">
                                    <img src={primaryCfg.icon} alt="" className="w-3.5 h-3.5 object-contain" /> Primary
                                  </label>
                                  <select
                                    value={slot.primarySchool}
                                    onChange={(e) =>
                                      handleSlotChange(slot.id, 'primarySchool', e.target.value)
                                    }
                                    className="w-full bg-slate-950 border border-slate-800 text-xs py-1.5 px-2 rounded-lg text-slate-200 font-semibold outline-none focus:border-amber-500 cursor-pointer"
                                  >
                                    {Object.keys(SCHOOL_CONFIG).map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1">
                                    <img src={archCfg.icon} alt="" className="w-3.5 h-3.5 object-contain" /> Archmastery
                                  </label>
                                  <select
                                    value={slot.archmasterySchool}
                                    onChange={(e) =>
                                      handleSlotChange(slot.id, 'archmasterySchool', e.target.value)
                                    }
                                    className="w-full bg-slate-950 border border-slate-800 text-xs py-1.5 px-2 rounded-lg text-slate-200 font-semibold outline-none focus:border-amber-500 cursor-pointer"
                                  >
                                    {Object.keys(SCHOOL_CONFIG).map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              Select or schedule a raid for {selectedDay} to start building the roster.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}