const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the main form page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../static files/index.html'));
});

// Handle form submission and display results on a new page
app.post('/results', (req, res) => {
    const query = req.body.cityname;
    const apiKey = '428bab56e7463bda66b8218ad3377c54';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`;

    https.get(url, (apiResponse) => {
        let data = '';

        apiResponse.on('data', (chunk) => {
            data += chunk;
        });

        apiResponse.on('end', () => {
            if (apiResponse.statusCode === 200) {
                try {
                    const weatherData = JSON.parse(data);
                    const temp = weatherData.main.temp;
                    const description = weatherData.weather[0].description;

                    // Send HTML with weather data
                    res.send(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Weather Results</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    height: 100vh;
                                    background-color: #f0f8ff;
                                    margin: 0;
                                }
                                .weather-info {
                                    background: #ffffff;
                                    border-radius: 10px;
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                                    padding: 20px;
                                    width: 300px;
                                    text-align: center;
                                }
                                .weather-info p {
                                    margin: 10px 0;
                                }
                                .weather-info .temperature {
                                    font-size: 2em;
                                    color: #333;
                                }
                                .weather-info .description {
                                    font-size: 1.2em;
                                    color: #777;
                                }
                                .back-button {
                                    display: block;
                                    margin-top: 20px;
                                    padding: 10px 20px;
                                    border: none;
                                    border-radius: 5px;
                                    background-color: #007bff;
                                    color: #fff;
                                    font-size: 1.1em;
                                    cursor: pointer;
                                    text-decoration: none;
                                    text-align: center;
                                }
                                .back-button:hover {
                                    background-color: #0056b3;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="weather-info">
                                <p class="temperature">${temp}°C</p>
                                <p class="description">${description}</p>
                                <a href="/" class="back-button">Go Back</a>
                            </div>
                        </body>
                        </html>
                    `);
                } catch (error) {
                    res.send('<h1>Error parsing weather data.</h1>');
                }
            } else {
                res.send('<h1>City not found or API error.</h1>');
            }
        });
    }).on('error', (e) => {
        res.send('<h1>API request failed.</h1>');
    });
});

app.listen(3000, () => console.log("Server is running on port 3000"));
