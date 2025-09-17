# Sinya KPI 工具
每月 × 採購 × 產品類 KPI 儀表板。支援交叉彙總、達成率紅黃綠、XLSX/PDF 匯出、在地儲存。

## 專案結構
```
apps/
  ├─ vite/   # Vite + React 開發版（建議在此維護原始碼）
  └─ umd/    # 單一 HTML（可直接丟到任何靜態空間）
```

## 快速開始（Vite 版）
```bash
cd apps/vite
npm install
npm run dev
# build
npm run build
npm run preview
```

## 單檔（UMD）版
`apps/umd/index.html` 直接打開即可（需外網載入 CDN）。

## 功能
- 月份/年度切換、採購與類別維度
- 交叉彙總（採購 × 類別），每格顯示 Sales 實績 / 目標 + 達成%
- KPI 權重（Sales/GP）與紅黃綠門檻，可自定並自動保存
- XLSX/PDF 下載（含交叉彙總）
- localStorage 自動保存

## 授權
MIT


## 部署到 GitHub Pages
1. 到 GitHub Repo → **Settings → Pages**：
   - Source: **GitHub Actions**
2. 到 **Settings → Secrets and variables → Actions → Variables**：新增
   - `BASE_PATH`：若用「Project Site」，請填 `/<repo-name>/`（例如 `/sinya-kpi/`）。
     若用「User/Org Site」，可以 **留空**。
3. Push 到 `main`，Actions 會自動 build 並部署。

> 你也可以改 `apps/vite/package.json` 的 `homepage`，或直接在 `vite.config.js` 固定 `base:'/<repo-name>/'`。
