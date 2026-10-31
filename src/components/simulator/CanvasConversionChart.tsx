import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Globe,
  Database,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { SupportedCurrency } from '../../types/wallet';
import type { ExchangeRateResult } from '../../types/exchange';
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_CONFIGS,
  formatMinorUnits,
} from '../../utils/currency';
import { getExchangeRate, convertCurrencyAmount } from '../../services/exchangeService';

// Standard benchmark source credit amounts to plot
const BENCHMARK_AMOUNTS = [10, 25, 50, 100, 250, 500, 1000];

export const CanvasConversionChart: React.FC = () => {
  const [sourceCurrency, setSourceCurrency] = useState<SupportedCurrency>('USD');
  const [destCurrency, setDestCurrency] = useState<SupportedCurrency>('INR');
  const [rateResult, setRateResult] = useState<ExchangeRateResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fetchRate = useCallback(async (base: SupportedCurrency, quote: SupportedCurrency) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getExchangeRate(base, quote);
      setRateResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve exchange rate');
      setRateResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRate(sourceCurrency, destCurrency);
  }, [sourceCurrency, destCurrency, fetchRate]);

  // Render chart onto Canvas
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !rateResult) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = 300;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Padding for axis labels
    const padding = { top: 30, right: 30, bottom: 50, left: 70 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Compute data points using exact BigInt conversion
    const srcConfig = CURRENCY_CONFIGS[sourceCurrency];
    const destConfig = CURRENCY_CONFIGS[destCurrency];
    const srcDecimals = srcConfig ? srcConfig.fractionDigits : 2;
    const destDecimals = destConfig ? destConfig.fractionDigits : 2;

    const points = BENCHMARK_AMOUNTS.map((amt) => {
      const srcMinor = amt * 10 ** srcDecimals;
      const destMinor = convertCurrencyAmount(srcMinor, sourceCurrency, destCurrency, rateResult.rate);
      const destMajor = destMinor / 10 ** destDecimals;
      return { src: amt, dest: destMajor, srcMinor, destMinor };
    });

    const maxSrc = Math.max(...points.map((p) => p.src));
    const maxDest = Math.max(...points.map((p) => p.dest));

    // Draw grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#f1f1ee';
    const gridYCount = 5;
    for (let i = 0; i <= gridYCount; i++) {
      const y = padding.top + (chartHeight / gridYCount) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis numerical labels
      const val = maxDest * (1 - i / gridYCount);
      ctx.fillStyle = '#8e8e93';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(val.toFixed(destDecimals > 0 ? 0 : 0), padding.left - 8, y);
    }

    // Coordinates mapper
    const getX = (srcVal: number) => padding.left + (srcVal / maxSrc) * chartWidth;
    const getY = (destVal: number) => padding.top + chartHeight - (destVal / maxDest) * chartHeight;

    // Draw gradient area under the curve
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.18)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.01)');

    ctx.beginPath();
    ctx.moveTo(getX(points[0].src), getY(points[0].dest));
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(getX(points[i].src), getY(points[i].dest));
    }
    ctx.lineTo(getX(points[points.length - 1].src), padding.top + chartHeight);
    ctx.lineTo(getX(points[0].src), padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.moveTo(getX(points[0].src), getY(points[0].dest));
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(getX(points[i].src), getY(points[i].dest));
    }
    ctx.stroke();

    // Draw points & X-axis labels
    points.forEach((pt, index) => {
      const px = getX(pt.src);
      const py = getY(pt.dest);

      // Point circle
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4f46e5';
      ctx.stroke();

      // X-axis label
      ctx.fillStyle = '#71717a';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${pt.src}`, px, padding.top + chartHeight + 10);

      // Label on highest points for clarity
      if (index === points.length - 1 || index === 3) {
        ctx.fillStyle = '#1e1b4b';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(formatMinorUnits(pt.destMinor, destCurrency), px, py - 12);
      }
    });

    // Axis titles
    ctx.fillStyle = '#52525b';
    ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Source Amount (${sourceCurrency})`,
      padding.left + chartWidth / 2,
      height - 12
    );

    ctx.save();
    ctx.translate(16, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`Converted Destination Amount (${destCurrency})`, 0, 0);
    ctx.restore();
  }, [rateResult, sourceCurrency, destCurrency]);

  useEffect(() => {
    drawChart();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      drawChart();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [drawChart]);

  return (
    <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Exchange Rate Conversion Curve</h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Native HTML Canvas plot of source credits vs deterministic converted value
          </p>
        </div>

        {/* Currency Pair Pickers */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <select
            value={sourceCurrency}
            onChange={(e) => setSourceCurrency(e.target.value as SupportedCurrency)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-mono font-bold text-stone-800 focus:outline-hidden focus:bg-white"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />

          <select
            value={destCurrency}
            onChange={(e) => setDestCurrency(e.target.value as SupportedCurrency)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-mono font-bold text-stone-800 focus:outline-hidden focus:bg-white"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchRate(sourceCurrency, destCurrency)}
            disabled={loading}
            className="p-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 transition-colors"
            title="Refresh exchange rate"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Rate Status Banner */}
      {rateResult && !error && (
        <div className="flex flex-wrap items-center justify-between text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200/80 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900">
              1 {sourceCurrency} = {rateResult.rate.toFixed(4)} {destCurrency}
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">Effective Date: {rateResult.date}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            {rateResult.source === 'api' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                <Globe className="w-3 h-3 text-emerald-600" />
                <span>Frankfurter V2 (Live)</span>
              </span>
            ) : rateResult.source === 'cache' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                <Database className="w-3 h-3 text-amber-600" />
                <span>IndexedDB Cache</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 font-semibold">
                <span>Identity Rate (1.0)</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Canvas Chart Area */}
      <div ref={containerRef} className="w-full relative min-h-[300px] flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        )}

        {error ? (
          <div className="text-center py-12 text-stone-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-xs font-semibold text-stone-800">Conversion Rate Unavailable</p>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto">{error}</p>
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full rounded-xl" />
        )}
      </div>
    </div>
  );
};
