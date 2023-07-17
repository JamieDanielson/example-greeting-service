'use strict';

const opentelemetry = require('@opentelemetry/api');

module.exports.year = async (event) => {
  const span = opentelemetry.trace.getTracer('default').startSpan('Getting year');
  const year = await determineYear();
  console.log(year);
  span.setAttribute('year', year);
  span.end();

  function determineYear() {
    const years = [2015, 2016, 2017, 2018, 2019, 2020];
    console.log(years);
    return years[Math.floor(Math.random() * years.length)];
  }
};
