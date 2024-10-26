const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB-Verbindung
const mongoURI = 'mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.pozoi.mongodb.net/gasMeterDB?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB verbunden'))
    .catch(err => console.error('Fehler bei der Verbindung zu MongoDB:', err));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mongoose-Schema und Modell
const meterReadingSchema = new mongoose.Schema({
    reading: Number,
    timestamp: Date
});

const MeterReading = mongoose.model('MeterReading', meterReadingSchema);

// API-Routen
app.post('/save-meter-reading', async (req, res) => {
    try {
        const { reading, timestamp } = req.body;

        // Logge den Zeitstempel, den wir vom Client erhalten
        console.log("Empfangener Zeitstempel vom Client:", timestamp);

        // Prüfe, ob der Zeitstempel gültig ist
        if (!timestamp) {
            return res.status(400).send('Zeitstempel fehlt.');
        }

        const newReading = new MeterReading({
            reading: parseFloat(reading),
            timestamp: new Date(timestamp)  // Verwende den übergebenen Zeitstempel
        });

        await newReading.save();
        console.log("Erfolgreich gespeichert:", newReading);
        res.send('Daten erfolgreich gespeichert');
    } catch (error) {
        console.error('Fehler beim Speichern der Daten:', error);
        res.status(500).send('Fehler beim Speichern der Daten');
    }
});

app.get('/get-readings', async (req, res) => {
    try {
        const readings = await MeterReading.find().sort({ timestamp: -1 });
        res.json(readings);
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        res.status(500).send('Fehler beim Laden der Daten');
    }
});

app.delete('/delete-reading/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await MeterReading.findByIdAndDelete(id);
        res.send('Daten erfolgreich gelöscht');
    } catch (error) {
        console.error('Fehler beim Löschen der Daten:', error);
        res.status(500).send('Fehler beim Löschen der Daten');
    }
});

// Start des Servers
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
