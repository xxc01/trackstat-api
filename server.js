const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to accounts.json
const dataPath = path.join(__dirname, 'accounts.json');

// Initialize accounts.json if not present
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

// Helper: Read all accounts
function readAccounts() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('❌ Error reading accounts:', err);
    return [];
  }
}

// Helper: Write all accounts
function writeAccounts(accounts) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(accounts, null, 2));
    return true;
  } catch (err) {
    console.error('❌ Error writing accounts:', err);
    return false;
  }
}

// ✅ MAIN: POST /api/accounts — from Roblox executor
app.post('/api/accounts', (req, res) => {
  try {
    const { userId, username, kills, deaths } = req.body;

    // ✅ FIXED: removed Lua "nil" — JS uses undefined/null
    if (!username || !userId) {
      return res.status(400).json({ error: 'Missing username or userId' });
    }

    const now = new Date().toISOString();
    const accounts = readAccounts();

    const newEntry = {
      userId,
      username,
      kills: kills || 0,
      deaths: deaths || 0,
      updated: now
    };

    accounts.push(newEntry);

    if (writeAccounts(accounts)) {
      console.log('📥 Saved stat:', newEntry);
      return res.json({ success: true, message: 'Stat saved', data: newEntry });
    } else {
      return res.status(500).json({ error: 'Failed to save stat' });
    }
  } catch (err) {
    console.error('❌ Exception in POST /api/accounts:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// 🔄 Your original route: update account
app.post('/api/update', (req, res) => {
  const { username, balance, status, game, server } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const accounts = readAccounts();
  const now = new Date().toISOString();
  const index = accounts.findIndex(acc => acc.username === username);

  const updated = {
    username,
    balance: balance || 0,
    status: status || 'Offline',
    game: game || 'Unknown',
    server: server || 'N/A',
    lastUpdated: now
  };

  if (index >= 0) {
    accounts[index] = updated;
  } else {
    accounts.push(updated);
  }

  if (writeAccounts(accounts)) {
    return res.json({ success: true, message: 'Account updated', data: updated });
  } else {
    return res.status(500).json({ error: 'Failed to update account' });
  }
});

// 📄 GET /api/accounts — view saved data
app.get('/api/accounts', (req, res) => {
  const accounts = readAccounts();
  res.json(accounts);
});

// 🏠 GET / — test homepage
app.get('/', (req, res) => {
  res.send('✅ TrackStat API is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ TrackStat API running on port ${PORT}`);
});
