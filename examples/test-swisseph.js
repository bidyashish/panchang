const path = require('path');
const swisseph = require('swisseph');

console.log('Swiss Ephemeris version:', swisseph.swe_version());

// Test date
var date = {year: 2025, month: 7, day: 20, hour: 12};
console.log('Test date:', date);

var flag = swisseph.SEFLG_SPEED | swisseph.SEFLG_MOSEPH;

// path to ephemeris data
swisseph.swe_set_ephe_path(path.join(__dirname, '../ephe'));

// Julian day
const jd = swisseph.swe_julday(date.year, date.month, date.day, date.hour, swisseph.SE_GREG_CAL);
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, jd, 0);

// Get ayanamsa
swisseph.swe_get_ayanamsa_ut(jd, function(result) {
    console.log('Lahiri Ayanamsa:', result.ayanamsa);
});

// Sun position
swisseph.swe_calc_ut(jd, swisseph.SE_SUN, flag, function (body) {
    console.log('Sun position (tropical):', body.longitude, body.latitude);
    
    // Convert to sidereal
    swisseph.swe_get_ayanamsa_ut(jd, function(ayanamsa_result) {
        var sidereal_lon = body.longitude - ayanamsa_result.ayanamsa;
        if (sidereal_lon < 0) sidereal_lon += 360;
        console.log('Sun position (sidereal):', sidereal_lon);
    });
});

// Moon position
swisseph.swe_calc_ut(jd, swisseph.SE_MOON, flag, function (body) {
    console.log('Moon position (tropical):', body.longitude, body.latitude);
    
    // Convert to sidereal
    swisseph.swe_get_ayanamsa_ut(jd, function(ayanamsa_result) {
        var sidereal_lon = body.longitude - ayanamsa_result.ayanamsa;
        if (sidereal_lon < 0) sidereal_lon += 360;
        console.log('Moon position (sidereal):', sidereal_lon);
        
        // Calculate Nakshatra (27 divisions of 360°)
        var nakshatra_num = Math.floor(sidereal_lon / (360/27)) + 1;
        var nakshatraNames = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];
        console.log('Moon Nakshatra:', nakshatraNames[nakshatra_num - 1], '(' + nakshatra_num + ')');
    });
});

// Test sunrise/sunset for Kelowna, BC (49.8881, -119.4960)
var lat = 49.8881;
var lon = -119.4960;
var alt = 344; // altitude in meters
    
console.log('\n--- Sunrise/Sunset for Kelowna, BC ---');
    
// Calculate sunrise
swisseph.swe_rise_trans(jd - 0.5, swisseph.SE_SUN, null, 0, swisseph.SE_CALC_RISE, [lon, lat, alt], 0, 0, function(result) {
    if (!result.error) {
        swisseph.swe_revjul(result.transitTime, swisseph.SE_GREG_CAL, function(sunrise_date) {
            console.log('Sunrise:', sunrise_date.year + '-' + sunrise_date.month + '-' + sunrise_date.day, 
                      Math.floor(sunrise_date.hour) + ':' + Math.floor((sunrise_date.hour % 1) * 60));
        });
    } else {
        console.log('Sunrise calculation error:', result.error);
    }
});
    
// Calculate sunset
swisseph.swe_rise_trans(jd - 0.5, swisseph.SE_SUN, null, 0, swisseph.SE_CALC_SET, [lon, lat, alt], 0, 0, function(result) {
    if (!result.error) {
        swisseph.swe_revjul(result.transitTime, swisseph.SE_GREG_CAL, function(sunset_date) {
            console.log('Sunset:', sunset_date.year + '-' + sunset_date.month + '-' + sunset_date.day, 
                      Math.floor(sunset_date.hour) + ':' + Math.floor((sunset_date.hour % 1) * 60));
        });
    } else {
        console.log('Sunset calculation error:', result.error);
    }
});

console.log('Swiss Ephemeris test completed');
