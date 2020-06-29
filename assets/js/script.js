// load the dom elements
var searchInput = document.querySelector("#search-input");
var searchButton = document.querySelector("#search-button");
var searchHistoryElement = document.querySelector("#search-history");
var currentWeatherCity = document.querySelector("#current-weather-city");
var currentWeatherData = document.querySelector("#current-weather");
var forecastElement = document.querySelector("#forecast");

// define other variables
var searchTerms = [];
var searchHistory = [];

// get the coordinates for the search term
var confirmLocation = function(locationsArray) {
    return locationsArray[0];
}

// persist the location data
var saveLocation = function(location) {
    // track the locations that have been searched
    var cityName = location.adminArea5;
    // display location as city, state, country
    var displayName = cityName + ", " + location.adminArea3 + ", " + location.adminArea1;
    currentWeatherCity.textContent = displayName;
    // save the search if it hasn't already been saved
    if (!searchTerms.includes(cityName)) {
        searchTerms.push(cityName);
        // define the object to save
        var cityData = {
            displayName: displayName,
            coords: location.latLng
        };
        // load localStorage, update it, then save
        searchHistory.push(cityData);
        localStorageHistory = {
            searchTerms: searchTerms,
            searchHistory: searchHistory
        }
        localStorage.setItem("searchHistory", JSON.stringify(localStorageHistory));
        // display the search history
        createSearchHistoryElement(cityData);
    }
}

// use the mapquest API to geocode the location based on the search terms
var getCoordinates = function(searchTerm) {
    searchTerm = searchTerm.split(" ").join("+");
    var geocodingApiUrl = "http://www.mapquestapi.com/geocoding/v1/address?key=ZJUiXdZZzhsEe05eUGvmmAsIoTPvQOHn&location=" + searchTerm;
    fetch(geocodingApiUrl).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {
                // find one location to use to generate the weather
                var locations = data.results[0].locations;
                var location;
                if (locations.length > 1) {
                    location = confirmLocation(locations);
                } else {
                    location = locations[0];
                }
                // add the coordinates to local storage
                saveLocation(location);
                // get the weather
                getWeather(location.latLng);
            })
        }
    });
}

// make the api call to get the weather based on the city name
var getWeather = function(coords) {
    var weatherApiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + coords.lat + "&lon=" + coords.lng + "&units=imperial&exclude=minutely,hourly&appid=3efc587005200cdf1f242650ff091998";
    fetch(weatherApiUrl).then(function(res){
        if (res.ok) {
            res.json().then(function(data){
                displayWeather(data);
            })
        } else {
            console.log("Couldn't get the weather data");
        }
    })
}

// create search history card
var createSearchHistoryElement = function(locationData) {
    var newCard = document.createElement("div");
    newCard.classList = "uk-card-default uk-card uk-card-body uk-card-hover uk-card-small uk-text-center search-history-item";
    newCard.textContent = locationData.displayName;
    newCard.setAttribute("data-location-name", locationData.displayName.replace(" ", "+"));
    searchHistoryElement.appendChild(newCard);
}

// use the search history to display the search history in the search panel
var displaySearchHistory = function() {
    var loadedSearchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if(loadedSearchHistory) {
        // display cards for the search history
        searchTerms = loadedSearchHistory.searchTerms;
        searchHistory = loadedSearchHistory.searchHistory;
        for (var i=0; i < searchHistory.length; i++) {
            if (!searchTerms.includes(searchHistory[i])) {
                createSearchHistoryElement(searchHistory[i]);
            }
        }
    }
}

// given an icon code and img element, display an icon
var displayIcon = function(iconElement, iconCode, iconAlt) {
    var iconSrc = "http://openweathermap.org/img/w/" + iconCode + ".png";
    iconElement.setAttribute("src", iconSrc);
    iconElement.setAttribute("alt", iconAlt);
}

// display the current weather
var displayWeather = function(weatherData) {
    // update the date
    var dateElement = currentWeatherData.querySelector("#current-weather-date");
    var unixDate = weatherData.current.dt;
    var formattedDate =  moment.unix(unixDate).format("dddd, MMMM Do");
    dateElement.textContent = formattedDate;

    // display the weather description
    var iconElement = currentWeatherData.querySelector("#current-weather-icon");
    var iconCode = weatherData.current.weather[0].icon;
    var iconAlt = weatherData.current.weather[0].description + " icon";
    displayIcon(iconElement, iconCode, iconAlt);

    // display the humidity
    var humidityElement = currentWeatherData.querySelector("#current-weather-humidity");
    var humidity = weatherData.current.humidity;  // percentage
    humidityElement.textContent = "Humidity: " + humidity + "%";

    // display the current temperature
    var temperatureElement = currentWeatherData.querySelector("#current-weather-current-temp");
    var temperature = Math.floor(weatherData.current.temp);  // fahrenheit if imperial, celsius if metric
    temperatureElement.textContent = "Current Temperature: " + temperature + "°F";

    // display the minimum temperature
    var minTempElement = currentWeatherData.querySelector("#current-weather-min-temp");
    var minTemp = Math.floor(weatherData.daily[0].temp.min);  // fahrenheit if imperial, celsius if metric
    minTempElement.textContent = "Low: " + minTemp + "°F";

    // display the maximum temperature
    var maxTempElement = currentWeatherData.querySelector("#current-weather-max-temp");
    var maxTemp = Math.floor(weatherData.daily[0].temp.max);  // fahrenheit if imperial, celsius if metric
    maxTempElement.textContent = "High: " + maxTemp + "°F";

    // display the wind speed
    var windSpeedElement = currentWeatherData.querySelector("#current-weather-wind-speed");
    var windSpeed = weatherData.current.wind_speed;  // mph if imperial, m/s if metric
    windSpeedElement.textContent = "Wind Speed: " + windSpeed + " miles per hour";

    // display the UV Index
    var uvIndexElement = currentWeatherData.querySelector("#current-weather-uv-index");
    var uvIndex = weatherData.current.uvi;
    uvIndexElement.textContent = "UV Index: " + uvIndex;

    // update the text color according to the EPA sun safety scale: https://www.epa.gov/sunsafety/uv-index-scale-0
    uvIndexElement.classList.remove("uk-text-danger");
    uvIndexElement.classList.remove("uk-text-warning");
    uvIndexElement.classList.remove("uk-text-success");
    if (uvIndex >= 8) {
        uvIndexElement.classList.add("uk-text-danger");
    } else if (uvIndex >= 3) {
        uvIndexElement.classList.add("uk-text-warning");
    } else {
        uvIndexElement.classList.add("uk-text-success")
    }

    // display the forecast
    displayForecast(weatherData.daily)
}

// display the 5 day forecast
var displayForecast = function(forecastData) {
    for (var i=1; i < 6; i++) {
        // display the date
        var dateElement = forecastElement.querySelector("#forecast-date-" + i);
        var unixDate = forecastData[i].dt;
        dateElement.textContent = moment.unix(unixDate).format("MMMM Do");

        // display the icon representation
        var iconElement = forecastElement.querySelector("#forecast-icon-" + i);
        var iconCode = forecastData[i].weather[0].icon;
        var iconAlt = forecastData[i].weather[0].description;
        displayIcon(iconElement, iconCode, iconAlt);

        // display humidity
        var humidityElement = forecastElement.querySelector("#forecast-humidity-" + i);
        var humidity = forecastData[i].humidity;  // percentage
        humidityElement.textContent = "Humidity: " + humidity + "%";

        // display min temperature
        var minTempElement = forecastElement.querySelector("#forecast-min-temp-" + i);
        var minTemp = Math.floor(forecastData[i].temp.min);  // fahrenheit if imperial, celsius if metric
        minTempElement.textContent = "Low: " + minTemp + "°F";

        // display max temperature
        var maxTempElement = forecastElement.querySelector("#forecast-max-temp-" + i);
        var maxTemp = Math.floor(forecastData[i].temp.max);  // fahrenheit if imperial, celsius if metric
        maxTempElement.textContent = "High: " + maxTemp + "°F";
    }
}

// event handler functions
var searchButtonHandler = function(event) {
    event.preventDefault();
    var searchValue = searchInput.value;
    getCoordinates(searchValue);
}

var searchHistoryHandler = function(event) {
    if (event.target.classList.contains("search-history-item")) {
        var searchedCity = event.target.getAttribute("data-location-name");
        getCoordinates(searchedCity);
    }
}

// event handlers and on load
displaySearchHistory();
searchButton.addEventListener("click", searchButtonHandler)
searchHistoryElement.addEventListener("click", searchHistoryHandler);