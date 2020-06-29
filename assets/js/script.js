// load the dom elements
var searchLink = document.querySelector("#search-form");
var searchInput = document.querySelector("#search-history");
var forecastContainer = document.querySelector("#current-weather-city");
var forecastContainer = document.querySelector("#current-weather");
var forecastContainer = document.querySelector("#forecast");

// define openweathermap api key
var apiKey = "3efc587005200cdf1f242650ff091998";

// make the api call to get the weather based on the city name
var getCurrentWeather = function() {
    var weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=San+Francisco&units=imperial&appid=" + apiKey;
    fetch(weatherApiUrl).then(function(res){
        if (res.ok) {
            res.json().then(function(data){
                var coordinates = data.coord;
                displayCurrentWeather(data);
                getUvIndex(coordinates);
            })
        } else {
            console.log("Couldn't get the weather data");
        }
    })
}

// get the UV index based on the coordinates from the initial response
var getUvIndex = function(coords) {
    var uvApiUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + coords.lat + "&lon=" + coords.lon + "&cnt=1";
    fetch(uvApiUrl).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {
                displayUvIndex(data);
            })
        } else {
            console.log("Couldn't get the UV Index");
        }
    })
}

// display the current weather
var displayCurrentWeather = function(weatherData) {
    var cityName = weatherData.name;
    var weatherDescription = weatherData.weather[0].description;
    var weatherIcon = weatherData.weather[0].icon;
    var humidity = weatherData.main.humidity;  // percentage
    var temperature = weatherData.main.temperature;  // fahrenheit if imperial, celsius if metric
    var windSpeed = weatherData.wind.speed;  // mph if imperial, m/s if metric
}

// display the UV Index
var displayUvIndex = function(uvData) {
    var uvIndex = uvData.value;
}

// add the search to local storage
// create a search history element and add it
