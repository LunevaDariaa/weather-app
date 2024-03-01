"use strict";

class App {
  constructor() {
    this.city = "Toronto";

    document
      .querySelector(".search_btn")
      .addEventListener("click", this.getData.bind(this));

    this.getData();
  }

  async getLocationData(city) {
    try {
      const locationRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`
      );
      const locationData = await locationRes.json();

      if (locationData.results && locationData.results.length > 0) {
        const { latitude: locationlng, longitude: locationLon } =
          locationData.results[0];
        return { locationlng, locationLon };
      } else {
        throw new Error("Location data not found");
      }
    } catch (error) {
      console.error("Error fetching location data:", error.message);
      throw error;
    }
  }

  async getData() {
    const userCity = document.querySelector(".city_search").value;

    if (userCity) {
      this.city = userCity;
    }

    try {
      const { locationlng, locationLon } = await this.getLocationData(
        this.city
      );

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${locationlng}&longitude=${locationLon}&hourly=temperature_2m`
      );
      const data = await response.json();
      console.log(data);

      const temperature = data.hourly.temperature_2m;
      console.log(temperature);

      const time = data.hourly.time;
      console.log(time);

      for (let i = 0; i < temperature.length; i++) {
        console.log(`${time[i]} : ${temperature[i]}`);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const appInstance = new App();
});
