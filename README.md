# Cyberpunk-game

## 看廣告換獎勵（Rewarded ads）

The game shows rewarded ads through `lib/ads/rewarded-ads.ts`, which wraps the CrazyGames and Poki HTML5 SDKs behind one interface. Rewards:

- 白天：看廣告免費加抽一次食材（每天 2 次）
- 營業中：看廣告讓全場客人耐心補滿（每晚 1 次），廣告播放時營業時間會暫停

Pick the portal at build time; each portal gets its own `out/` build:

```bash
NEXT_PUBLIC_AD_PROVIDER=crazygames pnpm build   # CrazyGames SDK v3
NEXT_PUBLIC_AD_PROVIDER=poki pnpm build         # Poki SDK v2
pnpm build                                      # local: no SDK, rewards are granted without an ad
```

If the SDK fails to load (ad blocker, offline), the game still plays and the reward buttons just log that no reward was given.
