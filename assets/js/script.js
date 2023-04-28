const apiKey = '8bd027d381a69ec1485e04e18a1d1f6f';
const apiEndpoint = 'api.openweathermap.org/';
var currentDay = dayjs().format('M/DD/YYYY');
var searchBtn = document.querySelector('.btn.btn-primary.search');
var searchHistory = [];

console.log(currentDay);

function currentWeather(city) {
    var apiURL = apiEndpoint + 'geo/1.0/direct?q=' + city 
}

var findCity = function (event) {
    event.preventDefault();
    var city = $('#city-input').val().trim();
    
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        var searchedCity = $(`
        <li class="list-group-item">${city}</li>
        `);
         $("#searchHistory").append(searchedCity);
    }
}

searchBtn.addEventListener('click',findCity);