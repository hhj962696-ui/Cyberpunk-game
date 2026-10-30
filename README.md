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
