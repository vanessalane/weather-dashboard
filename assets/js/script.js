// load the dom elements
var searchInput = document.querySelector("#search-input");
var searchButton = document.querySelector("#search-button");
var searchHistoryElement = document.querySelector("#search-history");
var currentWeatherCity = document.querySelector("#current-weather-city");
var currentWeatherData = document.querySelector("#current-weather");
var forecast = document.querySelector("#forecast");

// define other variables
var apiKey = "3efc587005200cdf1f242650ff091998";
var searchHistory = [];

// make the api call to get the weather based on the city name
var getCurrentWeather = function(city) {
    city.replace(" ", "+")
    var weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + apiKey;
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

var createSearchHistoryElement = function(cityName) {
    var newCard = document.createElement("div");
    newCard.classList = "uk-card-default uk-card uk-card-body uk-card-hover uk-card-small uk-text-center search-history-item";
    newCard.textContent = cityName;
    newCard.setAttribute("id", cityName.replace(" ","+"));
    searchHistoryElement.appendChild(newCard);
}

var displaySearchHistory = function() {
    var loadedSearchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if(loadedSearchHistory) {
        // display cards for the search history
        searchHistory = loadedSearchHistory;
        for (var i=0; i < searchHistory.length; i++) {
            createSearchHistoryElement(searchHistory[i])
        }
    }
}

// display the current weather
var displayCurrentWeather = function(weatherData) {
    // add the city name to the current weather card
    var cityName = weatherData.name;
    currentWeatherCity.textContent = cityName;

    // also add the city name to the search history
    if (searchHistory && !searchHistory.includes(cityName)){
        searchHistory.push(cityName);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        createSearchHistoryElement(cityName);
    }

    // update the date
    var dateElement = currentWeatherData.querySelector("#current-weather-date");
    dateElement.textContent = moment().format("dddd, MMMM Do");

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

var searchButtonHandler = function(event) {
    event.preventDefault();
    var searchValue = searchInput.value;
    getCurrentWeather(searchValue);
}

var searchHistoryHandler = function(event) {
    if (event.target.classList.contains("search-history-item")) {
        var searchedCity = event.target.id;
        getCurrentWeather(searchedCity)
    }
}

displaySearchHistory();
searchButton.addEventListener("click", searchButtonHandler)
searchHistoryElement.addEventListener("click", searchHistoryHandler);