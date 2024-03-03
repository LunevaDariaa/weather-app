"use strict";
import { DateTime } from "./luxon.js";

import WeatherService from "./weatherService.js";
document.getElementById("temperatureRange").disabled = true;

const container = document.querySelector("#hourly_container");

class App {
  #cityTime;
  #curTemp;
  #curDate;
  #temperatureArr;
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

  async _minAndMaxTemp() {
    try {
      let days = {};
      const daysArr = this.data.hourly.time;
      daysArr.forEach((hour) => {
        const dayOfMonth = hour.split("-")[2].split("T")[0];

        if (!days[dayOfMonth]) {
          days[dayOfMonth] = [];
        }

        const index = days[dayOfMonth].length;
        const temp = Math.floor(this.#temperatureArr[index]);
        days[dayOfMonth].push(temp);
      });

      // Calculate min and max for each day
      const minMaxPerDay = {};
      Object.keys(days).forEach((day) => {
        const minTemp = Math.min(...days[day]);
        const maxTemp = Math.max(...days[day]);
        minMaxPerDay[day] = { min: minTemp, max: maxTemp };
      });

      console.log(minMaxPerDay);
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
        console.log(this.#temperatureArr);
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
    // this._clearData(temp, city, time)
    temp.innerHTML = this.#curTemp;
    city.innerHTML = this._capitalize(this.weatherService.city);
    time.innerHTML = ` ${this.#cityTime.c.hour} : ${
      this.#cityTime.c.minute
    } | `;
  }

  async handleProgramFlow() {
    try {
      this.data = await this.weatherService.fetchWeatherData();
      await this._setCityTime();
      await this._displayTemperature();
      await this._displayMainInfo();
      await this._minAndMaxTemp();
    } catch (error) {
      console.log(error);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new App();
});
