const express = require('express');
const axios = require('axios');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Multer setup for file uploads
const storage = multer.memoryStorage(); // This stores the file in memory
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.send('Welcome to the car matcher!');
});

app.post('/upload', upload.single('carImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image uploaded');
    }

    try {
        const imageBuffer = req.file.buffer;

        const azureResponse = await axios.post(`${process.env.AZURE_ENDPOINT}vision/v3.1/analyze`, imageBuffer, {
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.AZURE_API_KEY,
                'Content-Type': 'application/octet-stream'
            },
            params: {
                visualFeatures: 'Categories,Description,Color'
            }
        });

        // Process azureResponse and find a similar car from your database...

        res.json(azureResponse.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
