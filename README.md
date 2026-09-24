# 欢迎小铺：迎新随机分组

一个用于迎新会的实时随机分组网站。管理员创建活动、添加约束并开始抽签；观众通过公开链接同步观看动画和最终结果。

## 本地运行

```powershell
npm install
npm run dev
```

未配置 Supabase 时可作为视觉与分组算法演示运行；活动不会云端保存。

## 部署上线

1. 创建 Supabase 项目，在 SQL Editor 执行 [`supabase/schema.sql`](./supabase/schema.sql)。
2. 在 Authentication > Providers 启用 Email（Magic Link）。
3. 复制 `.env.example` 为 `.env.local`，填入项目 URL 和 anon key。
4. 将仓库导入 Vercel，添加相同的两个环境变量并部署。

部署后管理员以邮箱登录。保存活动会生成长期公开链接，浏览器打开该链接的人会通过 Supabase Realtime 收到管理员抽签状态和结果更新。
