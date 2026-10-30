# Cyberpunk-game

霓虹夜市：白天抽食材備料，晚上開店做菜賺錢的賽博龐克餐廳遊戲。

## 打包

```bash
pnpm install
pnpm build   # 靜態檔案輸出到 out/
```

## 線上排行榜

各地區業績排行榜需要一個小後端，程式在 `leaderboard-worker/`，部署步驟見那裡的 README。
部署後用 `NEXT_PUBLIC_LEADERBOARD_URL=<網址> pnpm build` 打包；沒設定時遊戲會用本機排行榜。
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
