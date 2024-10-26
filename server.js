const basicAuth = require('express-basic-auth');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
app.use(basicAuth({
  users: { 'carlasznikov': 'Fehler1234*_*ga2016' }, // Benutzername und Passwort festlegen
  challenge: true  // Aktiviert den Authentifizierungsdialog im Browser
}));

const PORT = process.env.PORT || 3000;

// Verbindung zu MongoDB herstellen
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Timeout auf 5 Sekunden setzen
})
.then(() => console.log('MongoDB erfolgreich verbunden'))
.catch(error => console.error('Fehler beim Verbinden mit MongoDB:', error));

const meterReadingSchema = new mongoose.Schema({
    reading: Number,
    timestamp: { type: Date, default: Date.now }
});

const MeterReading = mongoose.model('MeterReading', meterReadingSchema);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API-Endpunkt zum Speichern des Zählerstandes
app.post('/save-meter-reading', async (req, res) => {
    console.log('POST /save-meter-reading aufgerufen');
    console.log('Anfrageinhalt:', req.body);

    try {
        // Verwende den Zeitstempel aus dem Request, oder falls keiner angegeben ist, verwende das aktuelle Datum
        const timestamp = req.body.timestamp ? new Date(req.body.timestamp) : new Date();
        
        // Prüfe den Zeitstempel, bevor er gespeichert wird
        console.log('Zu speichernder Zeitstempel:', timestamp);

        const newReading = new MeterReading({
            reading: req.body.reading,
            timestamp: timestamp
        });
        
        await newReading.save();
        console.log('Zählerstand erfolgreich gespeichert mit Zeitstempel:', timestamp);
        res.send('Daten erfolgreich gespeichert');
    } catch (error) {
        console.error('Fehler beim Speichern der Daten:', error);
        res.status(500).send('Fehler beim Speichern der Daten: ' + error.message);
    }
});

// API-Endpunkt zum Abrufen aller Zählerstände
app.get('/get-readings', async (req, res) => {
    try {
        const readings = await MeterReading.find().sort({ timestamp: 1 });
        res.json(readings);
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        res.status(500).send('Fehler beim Laden der Daten: ' + error.message);
    }
});

// Endpunkt zum Löschen eines Zählerstands anhand der ID
app.delete('/delete-reading/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await MeterReading.findByIdAndDelete(id);
        res.send('Eintrag gelöscht');
    } catch (error) {
        console.error('Fehler beim Löschen des Eintrags:', error);
        res.status(500).send('Fehler beim Löschen des Eintrags');
    }
});

// Startseite anzeigen (optional, falls du eine index.html hast)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
