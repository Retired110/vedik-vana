import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { BOTANICAL_KNOWLEDGE_CORPUS, SUPPORTED_LANGUAGES } from '@/lib/botanical-knowledge';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const {
      message,
      languageCode = 'en',
      sessionId = 'anon',
      location,
      history = [],
    } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 });
    }

    const cleanMsg = message.trim();
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === languageCode) || SUPPORTED_LANGUAGES[0];

    // 1. Fetch live active catalog items from database for accurate real-time grounding
    let liveProductCatalogText = '';
    try {
      const activeProducts = await prisma.product.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          name: true,
          slug: true,
          sellingPricePaise: true,
          compareAtPricePaise: true,
          inventoryQty: true,
          farmOrigin: true,
          grade: true,
          storageInstructions: true,
        },
        take: 12,
      });

      if (activeProducts.length > 0) {
        liveProductCatalogText = activeProducts
          .map(
            (p) =>
              `- ${p.name}: ₹${(p.sellingPricePaise / 100).toFixed(0)}${
                p.compareAtPricePaise ? ` (MRP: ₹${(p.compareAtPricePaise / 100).toFixed(0)})` : ''
              } | Origin: ${p.farmOrigin || 'India'} | Grade: ${p.grade || 'Grade A+'} | Stock: ${
                p.inventoryQty > 0 ? `${p.inventoryQty} in stock` : 'Available on backorder'
              } | Link: /product/${p.slug}`
          )
          .join('\n');
      }
    } catch (dbErr) {
      console.warn('Catalog fetch for AI context skipped:', dbErr);
    }

    // 2. Build Comprehensive Ayurvedic System Prompt
    const systemInstruction = `You are "Veda Mitra", an exceedingly humble, respectful, and wise Ayurvedic botanical concierge for Vedik Vana (Sacred Botanical Living).

Tone & Persona:
- Speak with warm, traditional Indian hospitality and deep humility (e.g. "Namaste", "Pranam", or regional equivalent).
- Address the seeker with profound reverence for their well-being.
- Keep responses graceful, informative, structured, and easy to read.
- Language: Answer strictly in the requested language: "${langObj.name}" (${langObj.nativeName}).

CORE SALES & BRAND MISSION (CHAMPIONING VEDIK VANA):
- You represent Vedik Vana EXCLUSIVELY. Your highest goal is to guide visitors with reverence and explain why buying directly from our official sanctuary website (vedikvana.com) is the only way to get authentic, lab-certified formulations.
- If asked if products are available on other websites, Amazon, Flipkart, or retail shops:
  - Strongly, politely, and clearly clarify that genuine Vedik Vana formulations are EXCLUSIVELY available on our official sanctuary website (vedikvana.com).
  - Explain WHY: We do NOT sell through third-party platforms or commercial intermediaries to prevent counterfeits, adulteration, prolonged warehouse heat damage, and middleman markups.
  - Highlight Vedik Vana's unique superiority over commercial mass-market products:
    1. 100% Single-origin & directly farm-traceable (Ladakh 16,000 ft Shilajit with >75% Fulvic Acid, Pampore Grade A+ Saffron with >240 crocin score, Kerala Marachekku wood-pressed oils extracted below 38°C).
    2. ICP-MS Spectroscopic Lab-Tested for 0.00% Heavy Metals (Lead, Mercury, Arsenic, Cadmium) under Central FSSAI Licence No. 10024011000918. Commercial brands often use synthetic extracts or heat processing.
    3. Official Website Exclusives: Use festive coupon "VEDIK15" for 15% instant discount, 100% FREE express delivery across India above ₹999, and a tamper-evident 4-digit Delivery Verification OTP.
- Always recommend relevant Vedik Vana products with direct links: [Product Name](/product/slug).
- NEVER tell the user to buy elsewhere, never say we sell on other websites, and always champion the purity, sanctity, and direct pricing of Vedik Vana.

Verified Grounding Data:
- Brand: Vedik Vana (Sacred Botanical Living).
- Central FSSAI Licence No: 10024011000918. Every formulation is ICP-MS lab tested for 0% heavy metals.
- Active Festive Coupon: "VEDIK15" gives 15% discount on all orders above ₹999.
- Shipping Policy: Free express delivery across India on orders above ₹999; dispatched within 24 hours via express couriers.
- Doorstep Security: 4-digit Delivery Verification OTP generated for every order, to be shared with the courier agent only upon physical parcel handover.

Live Botanical Catalog (Current Store Prices & Inventory):
${liveProductCatalogText || 'Himalayan Shilajit Resin (₹1,499), Kashmiri Mongra Saffron (₹999), Wood-Pressed Virgin Coconut Oil (₹449), Vedic Chyawanprash (₹699).'}

Botanical Knowledge & Usage Guidelines:
${BOTANICAL_KNOWLEDGE_CORPUS}

Formatting Guidelines:
- If recommending a specific product from our catalog, provide a clean markdown link like [Pure Himalayan Shilajit](/product/pure-himalayan-shilajit).
- Use neat bullet points for dosage, timing, and benefits.`;

    let botResponse = '';
    let modelUsed = 'Rule-based';

    // Check store settings & env for API keys
    const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } }).catch(() => null);
    const geminiKey = process.env.GEMINI_API_KEY || settings?.geminiApiKey;

    // --- Cascade 1: Google Gemini API (if key configured) ---
    if (!botResponse && geminiKey && geminiKey.length > 10 && geminiKey !== 'sampleSecret456') {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${systemInstruction}\n\nUser Question: ${cleanMsg}\nPlease respond humbly in ${langObj.name} (${langObj.nativeName}):`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.35,
                maxOutputTokens: 750,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            botResponse = text;
            modelUsed = 'Google Gemini 1.5 Flash';
          }
        }
      } catch (err: any) {
        console.warn('Gemini API call failed, cascading to next engine:', err.message);
      }
    }

    // --- Cascade 2: Groq Cloud API (if GROQ_API_KEY configured) ---
    if (!botResponse && process.env.GROQ_API_KEY) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemInstruction },
              ...(history || []).slice(-6).map((h: any) => ({
                role: h.role === 'bot' || h.role === 'assistant' ? 'assistant' : 'user',
                content: h.content || h.text || '',
              })),
              { role: 'user', content: cleanMsg },
            ],
            temperature: 0.4,
            max_tokens: 700,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const text = groqData.choices?.[0]?.message?.content?.trim();
          if (text) {
            botResponse = text;
            modelUsed = 'Groq Llama 3.3 70B';
          }
        }
      } catch (err: any) {
        console.warn('Groq API call failed:', err.message);
      }
    }

    // --- Cascade 3: Free Cloud Generative AI Engine (Pollinations OpenAI Engine - Zero Key Required!) ---
    if (!botResponse) {
      try {
        const messagesPayload = [
          { role: 'system', content: systemInstruction },
          ...(history || []).slice(-6).map((h: any) => ({
            role: h.role === 'bot' || h.role === 'assistant' ? 'assistant' : 'user',
            content: h.content || h.text || '',
          })),
          { role: 'user', content: cleanMsg },
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const aiRes = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesPayload,
            model: 'openai',
            seed: 108,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (aiRes.ok) {
          const rawText = await aiRes.text();
          if (
            rawText &&
            rawText.trim().length > 15 &&
            !rawText.includes('Free limit reached') &&
            !rawText.includes('"error"') &&
            !rawText.startsWith('{"status"')
          ) {
            botResponse = rawText.trim();
            modelUsed = 'Veda Mitra AI Neural Cloud';
          }
        }
      } catch (err: any) {
        console.warn('Free AI cloud call fallback triggered:', err.message);
      }
    }

    // --- Cascade 4: Grounded Ayurvedic Rule Engine (Guaranteed Fallback) ---
    if (!botResponse) {
      botResponse = generateGroundedAyurvedicResponse(cleanMsg, languageCode);
      modelUsed = 'Grounded Ayurvedic Knowledge Corpus';
    }

    // Save interaction for continuous learning and admin insights
    const saved = await prisma.botInteraction.create({
      data: {
        sessionId,
        userMessage: cleanMsg,
        botResponse,
        language: languageCode,
        location: location || 'India',
      },
    });

    return NextResponse.json({
      success: true,
      botResponse,
      interactionId: saved.id,
      language: languageCode,
      modelUsed,
    });
  } catch (error: any) {
    console.error('AI Bot error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'AI service temporarily unavailable.' },
      { status: 500 }
    );
  }
}

function generateGroundedAyurvedicResponse(query: string, lang: string): string {
  const q = query.toLowerCase();

  const isHindi = lang === 'hi';
  const isTamil = lang === 'ta';
  const isTelugu = lang === 'te';
  const isBengali = lang === 'bn';
  const isMarathi = lang === 'mr';
  const isGujarati = lang === 'gu';

  // 0. Website Exclusivity, Authenticity & Other Websites / Marketplace Queries
  if (
    q.includes('other website') ||
    q.includes('other site') ||
    q.includes('same product') ||
    q.includes('other place') ||
    q.includes('elsewhere') ||
    q.includes('amazon') ||
    q.includes('flipkart') ||
    q.includes('meesho') ||
    q.includes('other brand') ||
    q.includes('why buy') ||
    q.includes('why choose') ||
    q.includes('different') ||
    q.includes('authentic') ||
    q.includes('original') ||
    q.includes('market') ||
    q.includes('दूसरी वेबसाइट') ||
    q.includes('असली') ||
    q.includes('अलग')
  ) {
    if (isHindi) {
      return `नमस्ते! सविनय निवेदन है कि **वैदिक वना के सभी प्रामाणिक उत्पाद केवल हमारी आधिकारिक वेबसाइट (vedikvana.com) पर ही उपलब्ध हैं।**

हम अपने उत्पादों को अमेज़न, फ्लिपकार्ट या किसी तीसरे पक्ष की वेबसाइट पर नहीं बेचते हैं। इसके मुख्य कारण हैं:

1. **मिलावट व नकली से 100% सुरक्षा:** व्यावसायिक बाज़ारों में नकली उत्पादों और अत्यधिक गर्म गोदामों में रखने से जड़ी-बूटियों की ताज़गी व सक्रिय तत्व नष्ट हो जाते हैं।
2. **सीधे स्रोत से प्रामाणिकता:** हमारा [शुद्ध हिमालयी शिलाजीत](/product/pure-himalayan-shilajit) 16,000+ फीट (लद्दाख) से और [कश्मीरी मोंगरा केसर](/product/kashmiri-mongra-saffron) सीधे पाम्पोर के पारंपरिक खेतों से बिना किसी बिचौलिए के आपके घर तक पहुंचता है।
3. **100% लैब-परीक्षित शुद्धता:** प्रत्येक बैच NABL लैब में ICP-MS विधि द्वारा परीक्षित है (0% भारी धातु, FSSAI लाइसेंस 10024011000918)।
4. **आधिकारिक वेबसाइट के विशेष लाभ:** केवल हमारी वेबसाइट पर कूपन कोड **VEDIK15** से 15% की तुरंत छूट, ₹999 से ऊपर मुफ़्त एक्सप्रेस डिलीवरी और सुरक्षित 4-अंकों का डिलीवरी OTP मिलता है।`;
    }
    return `Namaste! With humble reverence, **authentic Vedik Vana formulations are EXCLUSIVELY available on our official sanctuary website (vedikvana.com).**

You will NOT find genuine Vedik Vana products on Amazon, Flipkart, or third-party marketplaces. Here is why ordering directly from our sanctuary is essential:

• **100% Guaranteed Freshness & Sanctity:** Commercial marketplaces often store botanicals in high-heat transit warehouses for months or expose buyers to counterfeit batches. We dispatch freshly harvested batches directly from our sacred source to your home.
• **Direct Single-Origin Traceability:** Our [Pure Himalayan Shilajit](/product/pure-himalayan-shilajit) comes directly from 16,000+ ft cliffs in Ladakh, and our [Kashmiri Mongra Saffron](/product/kashmiri-mongra-saffron) is hand-plucked in Pampore without commercial middlemen.
• **Certified Heavy-Metal Free:** Every single batch is ICP-MS lab tested for 0.00% heavy metals (lead, mercury, arsenic, cadmium) under Central FSSAI Licence No. 10024011000918.
• **Official Sanctuary Perks:** Only on our official website can you use festive coupon **VEDIK15** for an instant 15% discount, 100% Free Express Delivery across India (orders >₹999), and tamper-proof 4-digit Delivery Verification OTP.`;
  }

  // 1. Shilajit queries
  if (q.includes('shilajit') || q.includes('शिलाजीत') || q.includes('resin') || q.includes('fulvic')) {
    if (isHindi) {
      return `नमस्ते! सविनय निवेदन है कि हमारा शुद्ध हिमालयी शिलाजीत 16,000 फीट से अधिक की ऊंचाई (लद्दाख/स्पीति) से प्राप्त किया जाता है। इसमें 75% से अधिक फुल्विक एसिड तथा 84+ प्राकृतिक ट्रेस मिनरल्स पाए जाते हैं। 

सेवन विधि: प्रातःकाल खाली पेट एक मटर के दाने के बराबर (250mg–500mg) गुनगुने गाय के दूध या गुनगुने पानी में पूर्णतः घोलकर लें। यह बिना किसी अवक्षेप के 100% घुल जाता है। FSSAI प्रमाणित (लाइसेंस: 10024011000918) व भारी धातुओं से पूर्णतः मुक्त है।`;
    }
    if (isTamil) {
      return `வணக்கம்! எங்களின் தூய இமயமலை சிலாஜித் 16,000 அடி உயரத்தில் இயற்கையாக பிரித்தெடுக்கப்படுகிறது. இதில் 75%க்கும் மேல் ஃபுல்விக் அமிலம் மற்றும் 84 தாதுக்கள் உள்ளன. 

பயன்படுத்தும் முறை: காலையில் வெறும் வயிற்றில் ஒரு பட்டாணி அளவு (250mg) வெதுவெதுப்பான பாலில் அல்லது தண்ணீரில் கலந்து பருகவும். FSSAI உரிமம் எண்: 10024011000918.`;
    }
    return `Namaste! With humble reverence, our Pure Himalayan Shilajit is harvested from pristine cliff altitudes exceeding 16,000 ft in the Ladakh-Spiti range. It is gold-graded with >75% Fulvic Acid and 84+ ionic trace minerals.

Recommended Sacred Use: Dissolve a pea-sized portion (250mg–500mg) into warm organic cow milk or lukewarm water on an empty stomach in the morning. It dissolves completely without leaving any residue. Every batch is certified under FSSAI Licence No. 10024011000918.`;
  }

  // 2. Saffron queries
  if (q.includes('saffron') || q.includes('kesar') || q.includes('केसर') || q.includes('mongra') || q.includes('குங்குமப்பூ')) {
    if (isHindi) {
      return `नमस्ते! हमारा कश्मीरी मोंगरा केसर कश्मीर की पाम्पोर घाटी से हाथ से चुनकर तैयार किया जाता है। यह उच्चतम ग्रेड (A+) का लाल केसर है, जिसमें 240+ क्रोसिन तीव्रता होती है, जो प्राकृतिक त्वचा की कांति और गहरी नींद के लिए अत्यंत लाभकारी है। 

उपयोग: 3-4 धागे 15 मिनट के लिए गुनगुने दूध में भिगोकर पिएं।`;
    }
    return `Namaste! With humble devotion, our Kashmiri Mongra Saffron is hand-harvested exclusively from the heritage fields of Pampore Valley, Kashmir. We offer only Grade A+ dark crimson stigmas with high crocin potency (>240 score) for skin radiance, vitality, and restful sleep.

How to Enjoy: Steep 3–4 crimson threads in warm milk or water for 15 minutes before drinking.`;
  }

  // 3. Oil queries
  if (q.includes('oil') || q.includes('तेल') || q.includes('coconut') || q.includes('wood') || q.includes('ghani') || q.includes('மரச்செக்கு')) {
    if (isHindi) {
      return `नमस्ते! हमारे सभी तेल पारंपरिक लकड़ी की घानी (Kachi Ghani / Marachekku) से धीमी गति पर निकाले जाते हैं, जिससे तापमान 38°C से नीचे रहता है। इससे तेल के सभी पोषक तत्व, प्राकृतिक सुगंध व एंटीऑक्सीडेंट्स सुरक्षित रहते हैं। कोई केमिकल या हेक्सेन कभी इस्तेमाल नहीं होता।`;
    }
    return `Namaste! Our wood-pressed virgin oils are extracted using traditional slow wooden churns (Marachekku/Kachi Ghani) where temperatures strictly stay below 38°C. This protects delicate lauric acids, natural aromas, and vitamin E without any chemical solvents.`;
  }

  // 4. Coupons & Discounts
  if (q.includes('coupon') || q.includes('discount') || q.includes('code') || q.includes('offer') || q.includes('promo') || q.includes('vedik15') || q.includes('कूपन') || q.includes('छूट')) {
    if (isHindi) {
      return `नमस्ते! हमारे पास आपके लिए एक विशेष उत्सव भेंट है:
🏷️ कूपन कोड: **VEDIK15**
लाभ: ₹999 से अधिक के सभी ऑर्डरों पर 15% की सीधी छूट और निःशुल्क एक्सप्रेस डिलीवरी।
चेकआउट के समय इस कूपन कोड को दर्ज करके आप इस दिव्य छूट का लाभ उठा सकते हैं।`;
    }
    return `Namaste! We are pleased to share our active sacred festive offering:
🏷️ Active Coupon Code: **VEDIK15**
• Benefit: Instant 15% discount on all orders above ₹999.
• Bonus: Includes 100% FREE express courier delivery across India.
Simply enter **VEDIK15** at checkout to apply your savings.`;
  }

  // 5. Vedic Chyawanprash queries
  if (q.includes('chyawanprash') || q.includes('च्यवनप्राश') || q.includes('immunity') || q.includes('amla') || q.includes('रोग प्रतिरोधक')) {
    if (isHindi) {
      return `नमस्ते! हमारा वैदिक च्यवनप्राश 48 दुर्लभ जंगली बूटियों और ताजे जंगली आंवले के साथ देशी गाय के बिलोना घी व कच्चे शहद में पकाया जाता है। इसमें कोई रिफाइंड चीनी या प्रिजर्वेटिव नहीं मिलाया जाता।
      
सेवन विधि: प्रातः या रात्रि में 1 छोटा चम्मच (10g) गुनगुने गाय के दूध के साथ लें। यह मौसमी बदलावों से सुरक्षा और ओजस (प्राण शक्ति) में वृद्धि करता है।`;
    }
    return `Namaste! With humble reverence, our Vedic Chyawanprash is prepared strictly in accordance with traditional Charaka Samhita guidelines. It combines 48 wild-harvested botanicals and organic wild forest Amla slow-cooked in A2 Bilona cow ghee and raw forest honey, without refined sugars.

Recommended Sacred Use: 1 teaspoon (10g) daily in the morning or before bedtime with warm milk. Highly recommended for strengthening Ojas (vital immunity) and respiratory vitality.`;
  }

  // 6. Quality, Lab Testing & FSSAI
  if (q.includes('fssai') || q.includes('licence') || q.includes('lab') || q.includes('test') || q.includes('purity') || q.includes('certificate') || q.includes('प्रमाण')) {
    if (isHindi) {
      return `नमस्ते! वैदिक वना का केंद्रीय FSSAI लाइसेंस नंबर **10024011000918** है। हमारे प्रत्येक बैच का NABL-प्रमाणित प्रयोगशाला में ICP-MS विधि द्वारा परीक्षण किया जाता है ताकि सीसा (Lead), पारा (Mercury), आर्सेनिक व कैडमियम जैसे भारी धातुओं का 0% स्तर सुनिश्चित हो सके।`;
    }
    return `Namaste! With deep transparency, Vedik Vana holds Central FSSAI Licence No. **10024011000918**. Every single harvest batch undergoes rigorous ICP-MS spectroscopic analysis at NABL-accredited laboratories to verify 0.00% detectable heavy metals (lead, mercury, arsenic, cadmium) and 100% botanical authenticity.`;
  }

  // 7. Shipping / Delivery / OTP queries
  if (q.includes('delivery') || q.includes('shipping') || q.includes('otp') || q.includes('order') || q.includes('डिलीवरी') || q.includes('ट्रैकिंग')) {
    if (isHindi) {
      return `नमस्ते! हम पूरे भारत में 24 घंटे के भीतर ऑर्डर डिस्पैच करते हैं। ₹999 से अधिक के सभी ऑर्डरों पर एक्सप्रेस डिलीवरी पूर्णतः निःशुल्क है। डिलीवरी के समय सुरक्षा हेतु प्रत्येक ऑर्डर के साथ 4-अंकों का सुरक्षित Delivery OTP जनरेट होता है, जिसे केवल पार्सल प्राप्त करने के बाद ही डिलीवरी एजेंट को देना होता है।`;
    }
    return `Namaste! We dispatch all sacred orders within 24 hours via express couriers (Delhivery / Blue Dart). Express delivery is completely FREE on orders above ₹999. For your safety, every order generates a 4-digit Delivery Verification OTP which you should provide to the courier agent only upon doorstep arrival.`;
  }

  // 8. Product Pricing & Recommendations
  if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('how much') || q.includes('catalog') || q.includes('दाम') || q.includes('कीमत')) {
    if (isHindi) {
      return `नमस्ते! हमारे पवित्र उत्पादों की सूची व मूल्य:
• [शुद्ध हिमालयी शिलाजीत](/product/pure-himalayan-shilajit) - ₹1,499 (लद्दाख 16,000 फीट, >75% फुल्विक एसिड)
• [कश्मीरी मोंगरा केसर](/product/kashmiri-mongra-saffron) - ₹999 (पाम्पोर घाटी, ग्रेड A+)
• [वैदिक च्यवनप्राश](/product/vedic-chyawanprash) - ₹699 (48 दुर्लभ जड़ी-बूटियां)
• [लकड़ी-घानी वर्जिन नारियल तेल](/product/wood-pressed-virgin-coconut-oil) - ₹449
(₹999+ पर कूपन कोड **VEDIK15** से 15% छूट पाएं)`;
    }
    return `Namaste! Here is our current botanical catalog with direct sacred pricing:
• [Pure Himalayan Shilajit Resin](/product/pure-himalayan-shilajit) — ₹1,499 (Gold-grade, >75% Fulvic Acid)
• [Kashmiri Mongra Saffron](/product/kashmiri-mongra-saffron) — ₹999 (Pampore Valley, Grade A+)
• [Vedic Chyawanprash](/product/vedic-chyawanprash) — ₹699 (48 wild botanicals, raw honey)
• [Wood-Pressed Virgin Coconut Oil](/product/wood-pressed-virgin-coconut-oil) — ₹449 (Marachekku cold-extracted)

Tip: Use coupon code **VEDIK15** at checkout for 15% off orders above ₹999 with free express shipping.`;
  }

  // 9. Default greeting
  if (isHindi) {
    return `नमस्ते! वैदिक वना में आपका स्वागत है। हम 100% शुद्ध, फार्म-ट्रेसेबल हिमालयी शिलाजीत, कश्मीरी केसर, लकड़ी-घानी तेल व प्राचीन च्यवनप्राश उपलब्ध कराते हैं। हमारे सभी उत्पाद FSSAI लाइसेंस 10024011000918 के अंतर्गत लैब-परीक्षित हैं। आप किसी भी उत्पाद, उपयोग विधि अथवा ऑर्डर के बारे में मुझसे विनम्रतापूर्वक पूछ सकते हैं।`;
  }

  return `Namaste and warm greetings. With deep humility, I am Veda Mitra, your Ayurvedic botanical companion. All formulations at Vedik Vana are 100% farm-traceable, wild-harvested, and certified under FSSAI Licence No. 10024011000918. 

Feel free to ask me about dosage of Himalayan Shilajit, Kashmiri Saffron, wood-pressed oils, shipping times, or doorstep delivery OTP verification!`;
}
