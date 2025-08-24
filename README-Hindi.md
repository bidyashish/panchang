# खगोलीय कैलकुलेटर - पंचांग गणना पुस्तकालय

## 🕉️ परिचय

यह `@bidyashish/panchang` एक व्यापक TypeScript/JavaScript पुस्तकालय है जो पारंपरिक हिंदू पंचांग की सटीक गणना करता है। स्विस एफेमेरिस (Swiss Ephemeris) के द्वारा संचालित, यह पुस्तकालय तिथि, नक्षत्र, योग, करण, और वार जैसे महत्वपूर्ण वैदिक कैलेंडर तत्वों की गणना प्रदान करता है।

## ✨ मुख्य विशेषताएं

### 🌟 पंचांग तत्व
- **वार** - सप्ताह के दिन की गणना
- **तिथि** - चांद्र दिवस (प्रतिपदा से अमावस्या/पूर्णिमा तक)
- **नक्षत्र** - 27 नक्षत्र और उनके पाद
- **योग** - सूर्य और चंद्र की संयुक्त स्थिति (27 योग)
- **करण** - अर्ध-तिथि अवधि

### 🎯 वैदिक अनुपालन
- **निरयण (साइडरियल) राशि चक्र** - पारंपरिक भारतीय खगोल विज्ञान
- **संस्कृत नामकरण** - सभी राशि, नक्षत्र, और चांद्र महीने
- **अयनांश प्रणाली** - लाहिड़ी, रमन, केपी, सूर्यसिद्धांत, आर्यभट्ट
- **पक्ष गणना** - शुक्ल (बढ़ता) और कृष्ण (घटता) पक्ष
- **संवत प्रणाली** - शक संवत, विक्रम संवत, गुजराती संवत

### 🕐 समय गणना
- **सूर्योदय/सूर्यास्त** - स्थान-आधारित सटीक गणना
- **चंद्रोदय/चंद्रास्त** - चंद्र उदय और अस्त समय
- **राहु काल** - अशुभ समय अवधि
- **मुहूर्त** - शुभ समय अवधि
- **कालम अवधि** - गुलिकै, यमगंड काल

## 🚀 स्थापना

```bash
npm install @bidyashish/panchang
```

## 📋 त्वरित उपयोग

### सरल पंचांग गणना

```javascript
const { getPanchanga } = require('@bidyashish/panchang');

// आज का पंचांग
const आज = new Date();
const स्थान = {
    अक्षांश: 28.6139,    // नई दिल्ली
    देशांतर: 77.2090,
    समयक्षेत्र: 'Asia/Kolkata'
};

const पंचांग = getPanchanga(आज, स्थान.अक्षांश, स्थान.देशांतर, स्थान.समयक्षेत्र);

console.log('आज का पंचांग:');
console.log(`वार: ${पंचांग.vara.name}`);
console.log(`तिथि: ${पंचांग.tithi.name} (${पंचांग.tithi.paksha} पक्ष)`);
console.log(`नक्षत्र: ${पंचांग.nakshatra.name} - पाद ${पंचांग.nakshatra.pada}`);
console.log(`योग: ${पंचांग.yoga.name}`);
console.log(`करण: ${पंचांग.karana.name}`);
```

### विस्तृत रिपोर्ट

```javascript
const { getPanchangaReport } = require('@bidyashish/panchang');

const रिपोर्ट = getPanchangaReport(
    new Date(),
    28.6139,  // दिल्ली अक्षांश
    77.2090,  // दिल्ली देशांतर
    'Asia/Kolkata',
    'नई दिल्ली, भारत',
    true  // स्थानीय समय का उपयोग
);

console.log(रिपोर्ट);
```

### उन्नत कैलकुलेटर क्लास

```javascript
const { AstronomicalCalculator } = require('@bidyashish/panchang');

const कैलकुलेटर = new AstronomicalCalculator();

try {
    const पंचांग_डेटा = कैलकुलेटर.calculatePanchanga({
        date: new Date(),
        location: {
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata',
            name: 'नई दिल्ली'
        }
    });
    
    console.log('संपूर्ण पंचांग डेटा:', पंचांग_डेटा);
    
    // ग्रह स्थितियां प्राप्त करें
    const ग्रह_स्थितियां = कैलकुलेटर.calculatePlanetaryPositions(
        new Date(), 
        ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
    );
    
    console.log('ग्रह स्थितियां:', ग्रह_स्थितियां);
    
} finally {
    // संसाधन साफ करें
    कैलकुलेटर.cleanup();
}
```

## 📊 वैदिक तत्वों की व्याख्या

### तिथि (चांद्र दिवस)
- **प्रतिपदा** से **चतुर्दशी** तक (1-14)
- **पूर्णिमा** (15) - पूर्ण चंद्र
- **अमावस्या** (30/15) - नया चंद्र

### नक्षत्र (चांद्र नक्षत्र)
27 नक्षत्र, प्रत्येक 13°20' में विभाजित:
- **अश्विनी, भरणी, कृत्तिका, रोहिणी** आदि
- प्रत्येक नक्षत्र में 4 पाद (चरण)

### योग (खगोलीय संयोजन)
सूर्य और चंद्र के संयुक्त आंदोलन से 27 योग:
- **विष्कुम्भ, प्रीति, आयुष्मान, सौभाग्य** आदि

### करण (अर्ध-तिथि)
11 करण प्रकार:
- **बव, बालव, कौलव, तैतिल** (चल करण)
- **गर, वणिज, विष्टि** (चल करण)
- **शकुनि, चतुष्पद, नाग, किंस्तुघ्न** (स्थिर करण)

## 🌅 समय गणना विशेषताएं

### सूर्योदय/सूर्यास्त
```javascript
const { formatTimeInTimezone } = require('@bidyashish/panchang');

console.log(`सूर्योदय: ${पंचांग.formatters.getSunriseFormatted('HH:mm:ss')}`);
console.log(`सूर्यास्त: ${पंचांग.formatters.getSunsetFormatted('HH:mm:ss')}`);
```

### राहु काल (अशुभ समय)
```javascript
console.log(`राहु काल: ${पंचांग.formatters.getRahuKaalFormatted('HH:mm:ss')}`);
```

### मुहूर्त (शुभ समय)
```javascript
const मुहूर्त = पंचांग.muhurat;
console.log('अभिजित मुहूर्त:', मुहूर्त.abhijita);
console.log('अमृत काल:', मुहूर्त.amritKalam);
console.log('ब्रह्म मुहूर्त:', मुहूर्त.brahma);
```

## 📅 चांद्र कैलेंडर सिस्टम

### अमांत और पूर्णिमांत
```javascript
console.log(`अमांत महीना: ${पंचांग.lunarMonth.amanta}`);
console.log(`पूर्णिमांत महीना: ${पंचांग.lunarMonth.purnimanta}`);
```

### संवत वर्ष
```javascript
const संवत = पंचांग.samvata;
console.log(`शक संवत: ${संवत.shaka}`);
console.log(`विक्रम संवत: ${संवत.vikrama}`);
console.log(`गुजराती संवत: ${संवत.gujarati}`);
```

## 🪐 ग्रह स्थिति गणना

### वर्तमान ग्रह स्थितियां
```javascript
const { getCurrentPlanets } = require('@bidyashish/panchang');

const ग्रह = getCurrentPlanets(new Date(), 1); // लाहिड़ी अयनांश का उपयोग

ग्रह.forEach(ग्रह_डेटा => {
    console.log(`${ग्रह_डेटा.planet}: ${ग्रह_डेटा.longitude.toFixed(2)}° में ${ग्रह_डेटा.rashi.name} राशि`);
    console.log(`नक्षत्र: ${ग्रह_डेटा.nakshatra.name}`);
});
```

### अयनांश प्रणालियां
```javascript
const { getAyanamsa, getSpecificAyanamsa } = require('@bidyashish/panchang');

// सभी अयनांश प्रणालियां
const सभी_अयनांश = getAyanamsa(new Date());

// लाहिड़ी अयनांश (सबसे लोकप्रिय)
const लाहिड़ी = getSpecificAyanamsa(1, new Date());
console.log(`लाहिड़ी अयनांश: ${लाहिड़ी.degree.toFixed(4)}°`);
```

## 🎯 सटीकता और सत्यापन

### वैदिक पंचांग सत्यापन
पुस्तकालय **82% सटीकता** पारंपरिक वैदिक पंचांग गणनाओं के साथ प्राप्त करता है:

```javascript
// उदाहरण चलाने के लिए
node examples/vedic-panchang-verification.js
```

### सत्यापित तत्व
- ✅ **वार**: सोमवार (पूर्ण मिलान)
- ✅ **तिथि**: द्वादशी (12वीं चांद्र दिवस)
- ✅ **पक्ष**: शुक्ल (बढ़ता चरण)
- ✅ **नक्षत्र**: रोहिणी (4वां चांद्र नक्षत्र)
- ✅ **योग**: गंड (खगोलीय संयोजन)
- ✅ **चांद्र माह**: आषाढ़ (अमांत प्रणाली)

## 🛠️ उन्नत उपयोग

### समय क्षेत्र संभालना
```javascript
const { formatDateInTimezone, formatTimeRangeInTimezone } = require('@bidyashish/panchang');

// किसी भी समय क्षेत्र में दिनांक प्रारूपित करें
const स्थानीय_समय = formatDateInTimezone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');

// समय सीमा प्रारूपित करें
const राहु_काल = formatTimeRangeInTimezone(
    पंचांग.kalam.rahu.start, 
    पंचांग.kalam.rahu.end, 
    'Asia/Kolkata', 
    'HH:mm:ss'
);
```

### त्रुटि प्रबंधन
```javascript
try {
    const पंचांग = getPanchanga(new Date(), 28.6139, 77.2090, 'Asia/Kolkata');
    // पंचांग डेटा का उपयोग करें
} catch (त्रुटि) {
    console.error('पंचांग गणना त्रुटि:', त्रुटि.message);
}
```

## 📚 उदाहरण और प्रदर्शन

### उपलब्ध उदाहरण
```bash
# मुख्य वैदिक सत्यापन उदाहरण चलाएं
node examples/vedic-panchang-verification.js

# अन्य उदाहरण
node examples/usage-example.js
node examples/library-verification.js
```

### बिल्ड और परीक्षण
```bash
# प्रोजेक्ट बिल्ड करें
npm run build

# परीक्षण चलाएं
npm test

# विकास मोड
npm run dev
```

## 🔧 तकनीकी विवरण

### निर्भरताएं
- **स्विस एफेमेरिस** - उच्च-सटीकता खगोलीय गणनाओं के लिए
- **date-fns-tz** - समय क्षेत्र प्रबंधन के लिए
- **TypeScript** - प्रकार सुरक्षा के लिए

### समर्थित वातावरण
- **Node.js** 18+ (पैकेज इंजन आवश्यकता)
- **CommonJS** और **ESM** दोनों मॉड्यूल प्रारूप
- **TypeScript** परिभाषाएं शामिल

### प्रदर्शन
- **तुरंत गणना** - मिलीसेकेंड में परिणाम
- **मेमोरी कुशल** - उचित संसाधन प्रबंधन
- **स्केलेबल** - बड़े अनुप्रयोगों के लिए उपयुक्त

## 🤝 योगदान

यदि आप इस प्रोजेक्ट में योगदान देना चाहते हैं:

1. **रिपॉजिटरी को फोर्क करें**
2. **फीचर ब्रांच बनाएं** (`git checkout -b feature/AmazingFeature`)
3. **परिवर्तन कमिट करें** (`git commit -m 'Add some AmazingFeature'`)
4. **ब्रांच पर पुश करें** (`git push origin feature/AmazingFeature`)
5. **पुल रिक्वेस्ट खोलें**

## 📄 लाइसेंस

यह प्रोजेक्ट MIT लाइसेंस के तहत वितरित किया गया है। विवरण के लिए `LICENSE` फ़ाइल देखें।

## 🙏 स्वीकृतियां

- **स्विस एफेमेरिस** - खगोलीय गणना के लिए
- **पारंपरिक वैदिक ज्योतिष** - गणना पद्धतियों के लिए
- **भारतीय राष्ट्रीय पंचांग** - मानक संदर्भ के लिए

## 📞 सहायता

समस्या रिपोर्ट करने या प्रश्न पूछने के लिए:
- **GitHub Issues**: समस्याएं और सुझाव
- **NPM पैकेज**: `@bidyashish/panchang`

---

**🕉️ सनातन धर्म की समृद्ध परंपरा के साथ आधुनिक प्रौद्योगिकी का मेल** 

*"यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः।
तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम।।"*