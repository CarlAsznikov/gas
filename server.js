const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Verbindung zu MongoDB herstellen
const mongoURI = 'mongodb+srv://carlasznikov:NZMOf3HdwMZM2Xjh@cluster0.pozoi.mongodb.net/gasMeterDB?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB verbunden'))
    .catch(error => console.error('Fehler beim Verbinden mit MongoDB:', error));

// Schema und Modell für Zählerstände definieren
const meterReadingSchema = new mongoose.Schema({
    reading: Number,
    timestamp: { type: Date, default: Date.now }
});

const MeterReading = mongoose.model('MeterReading', meterReadingSchema);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API-Endpunkt zum Speichern des Zählerstandes
app.post('/save-meter-reading', (req, res) => {
    const newReading = new MeterReading({
        reading: req.body.reading
    });

    newReading.save()
        .then(() => res.send('Daten erfolgreich gespeichert'))
        .catch(error => res.status(500).send('Fehler beim Speichern der Daten: ' + error));
});

// API-Endpunkt zum Abrufen aller Zählerstände
app.get('/get-readings', (req, res) => {
    MeterReading.find()
        .sort({ timestamp: 1 })
        .then(readings => res.json(readings))
        .catch(error => {
            console.error('Fehler beim Laden der Daten:', error);
            res.status(500).send('Fehler beim Laden der Daten: ' + error);
});

// Startseite anzeigen (optional, falls du eine index.html hast)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
