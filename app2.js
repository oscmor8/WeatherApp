const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const https = require("https");
const PORT = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// Create a function to retrieve weather data based on latitude and longitude
function getWeatherData(latitude, longitude, res) {
  const apiKey = "48a1c768b9cd8c3d71346a35195701b1";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;

  https.get(url, function (response) {
    response.on("data", function (data) {
      const jsonData = JSON.parse(data);
      const temp = jsonData.main.temp;
      const des = jsonData.weather[0].description;
      const icon = jsonData.weather[0].icon;
      const imageUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

      res.write(`<h1>The temperature in this location is ${temp} degrees</h1>`);
      res.write(`<p>The weather description is ${des}</p>`);
      res.write(`<img src="${imageUrl}" alt="Weather Icon">`);
      res.send();
    });
  });
}
// creates a post request to the main url
app.post("/", function (req, res) {
  const location = req.body.location;
  const apiKey = "48a1c768b9cd8c3d71346a35195701b1";

  // Check if the user input is a number (zip code) or a string (city name)
  if (!isNaN(location)) {
    // User input is a zip code
    const zipUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${location}&appid=${apiKey}`;

    // creates an HTTPS get request to the geo api
    https.get(zipUrl, function (response) {
      response.on("data", function (data) {
        const jsonData = JSON.parse(data);
        // checks to see if the api connection contains latitude and longitude
        if (
          //checks to see if an object does not have the properties lat and lon meaning the api request did not bring back latitude and longitude
          !jsonData.hasOwnProperty("lat") ||
          !jsonData.hasOwnProperty("lon")
        ) {
          res.send("<h1>No weather found</h1>");
          return;
        }
        const { lat, lon } = jsonData;
        //calls the getWeatherData function to grab the weather information
        getWeatherData(lat, lon, res);
      });
    });
  } else {
    // if User input is a city name creates an api to get the weather using city name
    const cityUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${apiKey}`;

    https.get(cityUrl, function (response) {
      response.on("data", function (data) {
        const jsonData = JSON.parse(data);
        // if statment to check if the apir response is empty
        if (jsonData.length === 0) {
          // if it is empty return no weather data found
          res.send("<h1>No weather data found for the provided location</h1>");
          return;
        }
        const { lat, lon } = jsonData[0];
        // calls the getWeather function to grab the weather information using city name, lat and lon
        getWeatherData(lat, lon, res);
      });
    });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on local host ${PORT}`);
});
