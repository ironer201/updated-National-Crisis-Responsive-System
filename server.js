const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const port = 3000;

// Multer setup for FormData
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// File paths
const reportsFile = path.join(__dirname, 'reports.txt');
const loginFile = path.join(__dirname, 'login.txt');
const passiveFile = path.join(__dirname, 'passive.txt');

// Serve HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'passive.html'));
});

// Handle passive form submission
app.post('/submit', upload.none(), async (req, res) => {
    try {
        const {
            survivor,
            dob,
            incidentDate,
            reportType,
            description,
            location
        } = req.body;

        // Debug: Log received data
        console.log('Received passive form data:', req.body);

        const content = `
Survivor Gender: ${survivor || 'Not specified'}
Date of Birth: ${dob || 'Not specified'}
Date of Incident: ${incidentDate || 'Not specified'}
Report Type: ${reportType || 'Not specified'}
Description: ${description || 'Not specified'}
Location: ${location || 'Not specified'}
---------------------------
`;

        await fs.appendFile(passiveFile, content, 'utf8');
        console.log('Passive report saved:', content);
        res.status(200).send('Report submitted successfully!');
    } catch (err) {
        console.error('Error in /submit:', err);
        res.status(500).send('Server error');
    }
});

// Fetch passive reports endpoint
app.get('/get-passive-reports', async (req, res) => {
    try {
        const data = await fs.readFile(passiveFile, 'utf8');
        const reports = data.trim().split('---------------------------')
            .filter(report => report.trim())
            .map(report => {
                const lines = report.trim().split('\n');
                const reportObj = {};
                lines.forEach(line => {
                    const [key, value] = line.split(': ').map(str => str.trim());
                    if (key && value) {
                        reportObj[key.replace(' ', '_').toLowerCase()] = value;
                    }
                });
                return reportObj;
            });
        res.json(reports);
    } catch (err) {
        if (err.code === 'ENOENT') res.json([]);
        else {
            console.error('Error reading passive reports:', err);
            res.status(500).json({ error: 'Failed to fetch passive reports' });
        }
    }
});

// Submit report endpoint
app.post('/submit-report', async (req, res) => {
    const { ip, message, dateTime } = req.body;
    const report = { ip, message, dateTime };

    try {
        await fs.appendFile(reportsFile, JSON.stringify(report) + '\n', 'utf8');
        console.log('Report saved:', report);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error saving report:', err);
        res.status(500).json({ error: 'Failed to save report' });
    }
});

// Fetch reports endpoint
app.get('/get-reports', async (req, res) => {
    try {
        const data = await fs.readFile(reportsFile, 'utf8');
        const reports = data.trim().split('\n').map(line => JSON.parse(line));
        res.json(reports);
    } catch (err) {
        if (err.code === 'ENOENT') res.json([]);
        else {
            console.error('Error reading reports:', err);
            res.status(500).json({ error: 'Failed to fetch reports' });
        }
    }
});

// Sign Up Endpoint
app.post('/signup', async (req, res) => {
    const { username, email, phone, password } = req.body;

    try {
        const data = await fs.readFile(loginFile, 'utf8').catch(() => '');
        const users = data.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));

        if (users.some(user => user.email === email)) {
            return res.status(400).json({ message: 'Email already registered!' });
        }

        const user = { username, email, phone, password };
        await fs.appendFile(loginFile, JSON.stringify(user) + '\n');
        res.json({ message: 'Signup successful!' });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ message: 'Server error!' });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const data = await fs.readFile(loginFile, 'utf8').catch(() => '');
        const users = data.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));

        const found = users.find(user => user.email === email && user.password === password);

        if (found) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password!' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error!' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});