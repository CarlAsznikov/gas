const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware für JSON-Verarbeitung
app.use(bodyParser.json());

// Statische Dateien bereitstellen
app.use(express.static('public'));

// API-Endpunkt zum Speichern des Zählerstandes
app.post('/save-meter-reading', (req, res) => {
    const data = {
        reading: req.body.reading,
        timestamp: new Date().toISOString()
    };

    // Zählerstände aus der Datei laden oder leere Liste erstellen
    fs.readFile('readings.json', (err, fileData) => {
        const readings = err ? [] : JSON.parse(fileData);
        readings.push(data);

        // Zählerstände in der Datei speichern
        fs.writeFile('readings.json', JSON.stringify(readings, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Fehler beim Speichern der Daten');
            }
            res.send('Daten erfolgreich gespeichert');
        });
    });
});

// API-Endpunkt zum Abrufen aller Zählerstände
app.get('/get-readings', (req, res) => {
    fs.readFile('readings.json', (err, fileData) => {
        if (err) {
            return res.status(500).send('Fehler beim Laden der Daten');
        }
        res.json(JSON.parse(fileData));
    });
});

// Route für die Startseite
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
