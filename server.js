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
function obfuscateLua(luaCode, options = {}) {
    const { level = 'high', minify = false, watermark = true, antiTamper = false } = options;
    
    let result = luaCode;

    // 1. Minification (mock identifier scrambling)
    if (minify) {
        // Simple variable compression simulation
        result = result
            .replace(/--.*$/gm, '') // Remove single-line comments
            .replace(/\s+/g, ' ')   // Collapse whitespace
            .trim();
    }

    // 2. Obfuscation Level transformations
    if (level === 'basic') {
        // String reverse + simple load wrapper
        const reversed = result.split('').reverse().join('').replace(/'/g, "\\'");
        result = `local _ = '${reversed}'; load(_:reverse())()`;
    } 
    else if (level === 'medium') {
        // Convert characters to hex-escaped bytecode string
        const hexEscaped = Array.from(result)
            .map(char => '\\' + char.charCodeAt(0))
            .join('');
        result = `load('${hexEscaped}')()`;
    } 
    else if (level === 'high') {
        // Simulate a virtualized state machine wrapper
        const bytecode = Array.from(result)
            .map(char => char.charCodeAt(0) ^ 0xAF) // XOR encryption with 0xAF
            .join(',');
        
        result = `(function(...)
    local encrypted = { ${bytecode} }
    local decrypted = {}
    for i = 1, #encrypted do
        decrypted[i] = string.char(encrypted[i] ~ 0xAF)
    end
    local run = load(table.concat(decrypted))
    if run then run(...) else error("Aether: Decryption failed.") end
end)(...)`;
    }

    // 3. Anti-Tamper Protection Hook
    if (antiTamper) {
        result = `local _tamper_check = function()
    if debug and debug.getinfo then
        local info = debug.getinfo(1)
        if info.what == "C" or not info.source:find("@") then
            error("Aether: Debugging / Hooking detected!")
        end
    end
end
_tamper_check()
${result}`;
    }

    // 4. Header Watermark
    if (watermark) {
        const dateStr = new Date().toISOString().split('T')[0];
        result = `--[[
    [!] OBFUSCATED BY AETHER.OBF
    [!] Build Date: ${dateStr}
    [!] Protection Level: ${level.toUpperCase()}
    [!] Anti-Tamper: ${antiTamper ? "ENABLED" : "DISABLED"}
--]]
${result}`;
    }

    return result;
}

// Endpoint to obfuscate Lua code
app.post('/obfuscate', (req, res) => {
    const { luaCode, level, minify, watermark, antiTamper } = req.body;
    if (!luaCode) {
        return res.status(400).send({ error: 'Lua code is required' });
    }
    const obfuscatedCode = obfuscateLua(luaCode, { level, minify, watermark, antiTamper });
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