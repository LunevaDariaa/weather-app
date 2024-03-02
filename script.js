"use strict";
import WeatherService from "./weatherService.js";

class App {
  constructor() {
    this.weatherService = new WeatherService();
    this.data = null;

    document
      .querySelector(".search_btn")
      .addEventListener("click", () => this.handleProgramFlow());

    this.handleProgramFlow();
  }

  async _getTemperature() {
    try {
      if (this.data) {
        console.log(this.data);
        const temperature = this.data.hourly.temperature_2m;
        const time = this.data.hourly.time;
        const rain = this.data.hourly.rain;
        console.log(rain);
        // for (let i = 0; i < temperature.length; i++) {
        //   console.log(`${time[i]} : ${temperature[i]}`);
        // }
      } else {
        console.error("Data is not available.");
      }
    } catch (err) {
      console.error(err.message);
    }
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

  async handleProgramFlow() {
    try {
      this.data = await this.weatherService.fetchWeatherData();
      await this._getTemperature();
      await this._isDay();
    } catch (error) {
      console.log(error);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new App();
});
