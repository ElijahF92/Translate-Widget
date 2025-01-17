// Declare variables to store latitude and longitude
let latitude;
let longitude;

let citiesData = null;

// Function to load and parse CSV data
const loadCitiesData = async () => {
    try {
        const response = await fetch('worldcities.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => {
            // Split by "," but handle the quoted values
            const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            return matches ? matches.map(val => val.replace(/"/g, '')) : [];
        });
        
        // Skip header row and create array of city objects
        citiesData = rows.slice(1).map(row => ({
            city: `${row[0]}, ${row[4]}`, // City name + Country
            latitude: parseFloat(row[2]),
            longitude: parseFloat(row[3])
        }));
        
        // Populate the select dropdown
        const select = document.getElementById('location');
        select.innerHTML = citiesData
            .map(city => `<option value="${city.city}">${city.city}</option>`)
            .join('');
    } catch (error) {
        console.error('Error loading cities:', error);
    }
};

// Function to fetch local weather data using latitude and longitude
const getLocalWeather = async (latitude, longitude) => {
    try {
        // Fetch weather data from API using latitude and longitude
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=precipitation_probability_max&timezone=auto`);
        if (response.ok) {
            // If response is successful, parse the data and process it
            const data = await response.json();
            processWeatherData(data);
        } else {
            // If response is not successful, log the error
            console.error('Error:', response.status);
        }
    } catch (error) {
        // If an error occurs during the fetch, log the error
        console.error('Error:', error);
    }
};

// Function to process weather data
const processWeatherData = (data) => {
    // Extract necessary data from the response
    const latitude = data.latitude;
    const longitude = data.longitude;
    const currentTemperature = data.current.temperature_2m;
    const currentWeatherCode = data.current.weather_code;
    const todayPrecipitationProbability = data.daily.precipitation_probability_max[0];

    // Log the extracted data
    console.log('Latitude:', latitude);
    console.log('Longitude:', longitude);
    console.log('Current Temperature:', currentTemperature);
    console.log('Current Weather Code:', currentWeatherCode);
    console.log('Today Precipitation Probability:', todayPrecipitationProbability);
    
    // Update the UI with the weather data
    document.getElementById("card").style.display = "block";
    document.getElementById('current-temperature').innerHTML = String(currentTemperature) + "&deg;C";
    getWeatherIcon(currentWeatherCode);
    document.getElementById('chance-of-rain').innerHTML = String(todayPrecipitationProbability) + "%";
};

// Function to get weather icon based on weather code
const getWeatherIcon = (weatherCode) => {
    // Get the current time
    const currentTime = new Date().getHours();
    // Check if it is day time
    const isDayTime = currentTime >= 6 && currentTime < 18;

    // Fetch the weather icons data
    fetch('./icons.json')
        .then(response => response.json())
        .then(iconsData => {
            // Get the weather icon based on weather code and day/night time
            const weatherIcon = iconsData[weatherCode]?.[isDayTime ? 'day' : 'night']?.image;
            if (weatherIcon) {
                // If weather icon is found, update the UI with the icon
                console.log('Weather Icon:', weatherIcon);
                document.getElementById('weather-icon').src = weatherIcon;
            } else {
                // If weather icon is not found, log the error
                console.error('Weather Icon not found for weather code:', weatherCode);
            }
        })
        .catch(error => {
            // If an error occurs during the fetch, log the error
            console.error('Error:', error);
        });
};

// Event listener to get coordinates from IP when the DOM is loaded
window.addEventListener('DOMContentLoaded', async () => {
    await loadCitiesData();
    
    // Add event listener for search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            document.getElementById('suggestions').style.display = 'none';
        }
    });

    // Get weather for a default city
    if (citiesData && citiesData.length > 0) {
        const defaultCity = citiesData[0];
        selectCity(defaultCity.city, defaultCity.latitude, defaultCity.longitude);
    }
});

// Function to change the location and fetch weather data for the new location
const changeLocation = () => {
    let selectedCity = document.getElementById('location').value;
    const cityData = citiesData.find(city => city.city === selectedCity);
    
    if (cityData) {
        getLocalWeather(cityData.latitude, cityData.longitude);
    }
};

// Add this function to filter cities as user types
const filterCities = (searchText) => {
    const select = document.getElementById('location');
    const filteredCities = citiesData.filter(city => 
        city.city.toLowerCase().includes(searchText.toLowerCase())
    );
    
    select.innerHTML = filteredCities
        .map(city => `<option value="${city.city}">${city.city}</option>`)
        .join('');
};

// Replace filterCities and changeLocation with these new functions
const handleSearch = (searchText) => {
    const suggestionsDiv = document.getElementById('suggestions');
    
    if (!searchText) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const filteredCities = citiesData
        .filter(city => 
            city.city.toLowerCase().includes(searchText.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions
    
    if (filteredCities.length > 0) {
        suggestionsDiv.innerHTML = filteredCities
            .map(city => `
                <div class="suggestion-item" 
                     onclick="selectCity('${city.city}', ${city.latitude}, ${city.longitude})">
                    ${city.city}
                </div>
            `)
            .join('');
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
};

const selectCity = (cityName, lat, lon) => {
    document.getElementById('searchInput').value = cityName;
    document.getElementById('suggestions').style.display = 'none';
    getLocalWeather(lat, lon);
};

