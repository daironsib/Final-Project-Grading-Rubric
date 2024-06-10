document.addEventListener("DOMContentLoaded", () => {
    const btnSearch = document.getElementById('btnSearch');
    const btnReset = document.getElementById('btnReset');
    const conditionInput = document.getElementById('conditionInput');
    const descriptionContainer = document.getElementById('descriptionContainer');

    let jsonData = null;
    const apiKey = '90d4918a4925ad522e77ceee8824b57e'; 

    // fetch the JSON data
    fetch('./travelRecommendationAPI.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data;
        })
        .catch(error => {
            console.error('Error fetching the JSON data:', error);
        });

    // convert input to lowercase and trim any spaces
    const performSearch = () => {
        const query = conditionInput.value.trim().toLowerCase();
        if (query && jsonData) {
            const results = searchJson(jsonData, query);
            displayResults(results);
        }
    };

    btnSearch.addEventListener('click', performSearch);

    // perform search when Enter key is pressed
    conditionInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    btnReset.addEventListener('click', () => {
        conditionInput.value = '';
        descriptionContainer.innerHTML = `
            <h1 id="title">Explore <br/> dream <br/> destination</h1>
            <p class="desc">Welcome to your ultimate travel recommendation website! Whether you're a seasoned 
                globetrotter or planning your first adventure, we're here to help you discover the world's hidden gems, 
                iconic landmarks, and unique cultural experiences. Embark on unforgettable journeys 
                where every trip becomes an extraordinary adventure. Let's make your travel dreams come true!</p>
        `;
    });

    function searchJson(json, query) {
        let results = [];
        for (let category in json) {
            json[category].forEach(item => {
                if (item.name.toLowerCase().includes(query)) {
                    results.push(item);
                }
                if (item.cities) {
                    item.cities.forEach(city => {
                        if (city.name.toLowerCase().includes(query) || city.description.toLowerCase().includes(query)) {
                            results.push(city);
                        }
                    });
                }
            });
        }
        return results;
    }

    function getTimeByTimezone(timezone) {
        const options = { timeZone: timezone, hour12: true, hour: 'numeric', minute: 'numeric' };
        return new Date().toLocaleTimeString('en-US', options);
    }

    function displayResults(results) {
        // clear previous results
        const existingContainerCards = document.getElementById('containerCards');
        if (existingContainerCards) {
            existingContainerCards.remove();
        }

        const containerCards = document.createElement('div');
        containerCards.setAttribute('id', 'containerCards'); 

        if (results.length === 0) {
            containerCards.insertAdjacentHTML('beforeend', '<p class="noResult">Sorry. No results found.</p>');
            descriptionContainer.innerHTML = `
            <h1 id="title" style="filter: blur(3px);">Explore <br/> dream <br/> destination</h1>
            <p class="desc" style="filter: blur(3px);">Welcome to your ultimate travel recommendation website! Whether you're a seasoned 
            globetrotter or planning your first adventure, we're here to help you discover the world's hidden gems, 
            iconic landmarks, and unique cultural experiences. Embark on unforgettable journeys 
            where every trip becomes an extraordinary adventure. Let's make your travel dreams come true!</p>
        `;
        } else {
            results.forEach(result => {
                const resultDiv = document.createElement('div');
                resultDiv.classList.add('result', 'card');

                // check for timezone at the city level first, then at the country level
                const timezone = result.timezone || (result.cities && result.cities[0] && result.cities[0].timezone) || 'N/A';
                const time = timezone !== 'N/A' ? getTimeByTimezone(timezone) : 'N/A';

                resultDiv.innerHTML = `
                    <img src="${result.imageUrl}" alt="${result.name}" class="cardImage">
                    <h2 class="cardTitle">${result.name}</h2>
                    <p class="cardDescription">${result.description}</p>
                    <div class="timeweather">
                    <p class="cardTime">Current time: ${time}</p>
                    <p class="cardWeather">Temperature: Loading...</p>
                    </div>
                `;

                containerCards.appendChild(resultDiv);

                // fetch and display weather
                if (result.name) {
                    const cityName = result.name.split(',')[0];
                    fetchWeather(cityName, resultDiv.querySelector('.cardWeather'));
                }
            });

            // blur content to ensure it's not distracting from the search result
            descriptionContainer.innerHTML = `
                <h1 id="title" style="filter: blur(3px);">Explore <br/> dream <br/> destination</h1>
                <p class="desc" style="filter: blur(3px);">Welcome to your ultimate travel recommendation website! Whether you're a seasoned 
                globetrotter or planning your first adventure, we're here to help you discover the world's hidden gems, 
                iconic landmarks, and unique cultural experiences. Embark on unforgettable journeys 
                where every trip becomes an extraordinary adventure. Let's make your travel dreams come true!</p>
            `;
        }

        // append containerCards to the descriptionContainer
        descriptionContainer.appendChild(containerCards);
    }

    //fetch the weather
    function fetchWeather(city, weatherElement) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod !== 200) {
                    throw new Error(data.message);
                }
                const tempCelsius = (data.main.temp - 273.15).toFixed(2);
                weatherElement.innerHTML = `Temperature: ${tempCelsius} &#8451;`;
            })
            .catch(error => {
                console.error('Error fetching weather:', error);
                weatherElement.innerHTML = `Not available`;
            });
    }
});
