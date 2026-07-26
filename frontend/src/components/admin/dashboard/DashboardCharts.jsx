import React, { useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";
import { STATUS_CHART_COLORS, statusLabel } from "../../../utils/orderStatus";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const cardClass = "bg-white rounded-lg border border-slate-200 shadow-sm p-4";

const NoDataMessage = ({ message = "No data to display" }) => (
    <div className="flex flex-col items-center justify-center text-center"
        style={{ width: "100%", height: 220 }}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 3v18h18" />
            <path d="M7 16l4-4 3 3 5-6" strokeDasharray="3 3" />
            <path d="M3 21h18" />
        </svg>
        <p className="mt-3 text-slate-500 text-sm font-medium">{message}</p>
    </div>
);

export const DashboardCharts = ({ orders = [] }) => {
    const statusData = useMemo(() => {
        const map = new Map();
        (orders || []).forEach((o) => {
            const status = o.orderStatus || "UNKNOWN";
            map.set(status, (map.get(status) || 0) + 1);
        });
        return Array.from(map, ([name, value]) => ({ name, value }));
    }, [orders]);

    const revenueData = useMemo(() => {
        const map = new Map();
        (orders || []).forEach((o) => {
            if (!o.orderDate) return;
            const d = new Date(o.orderDate);
            if (isNaN(d.getTime())) return;
            const key = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
            map.set(key, (map.get(key) || 0) + (Number(o.totalAmount) || 0));
        });
        return Array.from(map, ([date, revenue]) => ({ date, revenue }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [orders]);

    const topProductsData = useMemo(() => {
        const map = new Map();
        (orders || []).forEach((o) => {
            (o.orderItems || []).forEach((it) => {
                const name = it.product?.productName || "—";
                const qty = Number(it.quantity) || 0;
                map.set(name, (map.get(name) || 0) + qty);
            });
        });
        return Array.from(map, ([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 7);
    }, [orders]);

    const hasStatus = statusData.length > 0;
    const hasRevenue = revenueData.length > 0;
    const hasProducts = topProductsData.length > 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className={`${cardClass} lg:col-span-2`}>
                <h3 className="text-slate-800 font-semibold mb-3">Revenue over time</h3>
                <div style={{ width: "100%", height: 280 }}>
                    {hasRevenue ? (
                        <ResponsiveContainer>
                            <AreaChart data={revenueData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, "Revenue"]} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#revGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <NoDataMessage message="No revenue data to display" />
                    )}
                </div>
            </div>

            <div className={cardClass}>
                <h3 className="text-slate-800 font-semibold mb-3">Orders by status</h3>
                <div style={{ width: "100%", height: 260 }}>
                    {hasStatus ? (
                        <ResponsiveContainer>
                            <BarChart data={statusData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickFormatter={statusLabel} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {statusData.map((entry) => (
                            <Cell
                                key={entry.name}
                                fill={STATUS_CHART_COLORS[entry.name] || "#3b82f6"}
                            />
                        ))}
                    </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <NoDataMessage message="No orders to display" />
                    )}
                </div>
            </div>

            <div className={cardClass}>
                <h3 className="text-slate-800 font-semibold mb-3">Top products (by units sold)</h3>
                <div style={{ width: "100%", height: 260 }}>
                    {hasProducts ? (
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={topProductsData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={45}
                                    paddingAngle={2}
                                >
                                    {topProductsData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v, n) => [`${v} units`, n]} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <NoDataMessage message="No products to display" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
