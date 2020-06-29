// load the dom elements
var searchInput = document.querySelector("#search-input");
var searchButton = document.querySelector("#search-button");
var confirmLocationModal = document.querySelector("#confirm-location-modal");
var searchHistoryElement = document.querySelector("#search-history");
var currentWeatherCity = document.querySelector("#current-weather-city");
var currentWeatherData = document.querySelector("#current-weather");
var forecastElement = document.querySelector("#forecast");

// define other variables
var displayName;
var searchTerms = [];
var searchHistory = [];

var defineDisplayName = function(location) {
    /* display the location as city, state, country */

    var city = location.adminArea5;
    var state = location.adminArea3;
    var country = location.adminArea1;
    var tempDisplayName = [];

    if (city) {
        tempDisplayName.push(city);
    }
    if (state) {
        tempDisplayName.push(state);
    }
    if (country) {
        tempDisplayName.push(country);
    }
    return tempDisplayName.join(", ");
}

var confirmLocation = function(locationsArray) {
    /* handle situtations where there are multiple results*/

    // get the form body element and clear it
    var formBody = confirmLocationModal.querySelector("#confirm-location-form-body");
    formBody.innerHTML = "";

    // set up the modal
    for (let i=0; i < locationsArray.length; i++) {

        // create the container
        var searchResultContainer = document.createElement("div");
        searchResultContainer.classList.add("search-result-item", "uk-form-controls", "uk-margin");

        // create the radio button
        var searchResultInput = document.createElement("input");
        searchResultInput.setAttribute("type", "radio");
        searchResultInput.setAttribute("name", "search-result");
        searchResultInput.setAttribute("id", "search-result-" + i);
        searchResultInput.setAttribute("data-location", JSON.stringify(locationsArray[i]));
        searchResultContainer.appendChild(searchResultInput);

        // create the label
        var modalDisplayName = defineDisplayName(locationsArray[i]);
        var searchResultLabel = document.createElement("label");
        searchResultLabel.innerText = modalDisplayName;
        searchResultLabel.setAttribute("for", "search-result-" + i);
        searchResultContainer.appendChild(searchResultLabel);

        // add the container to the form
        formBody.appendChild(searchResultContainer);
    }

    // display the modal
    UIkit.modal("#confirm-location-modal").show();
}

var saveLocation = function(location) {
    /* persist the location data */

    // set the displayName value
    displayName = defineDisplayName(location);

    // save the search if it hasn't already been saved
    if (!searchTerms.includes(displayName)) {
        searchTerms.push(displayName);

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

var getCoordinates = function(searchTerm) {
    /* use the mapquest API to geocode the location based on the search terms */

    searchTerm = searchTerm.split(" ").join("+");
    var geocodingApiUrl = "https://www.mapquestapi.com/geocoding/v1/address?key=ZJUiXdZZzhsEe05eUGvmmAsIoTPvQOHn&location=" + searchTerm;
    fetch(geocodingApiUrl).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {

                // find one location to use to generate the weather
                var locations = data.results[0].locations;
                var location;
                if (locations.length == 1) {
                    saveLocation(locations[0]);
                    getWeather(locations[0].latLng);
                } else {
                    confirmLocation(locations);
                }
            })
        }
    });
}

var getWeather = function(coords) {
    /* make the api call to get the weather based on a set of coordinates {lat: x, lng: y} */

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

var createSearchHistoryElement = function(locationData) {
    /* helper function to create search history card */

    var newCard = document.createElement("div");
    newCard.classList = "uk-card-default uk-card uk-card-body uk-card-hover uk-card-small uk-text-center search-history-item";
    newCard.textContent = locationData.displayName;
    newCard.setAttribute("data-location-name", locationData.displayName.replace(" ", "+"));
    searchHistoryElement.appendChild(newCard);
}

var displaySearchHistory = function() {
    /* display search history cards if there's a search history in localStorage */

    var loadedSearchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if(loadedSearchHistory) {
        searchTerms = loadedSearchHistory.searchTerms;
        searchHistory = loadedSearchHistory.searchHistory;
        for (var i=0; i < searchHistory.length; i++) {
            if (!searchTerms.includes(searchHistory[i])) {
                createSearchHistoryElement(searchHistory[i]);
            }
        }
    }
}

var displayIcon = function(iconElement, iconCode, iconAlt) {
    /* given an icon code and img element, display an icon */

    var iconSrc = "http://openweathermap.org/img/w/" + iconCode + ".png";
    iconElement.setAttribute("src", iconSrc);
    iconElement.setAttribute("alt", iconAlt);
}

var displayWeather = function(weatherData) {
    /* use the weatherData object to display the current weather */

    // update the city name
    currentWeatherCity.textContent = displayName;

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

var confirmLocationHandler = function(event){
    event.preventDefault();
    var confirmedLocation;
    var radioButtons = document.getElementsByName("search-result");
    for (var i=0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            confirmedLocation = JSON.parse(radioButtons[i].getAttribute("data-location"));
        }
    }

    // if a location was found, display the weather
    if (confirmedLocation) {
        UIkit.modal("#confirm-location-modal").hide();
        saveLocation(confirmedLocation);
        getWeather(confirmedLocation.latLng)
    }
    else {
        // if not, let the user know they're missing a response.
        confirmLocationModal.querySelector("#confirm-location-form-message").textContent = "Please select a city from the options below.";
    }
}

// event handlers and on load
displaySearchHistory();
searchButton.addEventListener("click", searchButtonHandler)
searchHistoryElement.addEventListener("click", searchHistoryHandler);
confirmLocationModal.addEventListener("submit", confirmLocationHandler);