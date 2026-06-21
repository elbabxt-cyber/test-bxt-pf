import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 단독 `vite`(npm run dev) 실행 시에도 /api 호출이 동작하도록
// wrangler 가 띄우는 Functions(8788)로 프록시한다.
// 풀스택은 `npm run start` 한 줄로 실행된다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
