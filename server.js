import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// Middleware for parsing large image payloads for Discord publishing
app.use(express.json({ limit: '10mb' }));

// Helper to construct empty 8-slot roster (excluding Feinter)
const createInitialSlots = () =>
  Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    team: i < 4 ? 'Team A' : 'Team B',
    playerName: '',
    primarySchool: i < 4 ? 'Storm' : 'Any',
    archmasterySchool: 'Any',
    role: i < 4 ? 'Main Hitter' : 'Buffer',
  }));

// Weekly schedule using French day keys matching App.jsx
let weeklySchedule = {
  Lundi: [],
  Mardi: [],
  Mercredi: [],
  Jeudi: [],
  Vendredi: [],
  Samedi: [
    {
      id: 'raid-1',
      title: 'Saturday Night Ghastly Raid',
      time: '20:00 EST',
      raidType: 'ghastly-conspiracy',
      slots: createInitialSlots(),
    },
  ],
  Dimanche: [],
};

// 1. Serve static frontend assets built by Vite
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Discord Publishing Endpoint
app.post('/api/publish-discord', async (req, res) => {
  const { imageBase64, raidTitle, raidTime, webhookUrl } = req.body;

  if (!webhookUrl) {
    return res.status(400).json({ error: 'Discord Webhook URL is required' });
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });

    formData.append('file', blob, 'raid-draft.png');
    formData.append(
      'payload_json',
      JSON.stringify({
        content: `⚔️ **[Wizard101 Raid Draft]**\n**Raid:** ${raidTitle}\n**Time:** ${raidTime}`,
      })
    );

    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      body: formData,
    });

    if (!discordRes.ok) {
      throw new Error(`Discord API error: ${discordRes.statusText}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to post to Discord:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  socket.emit('schedule:init', weeklySchedule);

  socket.on('raid:add', ({ day, title, time }) => {
    const newRaid = {
      id: `raid-${Date.now()}`,
      title,
      time,
      raidType: 'ghastly-conspiracy',
      slots: createInitialSlots(),
    };
    if (!weeklySchedule[day]) weeklySchedule[day] = [];
    weeklySchedule[day].push(newRaid);
    io.emit('schedule:updated', weeklySchedule);
  });

  socket.on('raid:update', ({ day, raidId, title, time }) => {
    if (weeklySchedule[day]) {
      const raid = weeklySchedule[day].find((r) => r.id === raidId);
      if (raid) {
        raid.title = title;
        raid.time = time;
        io.emit('schedule:updated', weeklySchedule);
      }
    }
  });

  socket.on('raid:delete', ({ day, raidId }) => {
    if (weeklySchedule[day]) {
      weeklySchedule[day] = weeklySchedule[day].filter((r) => r.id !== raidId);
      io.emit('schedule:updated', weeklySchedule);
    }
  });

  socket.on('slot:update', ({ day, raidId, slotId, field, value }) => {
    if (weeklySchedule[day]) {
      const raid = weeklySchedule[day].find((r) => r.id === raidId);
      if (raid) {
        const slot = raid.slots.find((s) => s.id === slotId);
        if (slot) {
          slot[field] = value;
          io.emit('schedule:updated', weeklySchedule);
        }
      }
    }
  });
});

app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server & WebSockets listening on port ${PORT}`);
});