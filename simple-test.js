try {
    const swisseph = require('swisseph');
    console.log('Swiss Ephemeris loaded successfully');
    console.log('Version:', swisseph.swe_version());
    
    // Test basic functionality
    const testDate = {year: 2025, month: 7, day: 20, hour: 12};
    console.log('Test date:', testDate);
    
    // Set ephemeris path
    const ephePath = __dirname + '/ephe';
    console.log('Setting ephemeris path to:', ephePath);
    swisseph.swe_set_ephe_path(ephePath);
    
    // Calculate Julian day
    const jd = swisseph.swe_julday(testDate.year, testDate.month, testDate.day, testDate.hour, swisseph.SE_GREG_CAL);
    console.log('Julian Day:', jd);
    
    // Get Sun position
    const sunPos = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.SEFLG_SPEED);
    console.log('Sun position:', sunPos);
    
    // Get Moon position
    const moonPos = swisseph.swe_calc_ut(jd, swisseph.SE_MOON, swisseph.SEFLG_SPEED);
    console.log('Moon position:', moonPos);
    
    // Get Lahiri ayanamsa
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
    console.log('Lahiri Ayanamsa:', ayanamsa);
    
    // Calculate sidereal positions
    const sunSidereal = (sunPos.longitude - ayanamsa + 360) % 360;
    const moonSidereal = (moonPos.longitude - ayanamsa + 360) % 360;
    console.log('Sun sidereal longitude:', sunSidereal);
    console.log('Moon sidereal longitude:', moonSidereal);
    
    // Calculate Nakshatra for Moon
    const nakshatraNames = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    
    const nakshatraNum = Math.floor(moonSidereal / (360/27));
    console.log('Moon Nakshatra:', nakshatraNames[nakshatraNum] + ' (' + (nakshatraNum + 1) + ')');
    
    // Calculate Tithi (Moon - Sun longitude difference)
    const tithiLongitude = (moonSidereal - sunSidereal + 360) % 360;
    const tithiNum = Math.floor(tithiLongitude / 12) + 1;
    const tithiNames = [
        'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
        'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
        'Trayodashi', 'Chaturdashi', 'Amavasya/Purnima'
    ];
    const tithiIndex = tithiNum > 15 ? 14 : tithiNum - 1;
    console.log('Tithi:', tithiNames[tithiIndex] + ' (' + tithiNum + ')');
    
    swisseph.swe_close();
    
} catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
}
