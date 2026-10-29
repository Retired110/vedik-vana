export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  greeting: string;
  humblePrefix: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    greeting: 'Namaste! With deep humility, I welcome you to Vedik Vana. How may I be of modest service to your botanical wellness journey today?',
    humblePrefix: 'With deepest reverence for your health: ',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    greeting: 'नमस्ते! वेद मित्र में आपका सविनय व हार्दिक स्वागत है। शुद्ध हिमालयी शिलाजित, कश्मीरी केसर व लकड़ी-घानी तेलों के विषय में मैं आपकी क्या विनम्र सेवा कर सकता हूँ?',
    humblePrefix: 'आपके उत्तम स्वास्थ्य हेतु सविनय निवेदन है कि: ',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    greeting: 'வணக்கம்! வேத மித்ராவிற்கு தங்களை பணிவுடன் வரவேற்கிறோம். தூய இமயமலை சிலாஜித் மற்றும் பாரம்பரிய மரச்செக்கு எண்ணெய்கள் பற்றி நான் எவ்வாறு உதவ முடியும்?',
    humblePrefix: 'தங்களின் நல்வாழ்விற்கான பணிவான வழிகாட்டல்: ',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    greeting: 'నమస్కారం! వేద మిత్రా మిమ్మల్ని అత్యంత వినయపూర్వకంగా స్వాగతిస్తోంది. స్వచ్ఛమైన హిమాలయ శిలాజిత్ మరియు గానుగ నూనెల గురించి మీకు ఏ విధంగా సేవ చేయగలను?',
    humblePrefix: 'మీ ఆయురారోగ్యాల కొరకు వినమ్ర సమాచారం: ',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    greeting: 'নমস্কার! বেদ মিত্রে আপনাকে সশ্রদ্ধ স্বাগতম। খাঁটি হিমালয় শিলাজিৎ এবং প্রাকৃতিক ভেষজ সম্পর্কে আমি আপনাকে কীভাবে বিনম্র সেবা করতে পারি?',
    humblePrefix: 'আপনার সুস্বাস্থ্যের জন্য বিনীত নিবেদন: ',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    greeting: 'नमस्कार! वेद मित्र मध्ये आपले अत्यंत आदराने स्वागत आहे. शुद्ध हिमालयीन शिलाजीत आणि लाकडी घाणी तेलांविषयी मी आपली काय विनम्र सेवा करू शकेन?',
    humblePrefix: 'आपल्या दीर्घायुष्यासाठी नम्र मार्गदर्शन: ',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    greeting: 'નમસ્તે! વેદ મિત્રમાં આપનું અત્યંત નમ્રતાપૂર્વક સ્વાગત છે. શુદ્ધ હિમાલયન શિલાજીત અને દેશી ઘાણી તેલ વિશે હું આપની શું સેવા કરી શકું?',
    humblePrefix: 'આપના ઉત્તમ સ્વાસ્થ્ય માટે નમ્ર નિવેદન: ',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    greeting: 'ನಮಸ್ಕಾರ! ವೇದ ಮಿತ್ರ ನಿಮ್ಮನ್ನು ಅತ್ಯಂತ ವಿನಮ್ರವಾಗಿ ಸ್ವಾಗತಿಸುತ್ತದೆ. ಶುದ್ಧ ಹಿಮಾಲಯದ ಶಿಲಾಜಿತ್ ಮತ್ತು ಗಾಣದ ಎಣ್ಣೆಗಳ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸೇವೆ ಸಲ್ಲಿಸಲಿ?',
    humblePrefix: 'ನಿಮ್ಮ ಉತ್ತಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ ವಿನಮ್ರ ಸಲಹೆ: ',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    greeting: 'നമസ്കാരം! വേദ മിത്രയിലേക്ക് അങ്ങയെ വിനീതമായി സ്വാഗതം ചെയ്യുന്നു. ശുദ്ധമായ ഹിമാലയൻ ശിലാജിത്തും പരമ്പരാഗത തൈലങ്ങളും സംബന്ധിച്ച് ഞാൻ എങ്ങനെ സഹായിക്കണം?',
    humblePrefix: 'അങ്ങയുടെ ആരോഗ്യത്തിനായി വിനീതമായ വിവരങ്ങൾ: ',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ! ਵੇਦ ਮਿੱਤਰ ਤੁਹਾਡਾ ਬੜੀ ਨਿਮਰਤਾ ਨਾਲ ਸਵਾਗਤ ਕਰਦਾ ਹੈ। ਸ਼ੁੱਧ ਹਿਮਾਲੀਅਨ ਸ਼ਿਲਾਜੀਤ ਅਤੇ ਜੜੀ-ਬੂਟੀਆਂ ਬਾਰੇ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਸੇਵਾ ਕਰ ਸਕਦਾ ਹਾਂ?',
    humblePrefix: 'ਤੁਹਾਡੀ ਚੰਗੀ ਸਿਹਤ ਲਈ ਨਿਮਰਤਾ ਸਹਿਤ ਬੇਨਤੀ ਹੈ: ',
  },
];

export const BOTANICAL_KNOWLEDGE_CORPUS = `
Brand: Vedik Vana (Sacred Botanical Living)
FSSAI Central Licence: 10024011000918. Every formulation is ICP-MS lab tested for zero heavy metals (lead, mercury, arsenic, cadmium).
Ethos: Single-origin, traceable harvests in direct fair partnership with Indian farmers. No synthetic fillers, no hexane, no mineral oils.

Catalog Products & Formulations:
1. Pure Himalayan Shilajit Resin (Gold Grade):
- Origin: High-altitude cliffs of Ladakh/Spiti (>16,000 ft).
- Key Potency: >75% Fulvic Acid, 84+ ionic trace minerals.
- Dosage & Use: Pea-sized portion (250mg-500mg) dissolved in warm cow milk or lukewarm water on empty stomach in morning.
- Authenticity check: Dissolves 100% without grit, hardens when cold, soft at body temperature, pleasant smoky-earth aroma.

2. Kashmiri Mongra Saffron (Grade A+ Super Crimson):
- Origin: Pampore Valley, Kashmir. Hand-plucked stigmas.
- High Crocin potency (>240 crocin score) for natural radiance and restful sleep.
- Use: Steep 3-4 crimson threads in warm milk or pure water for 15 minutes before consumption.

3. Wood-Pressed Virgin Coconut Oil (Marachekku / Kachi Ghani):
- Origin: Coastal Kerala indigenous copra.
- Technique: Cold wood pestle pressed below 38°C without friction heat. Retains lauric acid and natural vitamin E.
- Multi-use: Dietary immunity booster, hair root nourishment, oil pulling (Gandusha).

4. Traditional Vedic Chyawanprash:
- Prepared in pure iron cauldrons (Lauha Patra) using wild forest amlas and 48 organic herbs, organic A2 ghee, and wild raw honey.
- Dosage: 1 teaspoon daily morning on empty stomach with warm milk.

5. Kumkumadi Tailam (Golden Miraculous Elixir):
- 26 botanical herbs including Kashmiri Saffron, Sandalwood, Manjistha, and pure goat milk infused in unrefined sesame oil.
- Use: 3-4 drops on clean face at night for natural glow and hyperpigmentation reduction.

6. Triphala Churna (Equal Ratio):
- Compounded from equal parts dried fruit rinds of Haritaki, Bibhitaki, and Amalaki with seeds removed before milling.
- Dosage: 1/2 to 1 teaspoon with warm water at bedtime for gut harmony.

Store Policies & Delivery:
- Shipping: Free Express shipping on orders over ₹999. Orders dispatched within 24 hours via Delhivery / Blue Dart. Delivery takes 2-4 business days.
- Doorstep Verification: Every order generates a secure 4-digit Delivery OTP sent to customer and displayed in confirmation email.
- Payment Methods: Cash on Delivery (COD) and Online Prepaid via Razorpay.
- Returns: 7-day hassle-free replacement or refund for sealed/damaged items.
`;
