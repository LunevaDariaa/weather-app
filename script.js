"use strict";
import { DateTime } from "./luxon.js";

import WeatherService from "./weatherService.js";
const container = document.querySelector("#hourly_container");
const weekContainer = document.querySelector(".week_weather_container");

class App {
  // Private class properties

  #cityTime;
  #curTemp;
  #curTime;
  #curDate;
  #curIcon;
  #daysAfter;
  #temperatureArr;
  #minMaxPerDay = {};
  #isDay = [];
  #hourWeatherCode = [];

  constructor() {
    // Initialize WeatherService and set initial state

    this.weatherService = new WeatherService();
    this.data = null;
    this.#cityTime = null;
    this.#curTemp = null;
    this.#curDate = null;
    this.#curIcon = "d220.png";
    this.#curTime = null;
    this.#daysAfter = [];

    document
      .querySelector(".search_btn")
      .addEventListener("click", () => this.handleProgramFlow());

    this.handleProgramFlow();
    const self = this;

    document.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        self.handleProgramFlow();
      }
    });
  }
  // Get weekday names for the next 7 days

  async _getWeekday() {
    if (this.#daysAfter) {
      this.#daysAfter = [];
    }
    for (let i = 0; i < 7; i++) {
      if (i === 6) {
        this.#daysAfter.unshift("Today");
      }
      const plusDay = this.#cityTime.plus({ days: i + 1 });
      const toStr = plusDay.toLocaleString({ weekday: "short" });
      this.#daysAfter.push(toStr);
    }

    console.log(this.#daysAfter);
  }

  // Calculate min and max temperatures for each day starting from 00:00
  async _minAndMaxTemp() {
    try {
      // Reset #minMaxPerDay to clear previous city data
      this.#minMaxPerDay = {};

      let days = {};
      const daysArr = this.data.hourly.time;
      console.log(daysArr);

      const currentDateTime = DateTime.local().setZone(
        this.weatherService.timezone
      );

      const startIndex = daysArr.findIndex((day) => {
        const dayDateTime = DateTime.fromISO(day);
        return (
          dayDateTime.day === currentDateTime.day && dayDateTime.hour === 0
        );
      });
      console.log(startIndex);
      // Calculate min and max for each day starting from 00:00
      for (let i = startIndex; i < daysArr.length; i++) {
        const dayOfMonth = DateTime.fromISO(daysArr[i]).day.toString();
        console.log(dayOfMonth);

        if (!days[dayOfMonth]) {
          days[dayOfMonth] = [];
        }

        const temp = Math.floor(this.#temperatureArr[i]);
        days[dayOfMonth].push(temp);
      }
      console.log(this.#temperatureArr);
      console.log(days);
      // Calculate min and max for each day

      Object.keys(days).forEach((day) => {
        const minTemp = Math.min(...days[day]);
        const maxTemp = Math.max(...days[day]);
        this.#minMaxPerDay[day] = { min: minTemp, max: maxTemp };
      });

      console.log(this.#minMaxPerDay);
      console.log(days);
    } catch (err) {
      throw new Error(err);
    }
  }

  // Calculate min and max temperature range for the week
  async _calculateMinMaxRange() {
    let min = Infinity;
    let max = -10000;
    for (const { min: currentMin, max: currentMax } of Object.values(
      this.#minMaxPerDay
    )) {
      min = Math.min(min, currentMin);
      max = Math.max(max, currentMax);
    }
    console.log(min, max);
    return { min, max }; // weekly min and max
  }

  // Display temperature range gradient
  async _displayRange() {
    const { min: minWeekly, max: maxWeekly } =
      await this._calculateMinMaxRange();

    const tempRange = document.querySelectorAll(".temperatureRange");

    let minPercentage = [];
    let maxPercentage = [];

    //Calculate min and max percentage for temp range for each day
    for (const value of Object.values(this.#minMaxPerDay)) {
      console.log(value);
      // Calculate the percentage of the highlighted range
      const startPercentage =
        ((value.min - minWeekly) / (maxWeekly - minWeekly)) * 100;
      const endPercentage =
        ((value.max - minWeekly) / (maxWeekly - minWeekly)) * 100;
      minPercentage.push(startPercentage);
      maxPercentage.push(endPercentage);
    }

    for (let i = 0; i < tempRange.length; i++) {
      tempRange[i].min = minWeekly;
      tempRange[i].max = maxWeekly;
      // // Set the background gradient dynamically
      const gradient = `linear-gradient(to right, rgb(214, 207, 207) 0%, rgb(214, 207, 207) ${minPercentage[i]}%, rgb(57, 182, 207) ${minPercentage[i]}%, rgb(231, 182, 83) ${maxPercentage[i]}%, rgb(214, 207, 207) ${maxPercentage[i]}%, rgb(214, 207, 207) 100%`;

      // // Apply the dynamic gradient to the slider track
      tempRange[i].style.background = gradient;
    }
  }
  // Set city time based on the timezone
  async _setCityTime() {
    try {
      const cityTimeZone = this.weatherService.timezone;
      this.#cityTime = DateTime.local().setZone(`${cityTimeZone}`);
      this.#curDate = this.#cityTime.c.day.toString();
      this.#curTime = this.#cityTime.c.hour;
      console.log(this.#cityTime);
    } catch (error) {
      console.error("Error setting city time:", error);
      throw error;
    }
  }

  // Fetch temperature data for the next 8 hours
  async _fetchTemperatureData() {
    try {
      if (this.data) {
        console.log(this.data);
        this.#temperatureArr = this.data.hourly.temperature_2m;
        const time = this.data.hourly.time;
        const currentHour = this.#cityTime.c.hour;

        // Find the index of the current hour in the weather data
        let currentIndex = time.findIndex(
          (dateTime) => DateTime.fromISO(dateTime).hour === currentHour
        );
        if (currentIndex < 24) {
          currentIndex = currentIndex + 24;
        }
        this.#curTemp = this.#temperatureArr[currentIndex];
        console.log(currentIndex);
        console.log(this.#temperatureArr);
        // console.log(this.#curTemp);
        return { temperature: this.#temperatureArr, time, currentIndex };
      } else {
        console.error("Data is not available.");
        return null;
      }
    } catch (err) {
      console.error(err.message);
      return null;
    }
  }

  // Display hourly temperature data
  async _displayTemperature() {
    const { temperature, time, currentIndex } =
      await this._fetchTemperatureData();

    if (temperature && time && currentIndex !== undefined) {
      container.innerHTML = "";
      this.#hourWeatherCode = []; // Reset the array

      let index = 0;

      for (let i = currentIndex; i < currentIndex + 8 && i < time.length; i++) {
        const dateTime = DateTime.fromISO(time[i]);
        const hour = dateTime.hour;

        this.#hourWeatherCode.push(this.data.hourly.weather_code[i]);
        this._displayHourlyTemp(hour, Math.floor(temperature[i]), index);
        index++;
      }
    }
    return currentIndex;
  }

  // Display weather icons for hourly and weekly forecasts
  async _weatherIcons() {
    const weeklyWeatherCodes = this.data.daily.weather_code;
    console.log(weeklyWeatherCodes);
    const weeklyImgs = document.querySelectorAll(".weekly_weather_symbol");
    const hourlyImgs = document.querySelectorAll(".hourly_weather_symbol");
    const nowPrediction = document.querySelector(".weather_text_prediction");
    return new Promise((resolve) => {
      for (let [i, code] of this.#hourWeatherCode.entries()) {
        const data = this._getWeatherDescription(code, i);
        const { src } = data;
        //Update current weather description
        if (i === 0) {
          const firstWeatherCode = this.#hourWeatherCode[0];
          const { src, text } = this._getWeatherDescription(
            firstWeatherCode,
            i
          );
          this.#curIcon = src;
          nowPrediction.textContent = text;
        }
        const hourlyImg = hourlyImgs[i];
        hourlyImg.src = `symbols/${src}`;
      }

      for (let i = 0; i < Math.min(7, weeklyWeatherCodes.length); i++) {
        const code = weeklyWeatherCodes[i];
        const data = this._getWeatherDescription(code, i);
        const { src } = data;
        const alwaysDay = "d" + src.slice(1);
        const weeklyImg = weeklyImgs[i];
        weeklyImg.src = `symbols/${alwaysDay}`;
      }

      resolve(); // Resolve the promise once the content is updated
    });
  }

  // Display hourly temperature data in the UI
  _displayHourlyTemp(hour, temp, i) {
    const text = `
    <div class="hourly_col">
      <div class="hourly_hour">${hour}</div>
      <img class="hourly_weather_symbol" data-type='${i}'  src="symbols/d000.png" alt="#">
      <div class="hourly_temperature">
        <div class="temp">${temp}</div>
        <div class="celsius">°C</div>
      </div>
    </div>
`;
    container.insertAdjacentHTML("beforeend", text);
  }

  // Display weekly temperature data in the UI
  async _displayWeekTemp() {
    weekContainer.innerHTML = "";
    return new Promise((resolve) => {
      weekContainer.insertAdjacentHTML(
        "beforeend",
        ` <div class="days_text_prediction">7-Day Forecast</div>
      <hr class="custom-line" />`
      );
      Object.keys(this.#minMaxPerDay).forEach((day, i) => {
        if (i <= 7) {
          console.log(day);
          console.log(this.#minMaxPerDay);
          const temp = this.#minMaxPerDay[day];
          console.log(temp);
          this._insertWeekTemp(temp.min, temp.max, i);
        }
      });
      const firstHour = document.querySelector(".hourly_col");
      console.log(firstHour);
      firstHour.insertAdjacentHTML("afterbegin", `<div class="now">NOW</div>`);

      resolve(); // Resolve the promise once the content is inserted
    });
  }

  // Insert weekly temperature data into the UI
  _insertWeekTemp(min, max, i) {
    const text = `  <div id="weekly_row">
<div class="weekly_day">${this.#daysAfter[i]}</div>
<img class="weekly_weather_symbol" data-type='${i}' src="symbols/d000.png" alt="#">
<div class="weekly_temperature_min">
  <div class="weekly_min_temp">${min}</div>
  <div class="weekly_celsius">°C</div>
</div>
<div class="temperature-slider">
  <input
    type="range"
    min="10"
    max="33"
    step="1"
    class="temperatureRange"
  />
</div>
<div class="weekly_temperature_max">
  <div class="weekly_max_temp">${max}</div>
  <div class="weekly_celsius">°C</div>
</div>
</div>`;

    weekContainer.insertAdjacentHTML("beforeend", text);
  }

  // Determine whether it is day or night based on sunrise and sunset times
  async _isDay() {
    try {
      const { currentIndex } = await this._fetchTemperatureData();
      const isDayArray = this.data.hourly.is_day;

      for (let i = currentIndex; i < currentIndex + 8; i++) {
        isDayArray[i] === 1 ? this.#isDay.push("d") : this.#isDay.push("n");
      }
      console.log(this.#isDay);
    } catch (err) {
      console.error(err);
    }
  }

  // Capitalize the first letter of a string
  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Clear main information data
  _clearData(temp, city, time) {
    temp.innerHTML = "";
    city.innerHTML = "";
    time.innerHTML = "";
  }

  async _clearInput() {
    try {
      const inputField = document.querySelector(".city_search");
      if (inputField) inputField.value = "";
    } catch (err) {
      throw new Error(err);
    }
  }

  // Display main information (current temperature, location, time, min, max)
  async _displayMainInfo() {
    console.log(this.#minMaxPerDay);
    console.log(this.#curDate);
    const temp = document.querySelector(".main_info_temp");
    const city = document.querySelector(".main_info_location");
    const time = document.querySelector(".main_info_time");
    const min = document.querySelector(".main_info_lowest_temp");
    const max = document.querySelector(".main_info_highest_temp");

    const icon = document.querySelector(".main_info_cur_weather");
    // this._clearData(temp, city, time)
    temp.innerHTML = this.#curTemp;
    city.innerHTML = this._capitalize(this.weatherService.city);
    time.innerHTML = ` ${this.#cityTime.c.hour} : ${
      this.#cityTime.c.minute
    } | `;
    min.innerHTML = ` ${this.#minMaxPerDay[this.#curDate].min}° `;
    max.innerHTML = ` ${this.#minMaxPerDay[this.#curDate].max}° `;
    console.log(this.#curIcon);
    icon.src = `symbols/${this.#curIcon}`;
  }

  // Main function to handle the program flow
  async handleProgramFlow() {
    try {
      this.data = await this.weatherService.fetchWeatherData();
      await this._setCityTime();
      await this._getWeekday();
      await this._isDay();
      await this._displayTemperature();
      await this._minAndMaxTemp();
      await this._displayWeekTemp();
      await this._weatherIcons();
      await this._displayRange();
      await this._displayMainInfo();
      await this._clearInput();
    } catch (error) {
      console.log(error);
    }
  }

  // Get weather description based on weather code
  _getWeatherDescription(weatherCode, i) {
    switch (weatherCode) {
      case 0:
        return { text: "Clear sky", src: `${this.#isDay[i]}000.png` };
      case 1:
        return { text: "Mainly clear sky", src: `${this.#isDay[i]}100.png` };
      case 2:
        return { text: "Partly cloudy sky", src: `${this.#isDay[i]}200.png` };
      case 3:
        return { text: "Overcast sky", src: `${this.#isDay[i]}400.png` };
      case 45:
      case 48:
        return { text: "Fog", src: `${this.#isDay[i]}600.png` };
      case 51:
        return { text: "Light Drizzle", src: `${this.#isDay[i]}210.png` };
      case 53:
        return { text: "Moderate Drizzle", src: `${this.#isDay[i]}310.png` };
      case 55:
        return { text: "Dense Drizzle", src: `${this.#isDay[i]}410.png` };
      case 56:
        return { text: "Freezing Drizzle", src: `${this.#isDay[i]}211.png` };
      case 57:
        return {
          text: "Dense Freezing Drizzle",
          src: `${this.#isDay[i]}411.png`,
        };
      case 61:
        return { text: "Slight Rain", src: `${this.#isDay[i]}220.png` };
      case 63:
        return { text: "Moderate Rain", src: `${this.#isDay[i]}320.png` };
      case 65:
        return { text: "Heavy Rain", src: `${this.#isDay[i]}420.png` };
      case 66:
        return { text: "Light Freezing Rain", src: `${this.#isDay[i]}221.png` };
      case 67:
        return { text: "Heavy Freezing Rain", src: `${this.#isDay[i]}421.png` };
      case 71:
        return { text: "Slight Snow fall", src: `${this.#isDay[i]}212.png` };
      case 73:
        return { text: "Moderate Snow fall", src: `${this.#isDay[i]}312.png` };
      case 75:
        return { text: "Heavy Snow fall", src: `${this.#isDay[i]}412.png` };
      case 77:
        return { text: "Snow grains", src: `${this.#isDay[i]}422.png` };
      case 80:
        return { text: "Slight Rain showers", src: `${this.#isDay[i]}210.png` };
      case 81:
        return {
          text: "Moderate Rain showers",
          src: `${this.#isDay[i]}310.png`,
        };
      case 82:
        return { text: "Heavy Rain showers", src: `${this.#isDay[i]}410.png` };
      case 85:
        return { text: "Slight Snow showers", src: `${this.#isDay[i]}222.png` };
      case 86:
        return { text: "Heavy Snow showers", src: `${this.#isDay[i]}322.png` };
      case 95:
        return { text: "Slight Thunderstorm", src: `${this.#isDay[i]}240.png` };
      case 96:
        return {
          text: "Thunderstorm with slight hail",
          src: `${this.#isDay[i]}340.png`,
        };
      case 99:
        return {
          text: "Thunderstorm with heavy hail",
          src: `${this.#isDay[i]}440.png`,
        };
      default:
        return {
          text: "Unknown weather code",
          src: `${this.#isDay[i]}000.png`,
        };
    }
  }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  new App();
});
