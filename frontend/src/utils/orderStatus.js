import {
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaTruck,
    FaBox,
} from "react-icons/fa";

export const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];

export const ORDER_STATUS_CONFIG = {
    PENDING: {
        label: "Pending",
        badgeClassName: "bg-amber-100 text-amber-700",
        chartColor: "#f59e0b",
        icon: FaClock,
    },
    CONFIRMED: {
        label: "Confirmed",
        badgeClassName: "bg-blue-100 text-blue-700",
        chartColor: "#3b82f6",
        icon: FaCheckCircle,
    },
    SHIPPED: {
        label: "Shipped",
        badgeClassName: "bg-violet-100 text-violet-700",
        chartColor: "#8b5cf6",
        icon: FaTruck,
    },
    DELIVERED: {
        label: "Delivered",
        badgeClassName: "bg-green-100 text-green-700",
        chartColor: "#10b981",
        icon: FaCheckCircle,
    },
    CANCELLED: {
        label: "Cancelled",
        badgeClassName: "bg-red-100 text-red-700",
        chartColor: "#ef4444",
        icon: FaTimesCircle,
    },
};

const DEFAULT_STATUS_CONFIG = {
    label: "Unknown",
    badgeClassName: "bg-slate-100 text-slate-700",
    chartColor: "#3b82f6",
    icon: FaBox,
};

export const getStatusConfig = (status) =>
    (status && ORDER_STATUS_CONFIG[status]) || DEFAULT_STATUS_CONFIG;

export const statusLabel = (status) => getStatusConfig(status).label;

export const STATUS_CHART_COLORS = Object.fromEntries(
    Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => [k, v.chartColor])
);
