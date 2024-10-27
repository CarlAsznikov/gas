const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Geheimer Schlüssel für JWT (idealerweise in einer .env-Datei)
const JWT_SECRET = 'your-secret-key';

// Registrierung
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = new User({ username, password });
        await user.save();
        res.status(201).send('Benutzer erfolgreich registriert');
    } catch (error) {
        res.status(500).send('Fehler bei der Registrierung: ' + error.message);
    }
});

// Anmeldung
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send('Benutzer nicht gefunden');

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).send('Ungültiges Passwort');

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).send('Fehler bei der Anmeldung: ' + error.message);
    }
});

module.exports = router;