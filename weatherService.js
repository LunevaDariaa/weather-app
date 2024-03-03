"use strict";

class WeatherService {
  constructor() {
    this.defaultCity = "Toronto";
    this.city = this.defaultCity;
    this.timezone;
  }

  //Get location info
  async getLocationData(userCity) {
    try {
      const locationRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${
          userCity
            ? userCity.charAt(0).toUpperCase() + userCity.slice(1)
            : this.defaultCity
        }&count=10&language=en&format=json`,

        {
          mode: "cors",
        }
      );
      const locationData = await locationRes.json();
      console.log(locationData);
      if (locationData.results && locationData.results.length > 0) {
        const {
          latitude: locationlng,
          longitude: locationLon,
          timezone: timeZ,
        } = locationData.results[0];
        this.timezone = timeZ;
        return { locationlng, locationLon };
      } else {
        throw new Error("Location data not found");
      }
    } catch (error) {
      console.error("Error fetching location data:", error.message);
      throw error;
    }
  }

  async fetchWeatherData() {
    try {
      let userCity = document.querySelector(".city_search").value.toLowerCase();
      this.city = userCity || this.defaultCity;

      const { locationlng, locationLon } = await this.getLocationData(userCity);

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${locationlng}&longitude=${locationLon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,is_day,rain&past_days=1&daily=weather_code&models=icon_global`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }
}
export default WeatherService;
