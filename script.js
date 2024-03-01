"use strict";

async function getData() {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m`
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
}
getData();
