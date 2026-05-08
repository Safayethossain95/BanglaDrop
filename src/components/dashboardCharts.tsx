import type { CSSProperties } from "react";

export type ChartDatum = {
  label: string;
  value: number;
  color: string;
  tone?: string;
};

type BarChartProps = {
  title: string;
  subtitle: string;
  data: ChartDatum[];
  valuePrefix?: string;
};

type DonutChartProps = {
  title: string;
  subtitle: string;
  centerLabel: string;
  centerValue: string;
  data: ChartDatum[];
};

export function BarChartCard({ title, subtitle, data, valuePrefix = "" }: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 flex h-52 items-end gap-3">
        {data.map((item) => {
          const height = Math.max((item.value / maxValue) * 100, item.value > 0 ? 12 : 6);

          return (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
              <span className="text-xs font-medium text-slate-500">
                {valuePrefix}
                {item.value}
              </span>
              <div className="flex h-full w-full items-end rounded-xl bg-slate-100/80 px-1.5 pb-1.5">
                <div
                  className="w-full rounded-lg transition-all"
                  style={{
                    height: `${height}%`,
                    background: item.color,
                  }}
                />
              </div>
              <span className="text-center text-xs font-medium text-slate-500">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DonutChartCard({ title, subtitle, centerLabel, centerValue, data }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const conic = buildConicGradient(data, total);
  const style: CSSProperties = {
    background: total > 0 ? conic : "conic-gradient(#e2e8f0 0deg 360deg)",
  };

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="relative mx-auto h-44 w-44 shrink-0">
          <div className="absolute inset-0 rounded-full" style={style} />
          <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(226,232,240,0.7)]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{centerLabel}</span>
            <span className="mt-2 text-2xl font-semibold text-slate-950">{centerValue}</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {data.map((item) => {
            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

            return (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-950">{item.value}</div>
                  <div className="text-xs text-slate-500">{percent}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function buildConicGradient(data: ChartDatum[], total: number) {
  if (total <= 0) return "conic-gradient(#e2e8f0 0deg 360deg)";

  let current = 0;
  const stops = data.map((item) => {
    const start = current;
    const slice = (item.value / total) * 360;
    current += slice;
    return `${item.color} ${start}deg ${current}deg`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}
