# 排行榜後端（Cloudflare Workers + D1）

遊戲本身是靜態網頁，所以「大家都看得到」的排行榜需要一個小後端。這個資料夾就是它，
用 Cloudflare 的免費額度就夠用（每天 10 萬次請求、5GB 資料庫）。

沒部署這個後端時，遊戲會自動改用「本機排行榜」（只有你的紀錄加上電腦對手）。

## 部署步驟（只要做一次）

1. 到 https://dash.cloudflare.com/sign-up 註冊免費帳號。
2. 在這個資料夾裡執行：

   ```bash
   cd leaderboard-worker
   npx wrangler login
   npx wrangler d1 create neon-leaderboard
   ```

   把指令印出來的 `database_id` 貼到 `wrangler.toml` 取代 `REPLACE_WITH_YOUR_DATABASE_ID`。

3. 建立資料表並部署：

   ```bash
   npx wrangler d1 execute neon-leaderboard --remote --file=schema.sql
   npx wrangler deploy
   ```

   最後會印出網址，例如 `https://neon-night-market-leaderboard.<你的帳號>.workers.dev`。

4. 打包遊戲時把網址帶進去：

   ```bash
   NEXT_PUBLIC_LEADERBOARD_URL=https://neon-night-market-leaderboard.<你的帳號>.workers.dev pnpm build
   ```

5. （建議）上線後把 `wrangler.toml` 的 `ALLOWED_ORIGINS` 改成遊戲實際的網址，
   例如 `https://你的遊戲.itch.io,https://html-classic.itch.zone`，再 `npx wrangler deploy` 一次。

## API

- `GET /board?country=taipei` → 該國前 50 名 `{ entries: [{ pid, name, score }] }`
- `POST /submit` `{ country, score, playerId, name }` → 只保留每位玩家在每國的最高分

## 已知限制

分數是玩家的瀏覽器算的，有心人可以偽造。後端已擋掉格式錯誤與不合理的超大分數，
但要完全防作弊需要伺服器端驗證整局遊戲，等玩家變多再考慮。
