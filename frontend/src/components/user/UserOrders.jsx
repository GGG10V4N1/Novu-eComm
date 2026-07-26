import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
    FaBox,
    FaArrowLeft,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaCreditCard,
} from "react-icons/fa";
import {
    getUserOrders,
    getUserOrderDetail,
    clearUserOrderDetail,
} from "../../store/actions";
import { getStatusConfig, statusLabel } from "../../utils/orderStatus";
import Loader from "../shared/Loader";
import Paginations from "../shared/Paginations";

const getStatusStyle = (status) => {
    const cfg = getStatusConfig(status);
    return { icon: cfg.icon, className: cfg.badgeClassName };
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const UserOrders = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const { userOrders, userOrderPagination: pagination, userOrderDetail } =
        useSelector((state) => state.order);
    const [showDetail, setShowDetail] = useState(false);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const currentPage = searchParams.get("page")
        ? Number(searchParams.get("page"))
        : 1;

    useEffect(() => {
        let cancelled = false;
        setShowDetail(false);
        setListLoading(true);
        setListError(null);
        dispatch(clearUserOrderDetail());

        const params = new URLSearchParams();
        params.set("pageNumber", currentPage - 1);
        params.set("pageSize", "10");

        (async () => {
            try {
                await dispatch(getUserOrders(params.toString()));
                if (!cancelled) setListLoading(false);
            } catch (err) {
                if (!cancelled) {
                    setListLoading(false);
                    setListError(
                        err?.response?.data?.message ||
                            "Failed to fetch your orders"
                    );
                }
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, searchParams]);

    useEffect(() => {
        return () => {
            dispatch(clearUserOrderDetail());
        };
    }, [dispatch]);

    const handleViewDetail = async (orderId) => {
        setShowDetail(true);
        setDetailLoading(true);
        try {
            await dispatch(getUserOrderDetail(orderId));
        } finally {
            setDetailLoading(false);
        }
    };

    const handleBackToList = () => {
        setShowDetail(false);
        dispatch(clearUserOrderDetail());
    };

    // ----- DETAIL VIEW -----
    if (showDetail) {
        if (detailLoading || !userOrderDetail) {
            return (
                <div className="lg:px-14 sm:px-8 px-4 py-14 max-w-5xl mx-auto">
                    <Loader text="Loading order details" />
                </div>
            );
        }
        const order = userOrderDetail;
        const StatusIcon = getStatusStyle(order.orderStatus).icon;
        return (
            <div className="lg:px-14 sm:px-8 px-4 py-14 max-w-5xl mx-auto">
                <button
                    onClick={handleBackToList}
                    className="inline-flex items-center gap-2 mb-6 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                    <FaArrowLeft />
                    Back to orders
                </button>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-slate-200">
                        <div>
                            <h1 className="text-slate-800 text-2xl font-bold">
                                Order #{order.orderId}
                            </h1>
                            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                                <FaCalendarAlt size={12} />
                                {formatDate(order.orderDate)}
                            </p>
                        </div>
                        <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusStyle(order.orderStatus).className}`}>
                            <StatusIcon size={13} />
                            {statusLabel(order.orderStatus)}
                        </span>
                    </div>

                    {order.payment && (
                        <div className="p-6 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <FaCreditCard className="text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                        Payment method
                                    </p>
                                    <p className="text-slate-800 font-medium">
                                        {order.payment.method || "—"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaMoneyBillWave className="text-slate-500" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                        Payment status
                                    </p>
                                    <p className="text-slate-800 font-medium">
                                        {order.payment.pgStatus || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-6">
                        <h2 className="text-slate-800 text-lg font-bold mb-4">
                            Items
                        </h2>
                        <div className="space-y-2">
                            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <div className="col-span-4">Product</div>
                                <div className="col-span-5">Description</div>
                                <div className="col-span-3 text-right">Qty x Price</div>
                            </div>
                            {(order.orderItems || []).map((item) => (
                                <div
                                    key={item.orderItemId}
                                    className="grid grid-cols-12 gap-4 items-start p-4 rounded-md bg-slate-50 border border-slate-100">
                                    <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                                        <div className="w-16 h-16 rounded-md overflow-hidden bg-white border border-slate-200 shrink-0">
                                            {item.product?.image && (
                                                <img
                                                    src={/^(https?:)?\/\//.test(item.product.image)
                                                        ? item.product.image
                                                        : `${import.meta.env.VITE_BACK_END_URL}/images/${item.product.image}`}
                                                    alt={item.product.productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <p className="text-slate-800 font-semibold truncate">
                                            {item.product?.productName || "—"}
                                        </p>
                                    </div>
                                    <div className="col-span-7 sm:col-span-5">
                                        <p className="text-slate-500 text-sm line-clamp-2">
                                            {item.product?.description || ""}
                                        </p>
                                    </div>
                                    <div className="col-span-5 sm:col-span-3 text-right">
                                        <p className="text-slate-800 font-semibold text-sm">
                                            {item.quantity} x ${Number(item.orderedProductPrice || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase tracking-wide">
                                    Total
                                </p>
                                <p className="text-slate-900 text-2xl font-bold">
                                    ${order.totalAmount?.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ----- LIST VIEW -----
    const orders = Array.isArray(userOrders) ? userOrders : [];

    return (
        <div className="lg:px-14 sm:px-8 px-4 py-14 2xl:w-[90%] 2xl:mx-auto">
            <div className="pb-6 mb-6 border-b border-slate-200">
                <h1 className="text-slate-800 text-3xl font-bold">My orders</h1>
                <p className="text-slate-600 mt-1">
                    Track and review your past purchases.
                </p>
            </div>

            {listLoading ? (
                <Loader />
            ) : listError ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FaBox className="text-slate-400 text-4xl mb-3" />
                    <p className="text-slate-700 text-lg font-medium">
                        {listError}
                    </p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FaBox className="text-slate-400 text-4xl mb-3" />
                    <h2 className="text-slate-800 text-xl font-semibold mb-1">
                        No orders yet
                    </h2>
                    <p className="text-slate-500">
                        When you place an order it will appear here.
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {orders.map((order, index) => {
                            const StatusIcon = getStatusStyle(order.orderStatus).icon;
                            const displayNumber =
                                (pagination?.pageNumber || 0) *
                                    (pagination?.pageSize || 10) +
                                index +
                                1;
                            return (
                                <button
                                    key={order.orderId}
                                    type="button"
                                    onClick={() => handleViewDetail(order.orderId)}
                                    className="w-full text-left p-5 rounded-md bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-slate-800 font-bold text-lg">
                                                    Order #{displayNumber}
                                                </p>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(order.orderStatus).className}`}>
                                                    <StatusIcon size={11} />
                                                    {statusLabel(order.orderStatus)}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                                                <FaCalendarAlt size={12} />
                                                {formatDate(order.orderDate)}
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs text-slate-500 uppercase tracking-wide">
                                                Total
                                            </p>
                                            <p className="text-slate-800 text-xl font-bold">
                                                ${order.totalAmount?.toFixed(2)}
                                            </p>
                                            <p className="text-slate-500 text-sm mt-1">
                                                {(order.orderItems || []).length} item(s)
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-center pt-10">
                        <Paginations
                            numberOfPage={pagination?.totalPages}
                            totalProducts={pagination?.totalElements}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default UserOrders;
