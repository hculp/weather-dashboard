const apiKey = '8bd027d381a69ec1485e04e18a1d1f6f';
const apiEndpoint = 'https://api.openweathermap.org/';
var currentDay = dayjs().format('M/DD/YYYY');
var searchBtn = document.querySelector('.btn.btn-primary.search');
var searchHistory = [];


function currentWeather(city) {
    var apiURL = `${apiEndpoint}geo/1.0/direct?q=${city}&appid=${apiKey}`;
    var lat;
    var lon;

    // First api request is for the geolocation to get the latitude and logitude of the city.
    fetch(apiURL)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        .then(function (location) {
            lat = location[0].lat;
            lon = location[0].lon;

            // Second api request is to get the current weather conditions (icon weather codnition, temperature, humidity, and wind speed).
            apiURL  = `${apiEndpoint}data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            fetch(apiURL) 
                .then(function (response) {
                    if (!response.ok) {
                        throw response.json();
                    }
                    return response.json();
                })
                .then(function (weather) {
                    // Grab current weather condition icon
                    var iconID = weather.weather[0].icon;
                    var iconURL = `https://openweathermap.org/img/w/${iconID}.png`;
                    
                    // Fill current weather conditions
                    var header = document.createElement('h2');
                    header.textContent = `${weather.name} ${currentDay}`;
                    $('#current-weather').append(header);
                    var iconImg = document.createElement('img');
                    iconImg.setAttribute('src', iconURL);
                    iconImg.setAttribute('class', 'img-fluid')
                    $('#current-weather').siblings().append(iconImg);

                })
                .catch(function (error) {
                    alert(error);
                });
        })
        .catch(function (error) {
            alert(error);
        });

}

var findCity = function (event) {
    event.preventDefault();
    var city = $('#city-input').val().trim();
    currentWeather(city);

    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        var searchedCity = $(`
        <li class="list-group-item">${city}</li>
        `);
         $("#searchHistory").append(searchedCity);
    }
    localStorage.setItem("city", JSON.stringify(searchHistory));
}

searchBtn.addEventListener('click',findCity);