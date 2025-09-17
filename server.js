const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const dataPath = path.join(__dirname, 'accounts.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]));
}

// Read accounts from file
function readAccounts() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading accounts:', error);
        return [];
    }
}

// Write accounts to file
function writeAccounts(accounts) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(accounts, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing accounts:', error);
        return false;
    }
}

// API Routes

// Get all accounts
app.get('/api/accounts', (req, res) => {
    const accounts = readAccounts();
    res.json(accounts);
});

// Update account data
app.post('/api/update', (req, res) => {
    const { username, balance, status, game, server } = req.body;
    
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    
    const accounts = readAccounts();
    const existingIndex = accounts.findIndex(acc => acc.username === username);
    const now = new Date().toISOString();
    
    const accountData = {
        username,
        balance: balance || 0,
        status: status || 'Offline',
        game: game || 'Unknown',
        server: server || 'N/A',
        lastUpdated: now
    };
    
    if (existingIndex >= 0) {
        accounts[existingIndex] = accountData;
    } else {
        accounts.push(accountData);
    }
    
    if (writeAccounts(accounts)) {
        res.json({ success: true, message: 'Account updated successfully' });
    } else {
        res.status(500).json({ error: 'Failed to update account' });
    }
});

// Get specific account
app.get('/api/accounts/:username', (req, res) => {
    const { username } = req.params;
    const accounts = readAccounts();
    const account = accounts.find(acc => acc.username === username);
    
    if (account) {
        res.json(account);
    } else {
        res.status(404).json({ error: 'Account not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});