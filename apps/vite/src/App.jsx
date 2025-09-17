
import React, { useEffect, useMemo, useState } from "react";
import { Download, Upload, Plus, Trash2, FileUp, FileDown, RefreshCcw, FileSpreadsheet, FileText } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, PieChart as RePieChart } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// --- Small UI helpers ---
const Badge = ({ children, intent = "neutral" }) => {
  const map = {
    neutral: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[intent]}`}>{children}</span>;
};

const Card = ({ title, subtitle, children }) => (
  <div className="bg-white shadow-sm rounded-2xl p-4 border border-gray-100">
    <div className="mb-3">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// --- Types & Defaults ---
const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"];
const sampleBuyers = ["黃文衍","劉哲志"];
const sampleCategories = ["電競零組件","系統","筆電","外設","網通","配件"];

const DEFAULT_ROWS = [
  { id: crypto.randomUUID(), year: new Date().getFullYear(), month: "09", buyer: "黃文衍", category: "電競零組件", salesTarget: 12000000, salesActual: 10250000, gpTarget: 1320000, gpActual: 1180000, notes: "9月拉貨不及，10月補" },
];

// --- Utils ---
const fmt = (n) => (isNaN(n) ? "-" : n.toLocaleString());
const pct = (num, den) => (!den ? 0 : Math.round((num / den) * 1000) / 10);
const clampNum = (v) => (Number.isFinite(+v) ? +v : 0);

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

// --- Main Component ---
export default function App() {
  const thisYear = new Date().getFullYear();
  const [rows, setRows] = useLocalStorage("kpi_rows_v1", DEFAULT_ROWS);
  const [year, setYear] = useLocalStorage("kpi_year_v1", thisYear);
  const [month, setMonth] = useLocalStorage("kpi_month_v1", new Date().toLocaleString("zh-TW", { month: "2-digit" }));
  const [buyers, setBuyers] = useLocalStorage("kpi_buyers_v1", sampleBuyers);
  const [categories, setCategories] = useLocalStorage("kpi_categories_v1", sampleCategories);

  // KPI 設定
  const [settings, setSettings] = useLocalStorage("kpi_settings_v1", { salesWeight: 70, gpWeight: 30, green: 100, yellow: 95 });

  const filtered = useMemo(() => rows.filter(r => r.year === year && r.month === month), [rows, year, month]);

  const totals = useMemo(() => {
    const st = filtered.reduce((a,r)=>a+clampNum(r.salesTarget),0);
    const sa = filtered.reduce((a,r)=>a+clampNum(r.salesActual),0);
    const gt = filtered.reduce((a,r)=>a+clampNum(r.gpTarget),0);
    const ga = filtered.reduce((a,r)=>a+clampNum(r.gpActual),0);
    const sRate = pct(sa,st), gRate=pct(ga,gt);
    const comp = Math.round((sRate*settings.salesWeight/100 + gRate*settings.gpWeight/100)*10)/10;
    return {st,sa,gt,ga,sRate,gRate,comp};
  },[filtered,settings]);

  // Cross matrix
  const matrix = useMemo(()=>{
    const bList = Array.from(new Set(filtered.map(r=>r.buyer)));
    const cList = Array.from(new Set(filtered.map(r=>r.category)));
    const map={};
    bList.forEach(b=>{map[b]={};cList.forEach(c=>map[b][c]={st:0,sa:0});});
    filtered.forEach(r=>{map[r.buyer][r.category].st+=clampNum(r.salesTarget);map[r.buyer][r.category].sa+=clampNum(r.salesActual);});
    return {bList,cList,map};
  },[filtered]);

  // Export XLSX
  const exportXLSX = ()=>{
    const ws = XLSX.utils.json_to_sheet(filtered.map(r=>({
      年: r.year, 月: r.month, 採購: r.buyer, 類別: r.category,
      Sales目標: r.salesTarget, Sales實績: r.salesActual,
      GP目標: r.gpTarget, GP實績: r.gpActual, 備註: r.notes||""
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${year}-${month}`);
    XLSX.writeFile(wb, `kpi-${year}-${month}.xlsx`);
  };

  // Export PDF
  const exportPDF = ()=>{
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(12);
    doc.text(`本月 KPI 報表 ${year}/${month}`, 14, 15);
    doc.autoTable({
      head: [["年","月","採購","類別","Sales目標","Sales實績","GP目標","GP實績","備註"]],
      body: filtered.map(r=>[r.year,r.month,r.buyer,r.category,r.salesTarget,r.salesActual,r.gpTarget,r.gpActual,r.notes||""])
    });
    doc.save(`kpi-${year}-${month}.pdf`);
  };

  const RateBadge = ({rate})=>{
    const {green,yellow} = settings;
    const intent = rate>=green?"green": rate>=yellow?"yellow":"red";
    return <Badge intent={intent}>{rate.toFixed(1)}%</Badge>;
  };

  return (
    <div className="p-4 space-y-4">
      <Card title="設定">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">年度</label>
            <input type="number" value={year} onChange={e=>setYear(clampNum(e.target.value))} className="w-full px-2 py-1.5 rounded-xl border"/>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">月份</label>
            <select value={month} onChange={e=>setMonth(e.target.value)} className="w-full px-2 py-1.5 rounded-xl border bg-white">
              {MONTHS.map(m=> <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>Sales 權重%</label>
            <input type="number" value={settings.salesWeight} onChange={e=>setSettings({...settings,salesWeight:clampNum(e.target.value)})}/>
          </div>
          <div>
            <label>GP 權重%</label>
            <input type="number" value={settings.gpWeight} onChange={e=>setSettings({...settings,gpWeight:clampNum(e.target.value)})}/>
          </div>
          <div>
            <label>綠燈 ≥</label>
            <input type="number" value={settings.green} onChange={e=>setSettings({...settings,green:clampNum(e.target.value)})}/>
          </div>
          <div>
            <label>黃燈 ≥</label>
            <input type="number" value={settings.yellow} onChange={e=>setSettings({...settings,yellow:clampNum(e.target.value)})}/>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border">
          <div className="text-xs text-slate-500 mb-2">即時預覽</div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <RateBadge rate={settings.green+2}/>
              <span className="text-xs text-slate-600">高於綠燈 ({(settings.green+2).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <RateBadge rate={settings.yellow+1}/>
              <span className="text-xs text-slate-600">介於黃/綠 ({(settings.yellow+1).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <RateBadge rate={Math.max(0,settings.yellow-2)}/>
              <span className="text-xs text-slate-600">低於黃燈 ({Math.max(0,settings.yellow-2).toFixed(1)}%)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge intent="green">≥ {settings.green}% 綠燈</Badge>
          <Badge intent="yellow">≥ {settings.yellow}% 黃燈</Badge>
          <Badge intent="red">&lt; {settings.yellow}% 紅燈</Badge>
        </div>
      </Card>

      <Card title="彙總">
        <p>Sales: {fmt(totals.sa)} / {fmt(totals.st)} <RateBadge rate={totals.sRate}/></p>
        <p>GP: {fmt(totals.ga)} / {fmt(totals.gt)} <RateBadge rate={totals.gRate}/></p>
        <p>複合達成率: {totals.comp.toFixed(1)}% <RateBadge rate={totals.comp}/></p>
      </Card>

      <Card title="交叉彙總 (採購×類別)">
        <table className="min-w-full text-sm">
          <thead>
            <tr><th>採購/類別</th>{matrix.cList.map(c=><th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {matrix.bList.map(b=>(
              <tr key={b}>
                <td>{b}</td>
                {matrix.cList.map(c=>{
                  const cell=matrix.map[b][c];
                  const rate=pct(cell.sa,cell.st);
                  return <td key={c}>{fmt(cell.sa)}/{fmt(cell.st)} <RateBadge rate={rate}/></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="下載報表">
        <div className="flex gap-2">
          <button onClick={exportXLSX} className="px-3 py-1 bg-slate-200 rounded">XLSX</button>
          <button onClick={exportPDF} className="px-3 py-1 bg-slate-200 rounded">PDF</button>
        </div>
      </Card>
    </div>
  );
}
