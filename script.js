"use strict";
import { DateTime } from "./luxon.js";

import WeatherService from "./weatherService.js";
// document.getElementById("temperatureRange").disabled = true;
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Th", "Fri", "Sat"];
const container = document.querySelector("#hourly_container");
const weekContainer = document.querySelector(".week_weather_container");
class App {
  #cityTime;
  #curTemp;
  #curDate;
  #temperatureArr;
  #minMaxPerDay = {};
  #dayOfWeekName;
  constructor() {
    this.weatherService = new WeatherService();
    this.data = null;
    this.#cityTime = null;
    this.#curTemp = null;
    this.#curDate = null;

    document
      .querySelector(".search_btn")
      .addEventListener("click", () => this.handleProgramFlow());

    this.handleProgramFlow();
  }

  async _getWeekday() {
    const now = new Date();
    const dayOfWeekNumber = now.getDay();
    this.#dayOfWeekName = dayNames[dayOfWeekNumber];

    console.log("Day of the week (name):", this.#dayOfWeekName);
  }
  async _minAndMaxTemp() {
    try {
      let days = {};
      const daysArr = this.data.hourly.time;
      daysArr.forEach((hour, i) => {
        const dayOfMonth = hour.split("-")[2].split("T")[0];

        if (!days[dayOfMonth]) {
          days[dayOfMonth] = [];
        }

        const temp = Math.floor(this.#temperatureArr[i]);
        days[dayOfMonth].push(temp);
      });

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
  async _setCityTime() {
    try {
      const cityTimeZone = this.weatherService.timezone;
      this.#cityTime = DateTime.local().setZone(`${cityTimeZone}`);
      this.#curDate = this.#cityTime.c.day.toString().padStart(2, "0");

      console.log(this.#cityTime);
    } catch (error) {
      console.error("Error setting city time:", error);
      throw error;
    }
  }

  async _fetchTemperatureData() {
    try {
      if (this.data) {
        console.log(this.data);
        this.#temperatureArr = this.data.hourly.temperature_2m;
        const time = this.data.hourly.time;
        const currentHour = this.#cityTime.c.hour;

        // Find the index of the current hour in the weather data
        const currentIndex = time.findIndex(
          (dateTime) => DateTime.fromISO(dateTime).hour === currentHour
        );
        this.#curTemp = this.#temperatureArr[currentIndex];
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

  async _displayTemperature() {
    const { temperature, time, currentIndex } =
      await this._fetchTemperatureData();

    if (temperature && time && currentIndex !== undefined) {
      container.innerHTML = "";

      for (let i = currentIndex; i < currentIndex + 8 && i < time.length; i++) {
        const dateTime = DateTime.fromISO(time[i]);
        const hour = dateTime.hour;
        this._displayHourlyTemp(hour, Math.floor(temperature[i]));
      }
    }
  }

  _weatherIcons() {
    const houlyWeatherCodes = this.data.hourly.weather_code;
    const weeklyWeatherCodes = this.data.daily.weather_code;
    console.log(houlyWeatherCodes, weeklyWeatherCodes);

    houlyWeatherCodes.forEach((code, i) => {
      const data = this._getWeatherDescription(code);
      console.log(data);
    });
    weeklyWeatherCodes.forEach((code) => {
      const data = this._getWeatherDescription(code);
      console.log(data);
    });
  }

  _getWeatherDescription(weatherCode) {
    switch (weatherCode) {
      case 0:
        return { text: "Clear sky", src: "d000.png" };
      case 1:
        return { text: "Mainly clear sky", src: "d100.png" };
      case 2:
        return { text: "Partly cloudy sky", src: "d200.png" };
      case 3:
        return { text: "Overcast sky", src: "d400.png" };
      case 45:
      case 48:
        return { text: "Fog ", src: "d600.png" };
      case 51:
        return {
          text: "Light Drizzle",
          src: "d210.png",
        };
      case 53:
        return {
          text: " Moderate Drizzle",
          src: "d310.png",
        };
      case 55:
        return {
          text: "Dense Drizzle",
          src: "d410.png",
        };
      case 56:
        return {
          text: "Freezing Drizzle",
          src: "d211.png",
        };
      case 57:
        return {
          text: "Dense Freezing Drizzle",
          src: "d411.png",
        };
      case 61:
        return {
          text: "Slight Rain",
          src: "d220.png",
        };
      case 63:
        return {
          text: "Moderate Rain",
          src: "d320.png",
        };
      case 65:
        return {
          text: "Heavy Rain",
          src: "d420.png",
        };
      case 66:
        return {
          text: "Light Freezing Rain ",
          src: "d221.png",
        };
      case 67:
        return {
          text: "heavy Freezing Rain",
          src: "d421.png",
        };
      case 71:
        return {
          text: "Slight Snow fall",
          src: "d212.png",
        };
      case 73:
        return {
          text: "Moderate Snow fall",
          src: "d312.png",
        };
      case 75:
        return {
          text: " Heavy Snow fall",
          src: "d412.png",
        };
      case 77:
        return { text: "Snow grains", src: "d422.png" };
      case 80:
        return {
          text: " Slight Rain showers",
          src: "d210.png",
        };
      case 81:
        return {
          text: " Moderate Rain showers",
          src: "d310.png",
        };
      case 82:
        return {
          text: "Heavy Rain showers",
          src: "d410.png",
        };
      case 85:
        return { text: "Slight Snow showers", src: "d222.png" };
      case 86:
        return { text: "Heavy Snow showers", src: "d322.png" };
      case 95:
        return { text: "Slight Thunderstorm", src: "d432.png" };
      case 96:
        return {
          text: "Thunderstorm with slight hail",
          src: "d240.png",
        };
      case 99:
        return {
          text: "Thunderstorm with heavy hail",
          src: "d340.png",
        };
      default:
        return { text: "Unknown weather code", src: "d000.png" };
    }
  }

  _displayHourlyTemp(hour, temp) {
    const text = `
    <div class="hourly_col">
      <div class="hourly_hour">${hour}</div>
      <div class="hourly_weather_symbol">&#127782;</div>
      <div class="hourly_temperature">
        <div class="temp">${temp}</div>
        <div class="celsius">°C</div>
      </div>
    </div>
`;
    container.insertAdjacentHTML("beforeend", text);
  }

  _displayWeekTemp() {
    Object.keys(this.#minMaxPerDay).forEach((day) => {
      const temp = this.#minMaxPerDay[day];
      this._insertWeekTemp(temp.min, temp.max);
    });
  }

  _insertWeekTemp(min, max) {
    const text = `  <div id="weekly_row">
<div class="weekly_day">Today</div>
<div class="weekly_weather_symbol"><img src="symbols/d000.png" alt="#"></div>
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
    id="temperatureRange"
  />
</div>
<div class="weekly_temperature_max">
  <div class="weekly_max_temp">${max}</div>
  <div class="weekly_celsius">°C</div>
</div>
</div>`;

    weekContainer.insertAdjacentHTML("beforeend", text);
  }
  async _isDay() {
    try {
      const dayInfo = this.data.hourly.is_day;
      console.log(dayInfo);
      if (dayInfo[0] === 1) {
        console.log("day");
      } else {
        console.log("night");
      }
    } catch (err) {
      console.error(err);
    }
  }

  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  _clearData(temp, city, time) {
    temp.innerHTML = "";
    city.innerHTML = "";
    time.innerHTML = "";
  }
  async _displayMainInfo() {
    const temp = document.querySelector(".main_info_temp");
    const city = document.querySelector(".main_info_location");
    const time = document.querySelector(".main_info_time");
    const min = document.querySelector(".main_info_lowest_temp");
    const max = document.querySelector(".main_info_highest_temp");
    // this._clearData(temp, city, time)
    temp.innerHTML = this.#curTemp;
    city.innerHTML = this._capitalize(this.weatherService.city);
    time.innerHTML = ` ${this.#cityTime.c.hour} : ${
      this.#cityTime.c.minute
    } | `;
    min.innerHTML = ` ${this.#minMaxPerDay[this.#curDate].min}° `;
    max.innerHTML = ` ${this.#minMaxPerDay[this.#curDate].max}° `;
  }

  async handleProgramFlow() {
    try {
      this.data = await this.weatherService.fetchWeatherData();
      await this._setCityTime();
      await this._displayTemperature();
      await this._minAndMaxTemp();
      await this._displayMainInfo();
      await this._getWeekday();
      await this._displayWeekTemp();
      await this._weatherIcons();
    } catch (error) {
      console.log(error);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new App();
});
