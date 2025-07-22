const path = require('path');
const swisseph = require('swisseph');


// Set up Swiss Ephemeris with ephemeris files
const ephePath = path.join(__dirname, '../ephe');
console.log('Ephemeris path:', ephePath);
swisseph.swe_set_ephe_path(ephePath);

// Test date: July 20, 2025, 12:00 PM PDT (Kelowna, BC)
const date = new Date('2025-07-20T12:00:00-07:00');
console.log('Test date:', date.toISOString());

// Kelowna coordinates
const lon = -119.4960;  // West longitude (negative)
const lat = 49.8881;    // North latitude (positive)
const alt = 344;        // meters above sea level

console.log('Location: Kelowna, BC');
console.log('Longitude:', lon, 'Latitude:', lat, 'Altitude:', alt);

// Convert to Julian Day (UTC)
const year = date.getUTCFullYear();
const month = date.getUTCMonth() + 1;
const day = date.getUTCDate();
const hour = date.getUTCHours() + date.getUTCMinutes()/60;

const jd = swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
console.log('Julian Day:', jd);

// Calculate sunrise using Swiss Ephemeris rise/trans function
console.log('\n--- Calculating Sunrise ---');
swisseph.swe_rise_trans(
  jd - 0.5,
  swisseph.SE_SUN,
  null,
  swisseph.SEFLG_SWIEPH,
  swisseph.SE_CALC_RISE,
  [lon, lat, alt],
  1013.25,
  15,
  function (sunrise) {
    console.log('Sunrise result:', JSON.stringify(sunrise, null, 2));

    if (sunrise && !sunrise.error && sunrise.transitTime) {
      const sunriseJd = sunrise.transitTime;
      const sunriseDate = swisseph.swe_revjul(sunriseJd, swisseph.SE_GREG_CAL);
      console.log('Sunrise Julian Day:', sunriseJd);
      console.log('Sunrise Date:', sunriseDate);

      // Convert to local time (PDT = UTC-7)
      const sunriseUTC = new Date(
        sunriseDate.year,
        sunriseDate.month - 1,
        sunriseDate.day,
        Math.floor(sunriseDate.hour),
        Math.floor((sunriseDate.hour % 1) * 60)
      );
      console.log('Sunrise (UTC):', sunriseUTC.toISOString());

      // Convert to PDT (UTC-7)
      const sunrisePDT = new Date(sunriseUTC.getTime() - 7 * 60 * 60 * 1000);
      console.log('Sunrise (PDT):', sunrisePDT.toLocaleString());

      // Format as time
      const hours = sunrisePDT.getHours();
      const minutes = sunrisePDT.getMinutes();
      console.log('Sunrise Time:', `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    } else {
      console.log('Sunrise calculation failed:', sunrise?.error || 'Unknown error');
    }

    // Now calculate sunset inside the callback to ensure order
    calculateSunset();
  }
);

function calculateSunset() {
  console.log('\n--- Calculating Sunset ---');
  swisseph.swe_rise_trans(
    jd - 0.5,
    swisseph.SE_SUN,
    null,
    swisseph.SEFLG_SWIEPH,
    swisseph.SE_CALC_SET,
    [lon, lat, alt],
    1013.25,
    15,
    function (sunset) {
      console.log('Sunset result:', JSON.stringify(sunset, null, 2));

      if (sunsetJd) {
        const sunsetDate = swisseph.swe_revjul(sunsetJd, swisseph.SE_GREG_CAL);
        console.log('Sunset Julian Day:', sunsetJd);
        console.log('Sunset Date:', sunsetDate);

        // Convert to local time (PDT = UTC-7)
        const sunsetUTC = new Date(
          sunsetDate.year,
          sunsetDate.month - 1,
          sunsetDate.day,
          Math.floor(sunsetDate.hour),
          Math.floor((sunsetDate.hour % 1) * 60)
        );
        console.log('Sunset (UTC):', sunsetUTC.toISOString());

        // Convert to PDT (UTC-7)
        const sunsetPDT = new Date(sunsetUTC.getTime() - 7 * 60 * 60 * 1000);
        console.log('Sunset (PDT):', sunsetPDT.toLocaleString());

        // Format as time
        const hours = sunsetPDT.getHours();
        const minutes = sunsetPDT.getMinutes();
        console.log('Sunset Time:', `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      } else {
        console.log('Sunset calculation failed: No valid set or transitTime field found. Full result:', JSON.stringify(sunset, null, 2));
      }

      // Print expected results and close
      console.log('\n--- Expected Results (DrikPanchang) ---');
      console.log('Sunrise: 05:12 AM PDT');
      console.log('Sunset: 08:55 PM PDT');
      swisseph.swe_close();
    }
  );
}
