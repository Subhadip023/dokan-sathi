import React, { useState, useMemo, useRef } from 'react';
import { FaChartLine, FaRupeeSign, FaBox, FaPiggyBank, FaCalendarDay } from 'react-icons/fa';

export default function SalesGraph({ salesChartData = {}, isOwner = true }) {
    const [range, setRange] = useState('30days'); // '7days', '30days', '12months'
    const [metric, setMetric] = useState('revenue'); // 'revenue', 'packets', 'profit'
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const svgRef = useRef(null);

    // Pick dataset based on selected range
    const rawData = useMemo(() => {
        if (range === '7days') return salesChartData.last7Days || [];
        if (range === '12months') return salesChartData.last12Months || [];
        return salesChartData.last30Days || [];
    }, [range, salesChartData]);

    // Format helper for numbers
    const formatCurrency = (val) => {
        return '₹' + Number(val || 0).toLocaleString('en-IN', {
            maximumFractionDigits: 0,
        });
    };

    // Calculate chart points and summary stats
    const {
        points,
        maxValue,
        totalMetricValue,
        averageValue,
        peakItem,
        totalInvoices,
        hasData,
    } = useMemo(() => {
        if (!rawData || rawData.length === 0) {
            return {
                points: [],
                maxValue: 100,
                totalMetricValue: 0,
                averageValue: 0,
                peakItem: null,
                totalInvoices: 0,
                hasData: false,
            };
        }

        const values = rawData.map(d => Number(d[metric] || 0));
        const maxVal = Math.max(...values, 10);
        const total = values.reduce((acc, v) => acc + v, 0);
        const avg = values.length > 0 ? total / values.length : 0;
        const peakIdx = values.indexOf(Math.max(...values));
        const peak = rawData[peakIdx] || null;
        const totalInvs = rawData.reduce((acc, d) => acc + (d.invoices_count || 0), 0);
        const someData = total > 0;

        // Chart dimensions for SVG
        const width = 800;
        const height = 240;
        const padX = 40;
        const padTop = 30;
        const padBottom = 35;
        const usableWidth = width - padX * 2;
        const usableHeight = height - padTop - padBottom;

        const count = rawData.length;
        const stepX = count > 1 ? usableWidth / (count - 1) : usableWidth;

        // Y-axis scaling ceiling with nice round numbers
        const yMax = Math.ceil((maxVal * 1.15) / 10) * 10 || 10;

        const pts = rawData.map((d, i) => {
            const val = Number(d[metric] || 0);
            const x = padX + i * stepX;
            const y = padTop + usableHeight - (val / yMax) * usableHeight;
            return { x, y, data: d, value: val };
        });

        return {
            points: pts,
            maxValue: yMax,
            totalMetricValue: total,
            averageValue: avg,
            peakItem: peak,
            totalInvoices: totalInvs,
            hasData: someData,
        };
    }, [rawData, metric]);

    // Build smooth cubic bezier path
    const { linePath, areaPath } = useMemo(() => {
        if (points.length === 0) return { linePath: '', areaPath: '' };
        if (points.length === 1) {
            const p = points[0];
            return {
                linePath: `M ${p.x} ${p.y} L ${p.x + 1} ${p.y}`,
                areaPath: `M ${p.x} 205 L ${p.x} ${p.y} L ${p.x + 1} ${p.y} L ${p.x + 1} 205 Z`,
            };
        }

        const height = 240;
        const padBottom = 35;
        const baselineY = height - padBottom;

        let path = `M ${points[0].x},${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            const controlPointX = (current.x + next.x) / 2;

            path += ` C ${controlPointX},${current.y} ${controlPointX},${next.y} ${next.x},${next.y}`;
        }

        const area = `${path} L ${points[points.length - 1].x},${baselineY} L ${points[0].x},${baselineY} Z`;

        return { linePath: path, areaPath: area };
    }, [points]);

    // Colors according to selected metric
    const colorScheme = useMemo(() => {
        if (metric === 'profit') {
            return {
                primary: '#8b5cf6', // Violet
                gradientStart: 'rgba(139, 92, 246, 0.45)',
                gradientEnd: 'rgba(139, 92, 246, 0.0)',
                textClass: 'text-purple-600',
                bgLightClass: 'bg-purple-50 text-purple-700 border-purple-200',
                activeTab: 'bg-purple-600 text-white shadow-sm',
                badge: 'bg-purple-100 text-purple-800',
            };
        }
        if (metric === 'packets') {
            return {
                primary: '#4f46e5', // Indigo
                gradientStart: 'rgba(79, 70, 229, 0.45)',
                gradientEnd: 'rgba(79, 70, 229, 0.0)',
                textClass: 'text-indigo-600',
                bgLightClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                activeTab: 'bg-indigo-600 text-white shadow-sm',
                badge: 'bg-indigo-100 text-indigo-800',
            };
        }
        return {
            primary: '#10b981', // Emerald
            gradientStart: 'rgba(16, 185, 129, 0.45)',
            gradientEnd: 'rgba(16, 185, 129, 0.0)',
            textClass: 'text-emerald-600',
            bgLightClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            activeTab: 'bg-emerald-600 text-white shadow-sm',
            badge: 'bg-emerald-100 text-emerald-800',
        };
    }, [metric]);

    // Mouse movement to find closest point for tooltip
    const handleMouseMove = (e) => {
        if (!svgRef.current || points.length === 0) return;
        const rect = svgRef.current.getBoundingClientRect();
        if (rect.width <= 0) return;

        const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const mouseX = fraction * 800;

        let closestIdx = 0;
        let minDiff = Infinity;
        for (let i = 0; i < points.length; i++) {
            const diff = Math.abs(points[i].x - mouseX);
            if (diff < minDiff) {
                minDiff = diff;
                closestIdx = i;
            }
        }
        setHoveredIndex(closestIdx);
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };

    const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

    // Y-axis tick intervals (4 levels)
    const yTicks = [0, 0.33, 0.66, 1].map(ratio => {
        const val = maxValue * ratio;
        const y = 30 + (240 - 30 - 35) * (1 - ratio);
        return { value: val, y };
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:p-6 mb-8 transition-all">
            {/* Top Controls Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
                <div>
                    <div className="flex items-center space-x-2">
                        <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                            <FaChartLine size={18} />
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">Sales Performance Graph</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            Interactive
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-9">
                        Track sales velocity, product volume, and profitability trends over time
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Metric Switcher Tabs */}
                    <div className="inline-flex rounded-lg bg-gray-100 p-1 border border-gray-200 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setMetric('revenue')}
                            className={`px-3 py-1.5 rounded-md flex items-center transition-all ${
                                metric === 'revenue' ? colorScheme.activeTab : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FaRupeeSign className="mr-1" size={10} /> Revenue
                        </button>
                        <button
                            type="button"
                            onClick={() => setMetric('packets')}
                            className={`px-3 py-1.5 rounded-md flex items-center transition-all ${
                                metric === 'packets' ? colorScheme.activeTab : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FaBox className="mr-1" size={10} /> Packets Sold
                        </button>
                        {isOwner && (
                            <button
                                type="button"
                                onClick={() => setMetric('profit')}
                                className={`px-3 py-1.5 rounded-md flex items-center transition-all ${
                                    metric === 'profit' ? colorScheme.activeTab : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <FaPiggyBank className="mr-1" size={10} /> Profit
                            </button>
                        )}
                    </div>

                    {/* Range Selector Switcher */}
                    <div className="inline-flex rounded-lg bg-gray-100 p-1 border border-gray-200 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setRange('7days')}
                            className={`px-3 py-1.5 rounded-md transition-all ${
                                range === '7days' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            7 Days
                        </button>
                        <button
                            type="button"
                            onClick={() => setRange('30days')}
                            className={`px-3 py-1.5 rounded-md transition-all ${
                                range === '30days' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            30 Days
                        </button>
                        <button
                            type="button"
                            onClick={() => setRange('12months')}
                            className={`px-3 py-1.5 rounded-md transition-all ${
                                range === '12months' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Monthly (1 Yr)
                        </button>
                    </div>
                </div>
            </div>

            {/* Metric Summary Ribbon Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
                <div className="p-3.5 rounded-lg bg-gray-50/80 border border-gray-200/80">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        Period Total {metric === 'revenue' ? 'Revenue' : metric === 'packets' ? 'Packets' : 'Profit'}
                    </span>
                    <p className={`text-xl font-bold font-mono mt-1 ${colorScheme.textClass}`}>
                        {metric === 'packets' ? `${totalMetricValue.toLocaleString()} pkts` : formatCurrency(totalMetricValue)}
                    </p>
                </div>

                <div className="p-3.5 rounded-lg bg-gray-50/80 border border-gray-200/80">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        {range === '12months' ? 'Monthly Average' : 'Daily Average'}
                    </span>
                    <p className="text-xl font-bold font-mono text-gray-800 mt-1">
                        {metric === 'packets' ? `${Math.round(averageValue)} pkts` : formatCurrency(averageValue)}
                    </p>
                </div>

                <div className="p-3.5 rounded-lg bg-gray-50/80 border border-gray-200/80">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        Peak {range === '12months' ? 'Month' : 'Day'}
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-1">
                        <p className="text-xl font-bold font-mono text-gray-900">
                            {peakItem
                                ? metric === 'packets'
                                    ? `${peakItem[metric]} pkts`
                                    : formatCurrency(peakItem[metric])
                                : '-'}
                        </p>
                        {peakItem && (
                            <span className="text-[11px] text-gray-500 font-medium">
                                ({peakItem.label})
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-3.5 rounded-lg bg-gray-50/80 border border-gray-200/80">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                        Total Invoices / Orders
                    </span>
                    <p className="text-xl font-bold font-mono text-indigo-700 mt-1">
                        {totalInvoices} <span className="text-xs text-gray-500 font-normal">invoices</span>
                    </p>
                </div>
            </div>

            {/* SVG Chart Area */}
            <div className="relative w-full overflow-hidden">
                {!hasData && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px]">
                        <FaCalendarDay className="h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-sm font-semibold text-gray-600">No Sales Recorded in this Timeframe</p>
                        <p className="text-xs text-gray-400 mt-0.5">Recorded invoices will populate this curve automatically.</p>
                    </div>
                )}

                <div className="w-full relative" style={{ touchAction: 'pan-y' }}>
                    <svg
                        ref={svgRef}
                        viewBox="0 0 800 240"
                        preserveAspectRatio="none"
                        className="w-full h-56 md:h-72 select-none overflow-visible block"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        <defs>
                            <linearGradient id={`areaGradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={colorScheme.gradientStart} />
                                <stop offset="100%" stopColor={colorScheme.gradientEnd} />
                            </linearGradient>
                        </defs>

                        {/* Horizontal Gridlines & Y-Axis Labels */}
                        {yTicks.map((tick, i) => (
                            <g key={i} className="pointer-events-none">
                                <line
                                    x1="40"
                                    y1={tick.y}
                                    x2="760"
                                    y2={tick.y}
                                    stroke="#f1f5f9"
                                    strokeDasharray="4 4"
                                    strokeWidth="1"
                                />
                                <text
                                    x="32"
                                    y={tick.y + 4}
                                    textAnchor="end"
                                    className="text-[10px] font-mono fill-gray-400"
                                >
                                    {metric === 'packets'
                                        ? `${Math.round(tick.value)}`
                                        : tick.value >= 1000
                                            ? `₹${Math.round(tick.value / 1000)}k`
                                            : `₹${Math.round(tick.value)}`}
                                </text>
                            </g>
                        ))}

                        {/* Baseline */}
                        <line x1="40" y1="205" x2="760" y2="205" stroke="#e2e8f0" strokeWidth="1" className="pointer-events-none" />

                        {/* Area Polygon */}
                        {hasData && (
                            <path
                                d={areaPath}
                                fill={`url(#areaGradient-${metric})`}
                                className="transition-all duration-300 ease-out pointer-events-none"
                            />
                        )}

                        {/* Spline Line */}
                        {hasData && (
                            <path
                                d={linePath}
                                fill="none"
                                stroke={colorScheme.primary}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-300 ease-out pointer-events-none"
                            />
                        )}

                        {/* Subtle Static Dot Markers along curve */}
                        {hasData && points.map((pt, i) => {
                            if (range === '30days' && i % 2 !== 0 && i !== points.length - 1) return null;
                            return (
                                <circle
                                    key={i}
                                    cx={pt.x}
                                    cy={pt.y}
                                    r="2.5"
                                    fill={colorScheme.primary}
                                    className="pointer-events-none opacity-60"
                                />
                            );
                        })}

                        {/* Hover Guideline & Indicator */}
                        {activePoint && hasData && (
                            <g className="pointer-events-none">
                                <line
                                    x1={activePoint.x}
                                    y1="25"
                                    x2={activePoint.x}
                                    y2="205"
                                    stroke={colorScheme.primary}
                                    strokeWidth="1.5"
                                    strokeDasharray="3 3"
                                />
                                {/* Outer Glow Circle */}
                                <circle
                                    cx={activePoint.x}
                                    cy={activePoint.y}
                                    r="8"
                                    fill={colorScheme.primary}
                                    fillOpacity="0.25"
                                />
                                {/* Solid Circle */}
                                <circle
                                    cx={activePoint.x}
                                    cy={activePoint.y}
                                    r="5"
                                    fill={colorScheme.primary}
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                />
                            </g>
                        )}

                        {/* X-Axis Date Labels */}
                        {points.map((pt, i) => {
                            const step = range === '30days' ? 5 : range === '7days' ? 1 : 2;
                            const isEdge = i === 0 || i === points.length - 1;
                            const shouldShow = i % step === 0 || isEdge;

                            if (!shouldShow) return null;

                            return (
                                <text
                                    key={i}
                                    x={pt.x}
                                    y="225"
                                    textAnchor="middle"
                                    className="text-[10px] font-medium fill-gray-400 select-none pointer-events-none"
                                >
                                    {pt.data.short_label}
                                </text>
                            );
                        })}

                        {/* Transparent Hit Zone Columns for every point */}
                        {hasData && points.map((pt, i) => {
                            const prevX = i > 0 ? (points[i - 1].x + pt.x) / 2 : 0;
                            const nextX = i < points.length - 1 ? (pt.x + points[i + 1].x) / 2 : 800;
                            const width = Math.max(1, nextX - prevX);

                            return (
                                <rect
                                    key={`hit-${i}`}
                                    x={prevX}
                                    y="0"
                                    width={width}
                                    height="240"
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onTouchStart={() => setHoveredIndex(i)}
                                />
                            );
                        })}
                    </svg>
                </div>

                {/* Floating Tooltip Card */}
                {activePoint && hasData && (
                    <div
                        className="absolute pointer-events-none z-30 transition-transform duration-75 ease-out"
                        style={{
                            left: `${(activePoint.x / 800) * 100}%`,
                            top: `${(activePoint.y / 240) * 100}%`,
                            transform: `translate(${
                                hoveredIndex <= 1 ? '0%' : hoveredIndex >= points.length - 2 ? '-100%' : '-50%'
                            }, -100%) translateY(-14px)`,
                        }}
                    >
                        <div className="bg-gray-900/95 text-white p-3 rounded-lg shadow-xl backdrop-blur-sm border border-gray-700 min-w-[170px] text-xs">
                            <div className="flex items-center justify-between border-b border-gray-700 pb-1.5 mb-2">
                                <span className="font-semibold text-gray-300">{activePoint.data.label}</span>
                                <span className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                    {activePoint.data.invoices_count || 0} order{activePoint.data.invoices_count === 1 ? '' : 's'}
                                </span>
                            </div>

                            <div className="space-y-1 font-mono">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-[11px]">Revenue:</span>
                                    <span className="font-bold text-emerald-400">₹{activePoint.data.revenue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-[11px]">Packets Sold:</span>
                                    <span className="text-indigo-300 font-bold">
                                        {activePoint.data.packets} pkts
                                        {activePoint.data.pieces > activePoint.data.packets && (
                                            <span className="text-gray-400 text-[10px] ml-1">({activePoint.data.pieces} pcs)</span>
                                        )}
                                    </span>
                                </div>
                                {isOwner && activePoint.data.profit !== null && activePoint.data.profit !== undefined && (
                                    <div className="flex justify-between items-center pt-1 border-t border-gray-800">
                                        <span className="text-gray-400 text-[11px]">Profit:</span>
                                        <span className="font-bold text-purple-400">₹{activePoint.data.profit.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
