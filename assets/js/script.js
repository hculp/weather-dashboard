const apiKey = "8bd027d381a69ec1485e04e18a1d1f6f";
const apiEndpoint = "https://api.openweathermap.org/";
var currentDay = dayjs().format("M/DD/YYYY");
var searchBtn = document.querySelector(".btn.btn-primary.search");
var searchInput = document.querySelector("#city-input");
var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

// Function to get current weather conditions
function currentWeather(city) {
  // Clear prior search input field
  $("#city-input").val("");

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

      // Second api request is to get the current weather conditions (icon weather condition, temperature, humidity, and wind speed).
      apiURL = `${apiEndpoint}data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
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

          // Fill current weather conditions and clear prior display
          $("#current-weather").empty();
          var header = document.createElement("h2");
          header.textContent = `${weather.name} ${currentDay}`;
          $("#current-weather").append(header);
          var iconImg = document.createElement("img");
          iconImg.setAttribute("src", iconURL);
          iconImg.setAttribute("class", "img-fluid");
          $("#current-weather").children().append(iconImg);
          var temperature = document.createElement("p");
          temperature.textContent = `Temp: ${weather.main.temp}°F`;
          var wind = document.createElement("p");
          wind.textContent = `Wind: ${weather.wind.speed} MPH`;
          var humidity = document.createElement("p");
          humidity.textContent = `Humidity: ${weather.main.humidity}%`;
          $("#current-weather").append(temperature, wind, humidity);
          $("#current-weather").css("display", "block");

          futureForecast(city);
        })
        .catch(function (error) {
          alert(error);
        });
    })
    .catch(function (error) {
      alert(error);
    });
}

function futureForecast(city) {
  var fivedayURL = `${apiEndpoint}data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

  fetch(fivedayURL)
    .then(function (response) {
      if (!response.ok) {
        throw response.json();
      }
      return response.json();
    })
    .then(function (futureWeather) {
      // Clear prior display
      $("#future-forecast").empty();

      // Depending on when the api call is made, the order of returned list with dates may change (i.e. call made at 11a.m. returns different list to increment over to get 5day forecast than a apic all made 11p.m.)
      // To avoid having to determine increment amount, a minimum of 8 list items are skipped to get the 5 day forecast no matter what time the request is made (updates occur every 3 hours).
      for (let i = 0; i < futureWeather.list.length; i += 8) {
        // Get date, icon, temperature, wind speed, and humidity for each day
        var date = futureWeather.list[i].dt_txt;
        var dateTime = date.split(" ");
        var date = dateTime[0];
        var dateFormated = dayjs(date).format("M/DD/YYYY");
        var iconID = futureWeather.list[i].weather[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${iconID}.png`;
        var temp = futureWeather.list[i].main.temp;
        var wind = futureWeather.list[i].wind.speed;
        var humidity = futureWeather.list[i].main.humidity;

        // Create card to display weather conditions
        var card = document.createElement("div");
        card.setAttribute("class", "card bg-info-subtle text-white");
        var cardBody = document.createElement("div");
        cardBody.setAttribute("class", "card-body");
        var cardTitle = document.createElement("h5");
        cardTitle.setAttribute("class", "card-title");
        cardTitle.textContent = dateFormated;
        var cardIcon = document.createElement("img");
        cardIcon.setAttribute("src", iconURL);
        cardIcon.setAttribute("class", "img-fluid");
        var cardTemp = document.createElement("p");
        cardTemp.setAttribute("class", "card-text");
        cardTemp.textContent = `Temp: ${temp}°F`;
        var cardWind = document.createElement("p");
        cardWind.setAttribute("class", "card-text");
        cardWind.textContent = `Wind: ${wind} MPH`;
        var cardHumidity = document.createElement("p");
        cardHumidity.setAttribute("class", "card-text");
        cardHumidity.textContent = `Humidity: ${humidity}%`;

        // Append weather conditions to card
        cardBody.append(cardTitle, cardIcon, cardTemp, cardWind, cardHumidity);
        console.log(cardBody);
        card.append(cardBody);
        $("#future-forecast").append(card);
      }

      // Display 5 day forecast section
      $("#future-forecast").css("display", "block");
    })
    .catch(function (error) {
      alert(error);
    });
}

var findCity = function (event) {
  event.preventDefault();
  var city = $("#city-input").val().trim();
  // Capitalize first letter for search history display
  var cityWords = city.split(" ");
  for (var i = 0; i < cityWords.length; i++) {
    cityWords[i] = cityWords[i].charAt(0).toUpperCase() + cityWords[i].slice(1);
  }
  city = cityWords.join(" ");

  // Check if city was entered
  if (!city) {
    alert("Please enter a city.");
    return;
  }
  currentWeather(city);

  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    var searchedCity = $(`
        <li class="list-group-item mtb-2 btn btn-secondary btn-outline-primary">${city}</li>
        `);
    $("#searchHistory").append(searchedCity);
  }
  localStorage.setItem("city", JSON.stringify(searchHistory));
};

// Event listeners for search button click and enter keypress
searchBtn.addEventListener("click", findCity);
searchInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    findCity(event);
  }
});

// When a city is clicked from the search history, displays weather conditions.
$("#searchHistory").on("click", "li", function () {
  var city = $(this).text();
  currentWeather(city);
  futureForecast(city);
});

// When the page is loaded, the last searched city's weather is displayed.
var lastCity = JSON.parse(localStorage.getItem("city"));
if (lastCity) {
  currentWeather(lastCity[lastCity.length - 1]);
}

// When the clear search button is clicked, the search history is cleared as well as displayed weather.
// Document ready function is used to ensure that the local storage is checked and loads any existing search history before executing the click event.
$(document).ready(function () {
  $(".clearBtn").on("click", function () {
    localStorage.clear();
    $("#current-weather").empty();
    $("#future-weather").empty();
    $("#searchHistory").empty();
  });
});

// Check if there is a search history in local storage and display it.
if (localStorage.getItem("city")) {
  var cityStorage = JSON.parse(localStorage.getItem("city"));
  for (let i = 0; i < cityStorage.length; i++) {
    var searchedCity = $(`
            <li class="list-group-item mtb-2 btn btn-secondary btn-outline-primary">${cityStorage[i]}</li>
            `);
    $("#searchHistory").append(searchedCity);
  }
}
