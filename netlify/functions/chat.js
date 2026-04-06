exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 800,
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant RH expert francophone spécialisé dans le droit du travail français, la paie, le recrutement et la gestion des ressources humaines. Tu travailles pour le portfolio Ascendia RH de N. Keddari, étudiante en Master RH à Montpellier.

Réponds toujours en français, de manière claire, précise et professionnelle. Utilise des émojis avec modération. Pour les sujets juridiques, rappelle que tes réponses sont informatives et non des conseils juridiques opposables.

Tu connais parfaitement les réformes 2026 : SMIC à 12,02€/h, RGDU (ex-réduction Fillon), transparence salariale (directive EU 2023/970), emploi seniors (loi n°2025-989), congé de naissance (effectif juillet 2026), CDD reconversion (décret 2026-39). Sois concis (5-8 lignes max sauf si on te demande un développement).`
          },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Erreur API Groq');
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Je n'ai pas pu générer une réponse.";

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
