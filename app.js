require('dotenv').config();

const request = require("request");
const { response, json } = require("express");
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const ejs = require('ejs'); 
const path = require('path');


const app = express();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html" );
});


app.post("/", function(req, res){
    const query = req.body.cityName;
    if (!query) { // Check if cityName is empty
      res.redirect('/');
      return;
    }
    const apiKey = process.env.WEATHER_API_TOKEN;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}`;
  
    request(url, function(error, response, body) {
      if (error) {
        console.log("Error:", error);
        res.send("An error occurred. Please try again later.");
      } else if(response.statusCode !== 200) {
        console.log("Status:", response.statusCode);
        res.send("An error occurred. Please try again later today.");
      } 
    });
    
    https.get(url, function(response){
      console.log(response.statusCode);
    
      response.on('data', function(data){
        const weatherData = JSON.parse(data);
  
        
        // Check if the API call returned an error
        if (weatherData.cod !== 200) {
          res.redirect('/');
          return;
        }

        const mainWeather = weatherData.weather[0].main;
        res.render('weather.ejs', { mainWeather });
        console.log(mainWeather);
        
        const today = new Date();
        const dayOptions = { weekday: 'long' };
        const capitalizedDay = today.toLocaleDateString('en-US', dayOptions).charAt(0).toUpperCase() + today.toLocaleDateString('en-US', dayOptions).slice(1);
  
        const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-US', dateOptions);
  
        const temp = (weatherData.main.temp - 273.15).toFixed(0);
  
        const feels_like = (weatherData.main.feels_like - 273.15).toFixed(0);
  
        const humidity = (weatherData.main.humidity)
  
        const wind = (weatherData.wind.speed)
    
        const weatherDes = weatherData.weather[0].description;
        const capitalizedFirstLetter = weatherDes.charAt(0).toUpperCase();
        const capitalizedWeatherDes = capitalizedFirstLetter + weatherDes.slice(1);
    
        const icon = weatherData.weather[0].icon;
        const imgUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;
    
        res.render("weather.ejs", {
          city: query,
          temp: temp,
          feels_like: feels_like,
          humidity: humidity,
          wind: wind,
          weatherDes: weatherDes,
          imgUrl: imgUrl,
          capitalizedWeatherDes: capitalizedWeatherDes,
          capitalizedDay: capitalizedDay,
          formattedDate: formattedDate,
          mainWeather:mainWeather
        });
      });
    });
  });


app.listen(3000, function(){
    console.log("THE server is RUNNING on port 3000!"); 
})