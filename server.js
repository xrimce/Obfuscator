'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Lua Obfuscation Logic
function obfuscateLua(luaCode) {
    // Implement your obfuscation logic here
    // Example: simple string reversal as a placeholder
    return luaCode.split('').reverse().join('');
}

// Endpoint to obfuscate Lua code
app.post('/obfuscate', (req, res) => {
    const { luaCode } = req.body;
    if (!luaCode) {
        return res.status(400).send({ error: 'Lua code is required' });
    }
    const obfuscatedCode = obfuscateLua(luaCode);
    res.send({ obfuscatedCode });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});