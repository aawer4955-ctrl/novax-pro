"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";

export type KlinePoint = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type KlineChartProps = {
  data: KlinePoint[];
};

export function KlineChart({ data }: KlineChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      height: 340,
      layout: {
        attributionLogo: false,
        background: { type: ColorType.Solid, color: "#050814" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.08)" },
        horzLines: { color: "rgba(148, 163, 184, 0.08)" },
      },
      rightPriceScale: {
        borderColor: "rgba(148, 163, 184, 0.18)",
        visible: true,
      },
      timeScale: {
        borderColor: "rgba(148, 163, 184, 0.18)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current?.clientWidth ?? 0 });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;
    const chartData: CandlestickData<Time>[] = data.map((item) => ({
      time: item.time as Time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));
    seriesRef.current.setData(chartData);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div className="relative min-h-[320px] w-full rounded-2xl bg-[#050814]">
      <div ref={containerRef} className="min-h-[320px] w-full rounded-2xl" />
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-400">
          Loading market chart...
        </div>
      )}
    </div>
  );
}
