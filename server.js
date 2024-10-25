const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Verbindung zu MongoDB herstellen
const mongoURI = 'mongodb+srv://carlasznikov:NZMOf3HdwMZM2Xjh@cluster0.pozoi.mongodb.net/gasMeterDB?retryWrites=true&w=majority&appName=Cluster0';

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
        const newReading = new MeterReading({
            reading: req.body.reading
        });
        await newReading.save();
        console.log('Zählerstand erfolgreich gespeichert');
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

// Startseite anzeigen (optional, falls du eine index.html hast)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
