/**
 * 보물섬 복권방 — 꿈해몽 AI 보강 Worker
 *
 * 프론트엔드에서 로컬 사전 매칭이 부족할 때만 호출된다.
 * Anthropic Claude Haiku 4.5로 꿈을 해석하고 1~45 범위 6개 번호를 받는다.
 *
 * 배포:
 *   1) wrangler login
 *   2) wrangler secret put ANTHROPIC_API_KEY   # 값 입력
 *   3) wrangler deploy
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405);
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'server_misconfigured' }, 500);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'invalid_json' }, 400); }

    const text = (body.text || '').toString().slice(0, 1000).trim();
    if (text.length < 4) return json({ error: 'text_too_short' }, 400);

    const matchedKeys = Array.isArray(body.matchedKeys) ? body.matchedKeys.slice(0, 8) : [];

    const prompt = [
      '당신은 전통 한국식 꿈해몽 전문가입니다. 아래 꿈을 읽고 작업하세요.',
      '',
      '1) 핵심 상징 2~4개를 추출하고 각 상징의 의미를 한 문장으로 설명',
      '2) 전체 해석을 2~3 문장으로 작성 (재물운/인간관계/변화의 관점)',
      '3) 1~45 사이에서 서로 다른 6개 숫자를 상징과 어울리게 추천',
      '',
      '반드시 아래 JSON 스키마로만 응답하세요. 다른 텍스트·코드블록 금지:',
      '{',
      '  "symbols": [ { "key": "상징어", "meaning": "의미" } ],',
      '  "interpretation": "전체 해석",',
      '  "numbers": [n1, n2, n3, n4, n5, n6]',
      '}',
      '',
      `참고 — 로컬 사전이 이미 잡은 키워드: ${matchedKeys.length ? matchedKeys.join(', ') : '(없음)'}`,
      '',
      '꿈 내용:',
      '"""',
      text,
      '"""',
    ].join('\n');

    let apiRes;
    try {
      apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
    } catch (e) {
      return json({ error: 'network', message: e.message }, 502);
    }

    if (!apiRes.ok) {
      const detail = (await apiRes.text()).slice(0, 400);
      return json({ error: 'upstream', status: apiRes.status, detail }, 502);
    }

    let data;
    try { data = await apiRes.json(); }
    catch { return json({ error: 'upstream_parse' }, 502); }

    const content = data?.content?.[0]?.text || '';
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return json({ error: 'parse', raw: content.slice(0, 300) }, 502);

    let parsed;
    try { parsed = JSON.parse(match[0]); }
    catch { return json({ error: 'json_syntax', raw: match[0].slice(0, 300) }, 502); }

    const raw = Array.isArray(parsed.numbers) ? parsed.numbers : [];
    const clean = [];
    for (const v of raw) {
      const n = parseInt(v, 10);
      if (Number.isInteger(n) && n >= 1 && n <= 45 && !clean.includes(n)) clean.push(n);
      if (clean.length >= 6) break;
    }
    while (clean.length < 6) {
      const r = 1 + Math.floor(Math.random() * 45);
      if (!clean.includes(r)) clean.push(r);
    }
    clean.sort((a, b) => a - b);

    const symbols = Array.isArray(parsed.symbols)
      ? parsed.symbols
          .filter(s => s && typeof s.key === 'string' && typeof s.meaning === 'string')
          .slice(0, 6)
          .map(s => ({ key: s.key.slice(0, 40), meaning: s.meaning.slice(0, 200) }))
      : [];

    return json({
      symbols,
      interpretation: (parsed.interpretation || '').toString().slice(0, 800),
      numbers: clean,
    }, 200);
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...CORS },
  });
}
