"use strict";
import { DateTime } from "./luxon.js";

import WeatherService from "./weatherService.js";
document.getElementById("temperatureRange").disabled = true;

const container = document.querySelector("#hourly_container");

class App {
  #cityTime;
  constructor() {
    this.weatherService = new WeatherService();
    this.data = null;
    this.#cityTime = null;
    document
      .querySelector(".search_btn")
      .addEventListener("click", () => this.handleProgramFlow());

    this.handleProgramFlow();
  }

  async _setCityTime() {
    try {
      const cityTimeZone = this.weatherService.timezone;
      this.#cityTime = DateTime.local().setZone(`${cityTimeZone}`);
      console.log(this.#cityTime);
    } catch (error) {
      console.error("Error setting city time:", error);
      throw error;
    }
  }

  async _getTemperature() {
    try {
      if (this.data) {
        console.log(this.data);
        const temperature = this.data.hourly.temperature_2m;
        const time = this.data.hourly.time;

        const currentHour = this.#cityTime.c.hour;
        container.innerHTML = "";
        // Find the index of the current hour in the weather data
        const currentIndex = time.findIndex(
          (dateTime) => DateTime.fromISO(dateTime).hour === currentHour
        );

        for (
          let i = currentIndex;
          i < currentIndex + 8 && i < time.length;
          i++
        ) {
          const dateTime = DateTime.fromISO(time[i]);
          const hour = dateTime.hour;

          console.log(hour);
          console.log(`${temperature[i]}`);
          this._displayHourlyTemp(hour, temperature[i]);
        }
      } else {
        console.error("Data is not available.");
      }
    } catch (err) {
      console.error(err.message);
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
    temp.innerHTML = this.data.hourly.temperature_2m[0];
    city.innerHTML = this._capitalize(this.weatherService.city);
    time.innerHTML = ` ${this.#cityTime.c.hour} : ${
      this.#cityTime.c.minute
    } | `;
  }

  async handleProgramFlow() {
    try {
      this.data = await this.weatherService.fetchWeatherData();
      await this._setCityTime();

      await this._getTemperature();

      await this._displayMainInfo();
    } catch (error) {
      console.log(error);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new App();
});
