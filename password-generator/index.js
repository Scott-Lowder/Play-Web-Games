let requirementDict = {
    1: "Password requires at least 5 characters.",
    2: "Password requires at least 1 capital letter.",
    3: "Password requires at least 1 special character.",
    4: "Password requires current price of Bitcoin.",
    5: "Password requires current day of the week.",
    6: "Password requires current fahreinheit temperature in Lincoln, NH.",
    7: "Password requires a cardinal direction.",
    8: "Password requires current windspeed (mph) in Boston, MA.",
    9: "Password requires a traditional color from rainbow.",
    10: "Password requires the first number in the most recent NY Powerball Lottery.",
    11: "Password requires current number of days until August 1st.",
    12: "Password requires a one word continent.",
    13: "Password requires current fahreinheit temperature in Gainsville, FL."
}


let requirementsList = [];
let initialText = false;
let reqCounter = 1;
let textArea = document.getElementById("inputBox");
const lines = document.querySelectorAll(`#myList .line` );
let currentReq = 1;
let reqMet = {};
let bitcoinPrice = 0;
let lincolnNHtempFahrenheit = 0
let currentWindspeedBostonMA = 0;
let gainsvilleTempFahrenheit = 0;
let firstWinningNumber = 0;

//capital letters
const capitalLetters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
    "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
]

//special characters
const specialCharacters = [
    "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", 
    ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|", "}", "~"
];

//bitcoin price
fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
  .then(response => response.json())
  .then(data => {
    bitcoinPrice = data.bitcoin.usd;
  })
  .catch(error => {
    console.error('Error fetching Bitcoin price:', error)
  });

//day of week
const date = new Date();
const dayOfWeek = date.getDay();
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let currentDayofWeek = days[dayOfWeek].toLowerCase();

//Lincoln, NH fahreinheit temperature
fetch("https://api.open-meteo.com/v1/forecast?latitude=44.05&longitude=-71.67&current=temperature_2m&timezone=America/New_York")
  .then(response => response.json())
  .then(data => {
    lincolnNHtempCelsius = data.current.temperature_2m;
    lincolnNHtempFahrenheit = (lincolnNHtempCelsius * 9/5) + 32;
  })
  .catch(error => {
    console.error('Error fetching Lincoln, NH temperature:', error)
});

//cardinal direction
cardinalDirectionsList = ["north", "south", "east", "west"];

//NY powerball number
fetch('https://data.ny.gov/resource/d6yy-54nr.json')
  .then(response => response.json())
  .then(data => {
      latestDraw = data[0];
      winningNumbersArray = latestDraw.winning_numbers.split(' ').map(num => parseInt(num));
      firstWinningNumber = winningNumbersArray[0];

  })
  .catch(error => {
    console.error('Error fetching lottery data:', error)
});

//color from rainbow
rainbowColorsList = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

//windspeed Boston, MA
const latitude = 42.36;
const longitude = -71.06;
fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
  .then(response => response.json())
  .then(data => {
    currentWindspeedBostonMA = data.current_weather.windspeed * 0.621371;
  })
  .catch(error => {
    console.error('Error fetching weather data:', error);
  });

//days until August 1st
const now = new Date();

const currentYear = now.getFullYear();
const augustFirst = new Date(currentYear, 7, 1);

if (now > augustFirst) {
  augustFirst.setFullYear(currentYear + 1);
}

const timeDifference = augustFirst - now;
const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

//continents list
continentList = ["africa", "antartica", "asia", "europe", "australia"]

//Gainsville, Florida fahrenheit temperature
fetch("https://api.open-meteo.com/v1/forecast?latitude=29.6516&longitude=-82.3248&current=temperature_2m&timezone=America/New_York")
  .then(response => response.json())
  .then(data => {
    gainsvilleTempCelsius = data.current.temperature_2m;
    gainsvilleTempFahrenheit = (gainsvilleTempCelsius * 9/5) + 32;
  })
  .catch(error => {
    console.error('Error fetching Gainesville, FL temperature:', error);
  });

function createLineObjects(){
    for (var line of lines){
        const lineObject = {}
        lineObject.status = "incomplete";
        lineObject.color = "#f9f9f9"
        lineObject.content = requirementDict[reqCounter];
        lineObject.element = line;
        lineObject.id = reqCounter;
        requirementsList.push(lineObject);
        reqCounter += 1;
    }
}

function previousRequirementsMet(){
    for (var line of requirementsList){
        if (currentReq >= line.id){
            if (line.status == "wrong"){
                return false
            }
        }
    }
    return true;
}

function updateLineStatus(lineId, condition, line, completionCriteria, reqMetFlag) {
    if (currentReq >= completionCriteria && condition && line.id === lineId) {
        line.status = "complete";
        line.color = "#CAE7B9";
        if (!reqMet[line.id] && previousRequirementsMet()) {
            currentReq += 1;
            reqMet[line.id] = true;
        }
    } else if (currentReq === completionCriteria && line.id === lineId) {
        line.status = "incomplete";
        line.color = "#F3DE8A";
    } else if (currentReq >= completionCriteria && line.id === lineId) {
        line.status = "wrong";
        line.color = "#EB9486";
    }
}

function requirementChecker(line) {
    // Line 1 - Text length
    updateLineStatus(1, textArea.value.length >= 5 && line.id === 1, line, 1, reqMet);

    // Line 2 - Capital letters
    updateLineStatus(2, capitalLetters.some(char => textArea.value.includes(char)), line, 2, reqMet);

    // Line 3 - Special characters
    updateLineStatus(3, specialCharacters.some(char => textArea.value.includes(char)), line, 3, reqMet);

    // Line 4 - Numbers within range of bitcoinPrice
    if (line.id === 4) {
        const numbersInText = textArea.value.match(/\d+/g) || [];
        const isWithinRange = numbersInText.some(num => Math.abs(parseFloat(num) - bitcoinPrice) <= 1000);
        updateLineStatus(4, isWithinRange, line, 4, reqMet);
    }

    // Line 5 - Current day of the week
    updateLineStatus(5, textArea.value.toLowerCase().includes(currentDayofWeek), line, 5, reqMet);

    // Line 6 - Numbers within range of lincolnNHtempFahrenheit
    if (line.id === 6) {
        const numbersInText = textArea.value.match(/\d+/g) || [];
        const isWithinRange = numbersInText.some(num => Math.abs(parseFloat(num) - lincolnNHtempFahrenheit) <= 10);
        updateLineStatus(6, isWithinRange, line, 6, reqMet);
    }

    // Line 7 - Cardinal directions
    updateLineStatus(7, cardinalDirectionsList.some(direction => textArea.value.toLowerCase().includes(direction)), line, 7, reqMet);

    // Line 8 - Numbers within range of currentWindspeedBostonMA
    if (line.id === 8) {
        const numbersInText = textArea.value.match(/\d+/g) || [];
        const isWithinRange = numbersInText.some(num => Math.abs(parseFloat(num) - currentWindspeedBostonMA) <= 5);
        updateLineStatus(8, isWithinRange, line, 8, reqMet);
    }

    // Line 9 - Rainbow colors
    updateLineStatus(9, rainbowColorsList.some(color => textArea.value.toLowerCase().includes(color)), line, 9, reqMet);

    // Line 10 - First winning number
    updateLineStatus(10, textArea.value.includes(firstWinningNumber), line, 10, reqMet);

    // Line 11 - Days difference
    updateLineStatus(11, textArea.value.includes(daysDifference), line, 11, reqMet);

    // Line 12 - Continents
    updateLineStatus(12, continentList.some(continent => textArea.value.toLowerCase().includes(continent)), line, 12, reqMet);

    // Line 13 - Numbers within range of gainsvilleTempFahrenheit
    if (line.id === 13) {
        const numbersInText = textArea.value.match(/\d+/g) || [];
        const isWithinRange = numbersInText.some(num => Math.abs(parseFloat(num) - gainsvilleTempFahrenheit) <= 10);
        updateLineStatus(13, isWithinRange, line, 13, reqMet);
    }
}

setInterval(update, 50);

createLineObjects();

function update(){
    if (textArea.value.length > 23 && initialText == false){
        initialText = true;
        textArea.style.height = "80px";
    }
    if (currentReq >= 14){
        document.getElementById("passwordLabel").textContent = "Password Requirements Met!"
    }
    for (var line of requirementsList){
        if (currentReq >= line.id){
        line.element.textContent = line.content;
        }
        requirementChecker(line);
        line.element.style.backgroundColor = line.color
    }
}