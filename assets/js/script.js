// load the dom elements
var searchLink = document.querySelector("#search-form");
var searchInput = document.querySelector("#search-history");
var currentWeatherCity = document.querySelector("#current-weather-city");
var currentWeatherData = document.querySelector("#current-weather");
var forecast = document.querySelector("#forecast");

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
    // add the city name to the DOM
    var city = weatherData.name;
    currentWeatherCity.textContent = city;

    // display the weather description
    var iconElement = currentWeatherData.querySelector("#current-weather-icon");
    var iconCode = weatherData.weather[0].icon;
    var iconSrc = "http://openweathermap.org/img/w/" + iconCode + ".png";
    var iconAlt = weatherData.weather[0].description + " icon";
    iconElement.setAttribute("src", iconSrc);
    iconElement.setAttribute("alt", iconAlt);

    // display the humidity
    var humidityElement = currentWeatherData.querySelector("#current-weather-humidity");
    var humidity = weatherData.main.humidity;  // percentage
    humidityElement.textContent = "Humidity: " + humidity + "%";

    // display the temperature
    var temperatureElement = currentWeatherData.querySelector("#current-weather-temperature");
    var temperature = weatherData.main.temp;  // fahrenheit if imperial, celsius if metric
    temperatureElement.textContent = "Current Temperature: " + temperature + "°F";

    // display the wind speed
    var windSpeedElement = currentWeatherData.querySelector("#current-weather-wind-speed");
    var windSpeed = weatherData.wind.speed;  // mph if imperial, m/s if metric
    windSpeedElement.textContent = "Wind Speed: " + windSpeed + " miles per hour";
}

// display the UV Index
var displayUvIndex = function(uvData) {
    // add the UV Index to the DOM
    var uvIndex = uvData.value;
    var uvIndexElement = currentWeatherData.querySelector("#current-weather-uv-index");
    uvIndexElement.textContent = "UV Index: " + uvIndex;

    // clear any classes that are already applied
    uvIndexElement.classList.remove("uk-text-danger");
    uvIndexElement.classList.remove("uk-text-warning");
    uvIndexElement.classList.remove("uk-text-success");

    // update the text color according to the EPA sun safety scale: https://www.epa.gov/sunsafety/uv-index-scale-0
    if (uvIndex >= 8) {
        uvIndexElement.classList.add("uk-text-danger");
    } else if (uvIndex >= 3) {
        uvIndexElement.classList.add("uk-text-warning");
    } else {
        uvIndexElement.classList.add("uk-text-success")
    }
}
