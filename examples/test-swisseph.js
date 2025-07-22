const swisseph = require('swisseph');
const path = require('path');

// Set ephemeris path to local './ephe' directory
swisseph.swe_set_ephe_path(path.join(__dirname, 'ephe'));
const jd = swisseph.swe_julday(2025, 7, 20, 12, swisseph.SE_GREG_CAL);
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
console.log('Ayanamsa:', ayanamsa);