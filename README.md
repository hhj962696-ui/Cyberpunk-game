# Cyberpunk-game

霓虹夜市：白天抽食材備料，晚上開店做菜賺錢的賽博龐克餐廳遊戲。

## 打包

```bash
pnpm install
pnpm build   # 靜態檔案輸出到 out/
```

## 線上試玩（GitHub Pages）

`.github/workflows/pages.yml` 會在每次推到 `main` 時自動打包並發佈到 GitHub Pages。第一次要到
Settings → Pages → Build and deployment，把 Source 選成「GitHub Actions」，之後網址是
`https://<帳號>.github.io/<repo 名稱>/`。

## 關卡

每 7 天是一個關卡，週末繳得出房租就過關。本週營收達房租 2 倍拿 2 星、3 倍拿 3 星，2 星以上有過關獎勵。
前 12 關各有名字和主題，之後是無盡關卡。越後面客人耐心越短、人越多、越挑嘴（菜單沒有最愛就不進門），
打烊後的突發事件也越常發生。數值在 `lib/game/stages.ts`。

## 線上排行榜

各地區業績排行榜需要一個小後端，程式在 `leaderboard-worker/`，部署步驟見那裡的 README。
部署後用 `NEXT_PUBLIC_LEADERBOARD_URL=<網址> pnpm build` 打包；沒設定時遊戲會用本機排行榜。

## 看廣告換獎勵（Rewarded ads）

The game shows rewarded ads through `lib/ads/rewarded-ads.ts`, which wraps the CrazyGames and Poki HTML5 SDKs behind one interface. Rewards (there are no real-money purchases):

- 白天：看廣告免費加抽一次食材（每天 2 次）
- 白天或打烊後：看廣告領信用點（每天 3 次，金額隨關卡變大）
- 過關拿到獎勵後：看廣告讓這關的獎勵加倍（每關 1 次）
- 營業中：看廣告讓全場客人耐心補滿（每晚 1 次），廣告播放時營業時間會暫停

Pick the portal at build time; each portal gets its own `out/` build:

```bash
NEXT_PUBLIC_AD_PROVIDER=crazygames pnpm build   # CrazyGames SDK v3
NEXT_PUBLIC_AD_PROVIDER=poki pnpm build         # Poki SDK v2
pnpm build                                      # local: no SDK, rewards are granted without an ad
```

If the SDK fails to load (ad blocker, offline), the game still plays and the reward buttons just log that no reward was given.
