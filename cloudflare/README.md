# 꿈해몽 AI 보강 Worker

로컬 사전 매칭이 빈약할 때만 호출되는 Claude Haiku 프록시.
API 키는 프론트엔드에 노출되면 안 되므로 Cloudflare Workers에 secret으로 둔다.

## 준비물

- Cloudflare 계정 (무료)
- Anthropic API 키 — https://console.anthropic.com/settings/keys
- Node.js 18+
- `npm i -g wrangler`

## 배포

```bash
cd cloudflare
wrangler login
wrangler secret put ANTHROPIC_API_KEY   # 프롬프트에 키 붙여넣기
wrangler deploy
```

배포 완료 시 `https://bmslotteryshop-dream.<계정>.workers.dev` 같은 URL이 출력된다.

이 URL을 `index.html` 상단의 `DREAM_API_ENDPOINT` 상수에 넣고 커밋/푸시하면 하이브리드 호출이 활성화된다.

## 비용 상한

Cloudflare 대시보드 → Workers & Pages → 해당 Worker → Settings → **Usage model**에서 CPU time 제한, Anthropic Console에서 월 지출 상한을 걸어두자. Haiku 4.5 호출당 대략 ₩0.1 이하.

## 동작

프론트엔드가 다음 JSON을 POST:

```json
{ "text": "꿈 내용...", "matchedKeys": ["돼지", "돈"] }
```

Worker가 응답:

```json
{
  "symbols": [ { "key": "돼지", "meaning": "재물운의 상징" } ],
  "interpretation": "전체 해석 2~3 문장",
  "numbers": [3, 11, 19, 27, 34, 41]
}
```

호출 조건: 로컬 사전 매칭이 2건 미만 **그리고** 입력 10자 이상.
