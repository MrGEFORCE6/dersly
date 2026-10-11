import { NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  course?: string;
  studentName?: string;
  history?: ChatMessage[];
}

const SYSTEM_PROMPT = `Sen "Dersly" özel ders platformunun samimi, enerjik ve pedagojik olarak yetkin "Yapay Zeka Özel Ders Koçu"sun.

TEMEL GÖREVLERİN VE PEDAGOJİK İLKELERİN:
1. Samimi, motive edici, sevecen ve destekleyici bir Türkçe ile konuş. Emojileri (💡, 📐, ✨, 🎯, 💪) sıcak ve dengeli kullan.
2. ASLA doğrudan nihai cevabı hemen söyleme! Sokratik yöntemle öğrenciyi yönlendir. Adım adım ipucu ver, kritik formülü veya düşünme yolunu hatırlat ve "Şimdi bu adımdan sonra sence ne yapmalıyız?" gibi sorularla öğrencinin kendi çözmesini sağla.
3. Formül veya konu sorulduğunda net, anlaşılır ve pratik ipuçları sun.
4. Öğrenci doğru yoldaysa veya çabalıyorsa mutlaka takdir et ("Harika bir başlangıç!", "Doğru yoldasın!").
5. Yanıtlarını mobil ekranlarda rahat okunabilecek şekilde kısa, net paragraflar halinde tut.`;

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { message, course, studentName = 'Öğrenci', history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Geçerli bir mesaj gereklidir.' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openAiApiKey = process.env.OPENAI_API_KEY;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    // 1. Google Gemini API Entegrasyonu
    if (geminiApiKey && geminiApiKey !== 'your-gemini-api-key-here') {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const contents = [
          ...history.map((h) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ];

        const geminiRes = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\nÖğrenci Adı: ${studentName}\nİlgili Ders/Alan: ${course || 'Genel Dersler'}`,
                },
              ],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const reply =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({
              reply: reply.trim(),
              provider: 'gemini',
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API çağrısı sırasında hata oluştu, fallback devreye giriyor:', geminiError);
      }
    }

    // 2. OpenAI / OpenRouter Entegrasyonu
    const genericKey = openRouterApiKey || openAiApiKey;
    if (genericKey) {
      try {
        const endpoint = openRouterApiKey
          ? 'https://openrouter.ai/api/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions';

        const aiRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${genericKey}`,
          },
          body: JSON.stringify({
            model: openRouterApiKey ? 'google/gemini-flash-1.5' : 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `${SYSTEM_PROMPT}\nÖğrenci: ${studentName}\nDers: ${course || 'Genel'}`,
              },
              ...history.map((h) => ({
                role: h.role === 'model' ? 'assistant' : h.role,
                content: h.content,
              })),
              { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 600,
          }),
        });

        if (aiRes.ok) {
          const data = await aiRes.json();
          const reply = data?.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply: reply.trim(), provider: 'openai' });
          }
        }
      } catch (aiError) {
        console.warn('AI API çağrısı başarısız oldu, simüle yanıt dönülüyor:', aiError);
      }
    }

    // 3. Akıllı Pedagojik Fallback (API Key girilmemişse veya kotada sorun varsa)
    const fallbackResponse = generatePedagogicalFallback(message, studentName, course);
    return NextResponse.json({
      reply: fallbackResponse,
      provider: 'pedagogical-engine-demo',
      notice: 'Gerçek AI yanıtları için .env.local içine GEMINI_API_KEY ekleyebilirsiniz.',
    });
  } catch (error) {
    console.error('ai-tutor route error:', error);
    return NextResponse.json(
      { error: 'Yapay zeka asistanı yanıt üretirken bir sorun oluştu.' },
      { status: 500 }
    );
  }
}

// Akıllı Pedagojik Cevap Motoru (API anahtarı henüz eklenmemişse kusursuz demo sağlar)
function generatePedagogicalFallback(message: string, studentName: string, course?: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('trigo') || lower.includes('sinüs') || lower.includes('kosinüs') || /\bsin\b/.test(lower) || /\bcos\b/.test(lower)) {
    return `Selam ${studentName}! 📐 Trigonometri sorularında ilk kuralımız: Verilen açıyı birim çember veya dik üçgen üzerinde hayal etmek!\n\n💡 İpucu: sin²(x) + cos²(x) = 1 özdeşliğini ve yarım açı formülünü [sin(2x) = 2·sin(x)·cos(x)] hatırla. Bu soruda elindeki ifadeyi sinüs ve kosinüs cinsinden tek bir fonksiyona dönüştürebilir misin? Deneyip bana ne bulduğunu yazar mısın?`;
  }

  if (lower.includes('integral') || lower.includes('türev') || lower.includes('turev')) {
    return `Harika bir konu ${studentName}! 🎯 Türev ve integral aslında birbirinin ters işlemi. İntegral alırken her zaman "Neyin türevi bana bu içerideki fonksiyonu verir?" diye düşün.\n\n✨ İpucu: Eğer değişken dönüşümü (u-dönüşümü) yapman gerekiyorsa, türevi de ifadenin içinde olan parçaya 'u' de. Sence bu soruda hangisine 'u' demek işimizi kolaylaştırır?`;
  }

  if (lower.includes('ödev') || lower.includes('odev') || lower.includes('hatırlat') || lower.includes('hatirlat') || lower.includes('teslim')) {
    return `Hemen kontrol ediyorum ${studentName}! 📝 Şu an yaklaşan ödevin: İntegral Alan Hesabı (Test 7 & 8). Son teslim tarihi 14 Ekim!\n\nÇözümleri fotoğraf çekip uygulamadan yüklemeyi unutma. Takıldığın bir soru olursa fotoğrafını çekip bana sorabilirsin! 💪`;
  }

  if (lower.includes('motivasyon') || lower.includes('yoruldum') || lower.includes('yapamıyorum') || lower.includes('yapamiyorum')) {
    return `Bazen zorlanmak çok normal ${studentName}, bu geliştiğinin en büyük kanıtı! 🌟 Beynimiz tam da zorlandığı anlarda yeni nöron bağları kurar.\n\nAhmet Hoca ile tamamladığın dersler ve çözdüğün her soru seni hedefine bir adım daha yaklaştırıyor. Şimdi derin bir nefes al, kısa bir su molası ver ve tekrar deneyelim. Ben buradayım, başaracaksın! ✨`;
  }

  return `Merhaba ${studentName}! 💡 Soruna birlikte bakalım: Bu soruyu çözmek için önce eldeki verileri ve senden tam olarak ne istendiğini listeleyelim.\n\nÖğretmeninin derste vurguladığı temel kuralı hatırla: İlk adımı sen at, takıldığın noktada ben sana bir sonraki ipucunu vereceğim. Hangi adımdan başlamak istersin?`;
}
