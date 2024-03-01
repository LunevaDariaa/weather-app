"use strict";
import WeatherService from "/.weatherService";

class App {
  constructor() {
    this.weatherService = new WeatherService();
    console.log("App constructor");

    document
      .querySelector(".search_btn")
      .addEventListener("click", this.handleProgramFlow.bind(this));

    this.handleProgramFlow();
  }

  async _getTemperature() {
    try {
      console.log("_getTemperature");

      const data = await this.weatherService.fetchWeatherData();
      console.log(data);
      const temperature = data.hourly.temperature_2m;
      const time = data.hourly.time;
      const rain = data.hourly.rain;
      console.log(rain);
      //   for (let i = 0; i < temperature.length; i++) {
      //     console.log(`${time[i]} : ${temperature[i]}`);
      //   }
    } catch (err) {
      console.error(err.message);
    }
  }
  async handleProgramFlow() {
    try {
      console.log("handleProgramFlow");

      const data = await this.weatherService.fetchWeatherData();
      await this._getTemperature(data);
    } catch (error) {
      // Handle errors here if needed
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new App();
});
