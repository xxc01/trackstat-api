const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to save data
const dataPath = path.join(__dirname, 'accounts.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]));
}

// Read data
function readAccounts() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error reading accounts:', error);
        return [];
    }
}

// Write data
function writeAccounts(accounts) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(accounts, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Error writing accounts:', error);
        return false;
    }
}

// 🔹 GET: View all accounts
app.get('/api/accounts', (req, res) => {
    const accounts = readAccounts();
    res.json(accounts);
});

// 🔹 POST: Update or add account via executor
app.post('/api/accounts', (req, res) => {
    const { userId, username, kills, deaths } = req.body;

    if (!username || userId == nil) {
        return res.status(400).json({ error: 'Missing username or userId' });
    }

    const accounts = readAccounts();
    const now = new Date().toISOString();

    const newEntry = {
        userId,
        username,
        kills: kills || 0,
        deaths: deaths || 0,
        updated: now
    };

    accounts.push(newEntry);

    if (writeAccounts(accounts)) {
        res.json({ success: true, message: 'Stat saved', data: newEntry });
    } else {
        res.status(500).json({ error: 'Failed to save stat' });
    }
});

// 🔹 POST: Update existing account (your original route)
app.post('/api/update', (req, res) => {
    const { username, balance, status, game, server } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const accounts = readAccounts();
    const index = accounts.findIndex(acc => acc.username === username);
    const now = new Date().toISOString();

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
        res.json({ success: true, message: 'Account updated' });
    } else {
        res.status(500).json({ error: 'Failed to update account' });
    }
});

// Homepage test
app.get('/', (req, res) => {
    res.send('✅ TrackStat API is running');
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ TrackStat API running on port ${PORT}`);
});
