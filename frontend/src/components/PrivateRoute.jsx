import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = ({ publicPage = false, adminOnly = false }) => {
    const { user, sessionHydrated } = useSelector((state) => state.auth);
    const isAdmin = user && user?.roles?.includes("ROLE_ADMIN");
    const isSeller = user && user?.roles?.includes("ROLE_SELLER");
    const location = useLocation();

    if (publicPage) {
        if (!sessionHydrated) return null;
        return user ? <Navigate to="/" /> : <Outlet />
    }

    if (!sessionHydrated) return null;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly) {
        const isSellerOnly = isSeller && !isAdmin;
        if (isSellerOnly) {
            const sellerAllowedPaths = ["/admin", "/admin/orders", "/admin/products"];
            const sellerAllowed = sellerAllowedPaths.some(path =>
                path === "/admin"
                    ? location.pathname === path
                    : location.pathname.startsWith(path)
            );
            if (!sellerAllowed) {
                return <Navigate to="/" replace />
            }
        }
        if (!isAdmin && !isSeller) {
            return <Navigate to="/" replace />
        }
    }

    return <Outlet />;
}

export default PrivateRoute