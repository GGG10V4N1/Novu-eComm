import api from "../../api/api"
import toast from "react-hot-toast"

// El backend setea la cookie JWT asi (JwtUtils.generateJwtCookie):
//   Set-Cookie: ecomm-cookie=<jwt>; Path=/ecomApi; Max-Age=86400; HttpOnly=false; Secure=false
// NOTA: el backend NO especifica SameSite, por lo que el navegador aplica
// el default Lax. Al borrar la cookie, si usamos atributos distintos (p.ej.
// samesite=lax explicito o path=/), algunos navegadores NO sobrescriben la
// original y la cookie queda con valor "" y el backend recibe una cookie JWT
// vacia, lo que produce el log "JWT claims string is empty" (IllegalArgumentException)
// y hace que los endpoints autenticados (/auth/user, /order/*, /carts/*)
// respondan 401. Por eso borramos con los mismos atributos del backend.
const JWT_COOKIE_NAME = "ecomm-cookie";
const clearJwtCookie = () => {
    // Coincide exactamente con la cookie original (Path=/ecomApi, sin SameSite).
    document.cookie = `${JWT_COOKIE_NAME}=; path=/ecomApi; max-age=0`;
    // Variantes defensivas por si en algun momento se seteo con otros paths
    // (algunos Set-Cookie antiguos usaban Path=/).
    document.cookie = `${JWT_COOKIE_NAME}=; path=/; max-age=0`;
    document.cookie = `${JWT_COOKIE_NAME}=; path=/ecomApi/; max-age=0`;
};

// Extrae un mensaje legible del error devuelto por el backend, que puede tener
// cualquiera de estas formas:
//   - APIException / ResourceNotFound: { message: "...", status: false }
//   - Validacion (MethodArgumentNotValidException): { fieldName: "msg", ... }
//   - AuthEntryPointJwt (401): { status, error, message, path }
//   - Error generico de Spring: { timestamp, status, error, message, path }
// Antes el frontend leia `data.description`, que NUNCA existe en el backend,
// por lo que SIEMPRE caia en el fallback "Product creation failed" aun cuando
// el backend respondia con "Product already exists".
const extractServerMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (data && typeof data === "object") {
        if (typeof data.message === "string" && data.message.trim()) return data.message;
        // Validacion: Map<fieldName, message> -> "field: message; field2: message2"
        const fieldMessages = Object.entries(data)
            .filter(([k, v]) => typeof v === "string" && v.trim() && k !== "path" && k !== "error")
            .map(([k, v]) => `${k}: ${v}`);
        if (fieldMessages.length) return fieldMessages.join("; ");
    }
    if (typeof data === "string" && data.trim()) return data;
    return fallback || "Request failed";
};

const mapProduct = (p) => {
    if (!p) return p;
    const { id, name, ...rest } = p;
    return {
        ...rest,
        productId: id,
        productName: name,
    };
};

const mapProducts = (list) => (list || []).map(mapProduct);

const mapCategory = (c) => {
    if (!c) return c;
    const { id, name, ...rest } = c;
    return {
        ...rest,
        categoryId: id,
        categoryName: name,
    };
};

const mapCategories = (list) => (list || []).map(mapCategory);

const mapSeller = (u) => {
    if (!u) return u;
    const { id, ...rest } = u;
    return {
        ...rest,
        userId: id,
    };
};

const mapSellers = (list) => (list || []).map(mapSeller);

const mapOrderItem = (oi) => {
    if (!oi) return oi;
    const { id, product, price, ...rest } = oi;
    return {
        ...rest,
        orderItemId: id,
        product: mapProduct(product),
        orderedProductPrice: price,
    };
};

const mapOrder = (o) => {
    if (!o) return o;
    const { id, status, date, orderItems, ...rest } = o;
    return {
        ...rest,
        orderId: id,
        orderStatus: status,
        orderDate: date,
        orderItems: (orderItems || []).map(mapOrderItem),
    };
};

const mapOrders = (list) => (list || []).map(mapOrder);

const mapAddress = (a) => {
    if (!a) return a;
    const { id, ...rest } = a;
    return {
        ...rest,
        addressId: id,
    };
};

const mapAddresses = (list) => (list || []).map(mapAddress);

const mapCart = (c) => {
    if (!c) return c;
    const { id, totalAmount, products, ...rest } = c;
    return {
        ...rest,
        cartId: id,
        totalPrice: totalAmount,
        products: mapProducts(products),
    };
};

const stripImageBaseUrl = (image) => {
    if (!image || typeof image !== "string") return image;
    return image.replace(/^https?:\/\/[^/]+\/images\//, "");
};

const mapProductForState = (p) => {
    const mapped = mapProduct(p);
    if (mapped && mapped.image) {
        mapped.image = stripImageBaseUrl(mapped.image);
    }
    return mapped;
};

const mapProductsForState = (list) => (list || []).map(mapProductForState);

const mapPageContent = (data, mapper) => ({
    ...data,
    content: mapper(data.content),
});

const EMPTY_LIST_MESSAGES = [
    "NO CATEGORIES HAVE BEEN ADDED YET",
    "NO PRODUCTS HAVE BEEN ADDED YET",
    "NO ORDERS HAVE BEEN PLACED YET",
    "NO SELLERS FOUNDED",
    "NO CARTS EXIST",
];

const isEmptyListMessage = (message) => {
    if (!message || typeof message !== "string") return false;
    const upper = message.toUpperCase();
    return EMPTY_LIST_MESSAGES.some((m) => upper.includes(m));
};

const buildEmptyPageResponse = () => ({
    content: [],
    totalElements: 0,
    pageSize: 10,
    pageNumber: 0,
    totalPages: 0,
    lastPage: true,
});

const dispatchEmptyProducts = (dispatch) => {
    const empty = buildEmptyPageResponse();
    dispatch({
        type: "FETCH_PRODUCTS",
        payload: empty.content,
        pageNumber: empty.pageNumber,
        pageSize: empty.pageSize,
        totalElements: empty.totalElements,
        totalPages: empty.totalPages,
        lastPage: empty.lastPage,
    });
};

const dispatchEmptyCategories = (dispatch, successType = "CATEGORY_SUCCESS") => {
    const empty = buildEmptyPageResponse();
    dispatch({
        type: "FETCH_CATEGORIES",
        payload: empty.content,
        pageNumber: empty.pageNumber,
        pageSize: empty.pageSize,
        totalElements: empty.totalElements,
        totalPages: empty.totalPages,
        lastPage: empty.lastPage,
    });
    dispatch({ type: successType });
};

const dispatchEmptyOrders = (dispatch) => {
    const empty = buildEmptyPageResponse();
    dispatch({
        type: "GET_ADMIN_ORDERS",
        payload: empty.content,
        pageNumber: empty.pageNumber,
        pageSize: empty.pageSize,
        totalElements: empty.totalElements,
        totalPages: empty.totalPages,
        lastPage: empty.lastPage,
    });
    dispatch({ type: "IS_SUCCESS" });
};

const dispatchEmptySellers = (dispatch) => {
    const empty = buildEmptyPageResponse();
    dispatch({
        type: "GET_SELLERS",
        payload: empty.content,
        pageNumber: empty.pageNumber,
        pageSize: empty.pageSize,
        totalElements: empty.totalElements,
        totalPages: empty.totalPages,
        lastPage: empty.lastPage,
    });
    dispatch({ type: "IS_SUCCESS" });
};

const handleListError = (dispatch, message, fallbackMessage, emptyDispatcher) => {
    const finalMessage = message || fallbackMessage;
    if (isEmptyListMessage(finalMessage)) {
        emptyDispatcher(dispatch);
    } else {
        dispatch({
            type: "IS_ERROR",
            payload: finalMessage,
        });
    }
};

const buildProductPayload = (sendData) => {
    const { productName, ...rest } = sendData;
    return { ...rest, name: productName };
};

const buildCategoryPayload = (sendData) => {
    const { categoryName, ...rest } = sendData;
    return { ...rest, name: categoryName };
};

const buildSellerPayload = (sendData) => {
    const { role, ...rest } = sendData;
    return { ...rest, roles: role };
};

export const fetchProducts = (queryString) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(`/public/products?${queryString}`);
        const mapped = mapPageContent(data, mapProductsForState);
        dispatch({
            type: "FETCH_PRODUCTS",
            payload: mapped.content,
            pageNumber: mapped.pageNumber,
            pageSize: mapped.pageSize,
            totalElements: mapped.totalElements,
            totalPages: mapped.totalPages,
            lastPage: mapped.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        handleListError(
            dispatch,
            error?.response?.data?.message,
            "Failed to fetch products",
            (d) => { dispatchEmptyProducts(d); dispatch({ type: "IS_SUCCESS" }); }
        );
    }
};


export const fetchCategories = (queryString) => async (dispatch) => {
    try {
        dispatch({ type: "CATEGORY_LOADER" });
        const query = queryString
            ? `?${queryString}`
            : "?pageNumber=0&pageSize=1000";
        const { data } = await api.get(`/public/categories${query}`);
        const mapped = mapPageContent(data, mapCategories);
        dispatch({
            type: "FETCH_CATEGORIES",
            payload: mapped.content,
            pageNumber: mapped.pageNumber,
            pageSize: mapped.pageSize,
            totalElements: mapped.totalElements,
            totalPages: mapped.totalPages,
            lastPage: mapped.lastPage,
        });
        dispatch({ type: "CATEGORY_SUCCESS" });
    } catch (error) {
        console.log(error);
        handleListError(
            dispatch,
            error?.response?.data?.message,
            "Failed to fetch categories",
            (d) => dispatchEmptyCategories(d, "CATEGORY_SUCCESS")
        );
    }
};


export const addToCart = (data, qty = 1, toast) =>
    async (dispatch, getState) => {
        const { products } = getState().products;
        const { cart } = getState().carts;
        const { user } = getState().auth;

        const getProduct = products.find(
            (item) => item.productId === data.productId
        );

        if (!getProduct) {
            toast.error("Product not available");
            return;
        }

        const stockLimit = Number(getProduct.quantity) || 0;
        const alreadyInCart = cart.find(
            (item) => item.productId === data.productId
        );
        const currentInCartQty = Number(alreadyInCart?.quantity) || 0;
        const requestedQty = Number(qty) || 1;

        // Avoid duplicate toast stacking by reusing a stable id
        const toastId = `add-to-cart-${data.productId}`;

        if (currentInCartQty + requestedQty > stockLimit) {
            if (currentInCartQty >= stockLimit) {
                toast.error("Quantity Reached to Limit", { id: toastId });
            } else {
                const remaining = stockLimit - currentInCartQty;
                toast.error(
                    remaining > 0
                        ? `Only ${remaining} unit(s) left in stock`
                        : "Out of stock",
                    { id: toastId }
                );
            }
            return;
        }

        if (user) {
            try {
                await api.post(
                    `/carts/products/${data.productId}/quantity/${requestedQty}`
                );
                await dispatch(getUserCart());
                toast.success(`${data?.productName} added to the cart`, {
                    id: toastId,
                });
            } catch (error) {
                console.log(error);
                toast.error(
                    error?.response?.data?.message || "Failed to update cart",
                    { id: toastId }
                );
            }
            return;
        }

        // Usuario invitado: carrito local
        dispatch({
            type: "ADD_CART",
            payload: { ...data, quantity: requestedQty },
        });
        toast.success(`${data?.productName} added to the cart`, {
            id: toastId,
        });
    };


export const increaseCartQuantity =
    (data, toast, currentQuantity, setCurrentQuantity) =>
    async (dispatch, getState) => {
        const { products } = getState().products;
        const { cart } = getState().carts;
        const { user } = getState().auth;

        const getProduct = products.find(
            (item) => item.productId === data.productId
        );

        if (!getProduct) {
            toast.error("Product not available");
            return;
        }

        const stockLimit = Number(getProduct.quantity) || 0;
        const alreadyInCart = cart.find(
            (item) => item.productId === data.productId
        );
        const cartQty = Number(alreadyInCart?.quantity) || 0;
        const toastId = `increase-cart-${data.productId}`;

        if (cartQty + 1 > stockLimit) {
            toast.error("Quantity Reached to Limit", { id: toastId });
            return;
        }

        if (user) {
            try {
                await api.put(
                    `/cart/products/${data.productId}/quantity/increase`
                );
                await dispatch(getUserCart());
                if (setCurrentQuantity) setCurrentQuantity(cartQty + 1);
            } catch (error) {
                console.log(error);
                toast.error(
                    error?.response?.data?.message || "Failed to update cart",
                    { id: toastId }
                );
            }
            return;
        }

        if (setCurrentQuantity) {
            setCurrentQuantity(cartQty + 1);
        }
        dispatch({
            type: "ADD_CART",
            payload: { ...data, quantity: 1 },
        });
    };



export const decreaseCartQuantity =
    (data, newQuantity) => async (dispatch, getState) => {
        const { user } = getState().auth;

        if (user) {
            try {
                await api.put(
                    `/cart/products/${data.productId}/quantity/delete`
                );
                await dispatch(getUserCart());
            } catch (error) {
                console.log(error);
            }
            return;
        }

        dispatch({
            type: "SET_CART_QUANTITY",
            payload: {...data, quantity: newQuantity},
        });
    };

export const setCartQuantity =
    (data, qty, toast, setCurrentQuantity) =>
    async (dispatch, getState) => {
        const { products } = getState().products;
        const { cart } = getState().carts;
        const { user } = getState().auth;

        const getProduct = products.find(
            (item) => item.productId === data.productId
        );

        if (!getProduct) {
            toast.error("Product not available");
            return;
        }

        const stockLimit = Number(getProduct.quantity) || 0;
        let requestedQty = Number(qty);
        const toastId = `set-cart-${data.productId}`;

        // Sanitize invalid / NaN / negative / zero values
        if (!Number.isFinite(requestedQty) || isNaN(requestedQty)) {
            requestedQty = 1;
        } else if (requestedQty < 1) {
            requestedQty = 1;
        } else if (!Number.isInteger(requestedQty)) {
            requestedQty = Math.floor(requestedQty);
        } else if (requestedQty > stockLimit) {
            requestedQty = stockLimit;
        }

        if (requestedQty <= 0) {
            toast.error("Out of stock", { id: toastId });
            return;
        }

        const alreadyInCart = cart.find(
            (item) => item.productId === data.productId
        );
        const currentInCartQty = Number(alreadyInCart?.quantity) || 0;

        if (user) {
            const delta = requestedQty - currentInCartQty;
            if (delta === 0) {
                if (setCurrentQuantity) setCurrentQuantity(requestedQty);
                return;
            }
            try {
                const operation = delta > 0 ? "increase" : "delete";
                const steps = Math.abs(delta);
                for (let i = 0; i < steps; i += 1) {
                    await api.put(
                        `/cart/products/${data.productId}/quantity/${operation}`
                    );
                }
                await dispatch(getUserCart());
                if (setCurrentQuantity) setCurrentQuantity(requestedQty);
            } catch (error) {
                console.log(error);
                toast.error(
                    error?.response?.data?.message || "Failed to update cart",
                    { id: toastId }
                );
            }
            return;
        }

        if (setCurrentQuantity) {
            setCurrentQuantity(requestedQty);
        }

        dispatch({
            type: "SET_CART_QUANTITY",
            payload: { ...data, quantity: requestedQty },
        });
    };

export const removeFromCart =  (data, toast) => async (dispatch, getState) => {
    const { user } = getState().auth;

    if (user) {
        let { cartId } = getState().carts;
        if (!cartId) {
            await dispatch(getUserCart());
            cartId = getState().carts.cartId;
        }
        if (!cartId) {
            toast.error("Cannot remove item: cart not found");
            return;
        }
        try {
            await api.delete(`/carts/${cartId}/product/${data.productId}`);
            await dispatch(getUserCart());
            toast.success(`${data.productName} removed from cart`);
        } catch (error) {
            console.log(error);
            toast.error(
                error?.response?.data?.message || "Failed to remove item from cart"
            );
        }
        return;
    }

    dispatch({type: "REMOVE_CART", payload: data });
    toast.success(`${data.productName} removed from cart`);
};



export const authenticateSignInUser 
    = (sendData, toast, reset, navigate, setLoader) => async (dispatch) => {
        try {
            setLoader(true);
            // Limpia una posible cookie JWT residual vacia/expirada antes del
            // login para evitar que el AuthTokenFilter del backend loguee
            // "JWT claims string is empty" al procesar esta peticion.
            clearJwtCookie();
            const { data } = await api.post("/auth/signin", sendData);
            dispatch({ type: "LOGIN_USER", payload: data });
            // El backend /auth/user (usado por hydrateSession al recargar la
            // pagina) NO devuelve email; solo /auth/signin lo trae. Lo
            // cacheamos para que, tras un reload (p.ej. redirect de Stripe),
            // el front siga teniendo user.email disponible y pueda disparar
            // createStripePaymentSecret en StripePayment.jsx.
            if (data?.email) {
                localStorage.setItem("user-email", data.email);
            }
            reset();
            toast.success("Login Success");
            // Sincroniza el carrito persistido del backend para el usuario logueado
            try {
                await dispatch(getUserCart());
            } catch (cartErr) {
                console.log("Failed to fetch user cart after login", cartErr);
            }
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Internal Server Error");
        } finally {
            setLoader(false);
        }
}

// Hidrata la sesion del usuario al arrancar la app usando la cookie JWT
// (enviada automaticamente por axios con withCredentials: true).
// El usuario solo se carga si el backend responde con datos validos.
export const hydrateSession = () => async (dispatch) => {
    try {
        const { data } = await api.get("/auth/user");
        if (data && data.id && data.username) {
            // El backend /auth/user no devuelve email (lo hace /auth/signin).
            // Lo rehidratamos desde el cache de login para que estado.auth.user
            // tenga email tras un reload (p.ej. redirect de Stripe a
            // /order-confirm). Sin esto, StripePayment.jsx no dispara
            // createStripePaymentSecret porque user.email es undefined.
            if (!data.email) {
                const cachedEmail = localStorage.getItem("user-email");
                if (cachedEmail) data.email = cachedEmail;
            } else {
                localStorage.setItem("user-email", data.email);
            }
            dispatch({ type: "LOGIN_USER", payload: data });
            // Hidata tambien el carrito del backend para el usuario logueado
            try {
                await dispatch(getUserCart());
            } catch (cartErr) {
                console.log("Failed to fetch user cart on hydrate", cartErr);
            }
            return;
        }
        dispatch({ type: "SESSION_HYDRATED" });
    } catch (error) {
        // 401/403/500 = no hay sesion valida; nada que hacer.
        // Limpia posibles cookies JWT zombies (vacias o expiradas) para evitar
        // que el backend siga logueando "JWT claims string is empty".
        clearJwtCookie();
        // Limpia tambien el cache de email si no hay sesion valida
        localStorage.removeItem("user-email");
        dispatch({ type: "SESSION_HYDRATED" });
    }
};

export const registerNewUser 
    = (sendData, toast, reset, navigate, setLoader) => async (dispatch) => {
        try {
            setLoader(true);
            const { data } = await api.post("/auth/signup", sendData);
            reset();
            toast.success(data?.message || "User Registered Successfully");
            navigate("/login");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || error?.response?.data?.password || "Internal Server Error");
        } finally {
            setLoader(false);
        }
};


export const logOutUser = (navigate) => async (dispatch) => {
    try {
        await api.post("/auth/signout");
    } catch (error) {
        console.log("Logout endpoint failed", error);
    }
    // El backend responde con Set-Cookie ecomm-cookie=; path=/ecomApi (valor
    // vacio). Algunos navegadores mantienen esa cookie con valor "" y la
    // envian en la siguiente peticion, lo que provoca un
    // IllegalArgumentException en el backend (JWT claims string is empty).
    // Forzamos el borrado de la cookie en el navegador para evitar ese estado.
    clearJwtCookie();
    dispatch({ type:"LOG_OUT" });
    dispatch({ type: "CLEAR_CART" });
    dispatch({ type: "REMOVE_CLIENT_SECRET_ADDRESS" });
    dispatch({ type: "REMOVE_CHECKOUT_ADDRESS" });
    localStorage.removeItem("CHECKOUT_ADDRESS");
    localStorage.removeItem("client-secret");
    localStorage.removeItem("user-email");
    navigate("/login");
};

export const updateUserPassword =
    (sendData, toast, reset, setLoader, setOpen) => async (dispatch) => {
        try {
            setLoader(true);
            const { data } = await api.put("/auth/password", sendData);
            dispatch({ type: "LOGIN_USER", payload: data });
            reset();
            toast.success("Password updated successfully");
            setOpen(false);
        } catch (error) {
            console.log(error);
            toast.error(
                error?.response?.data?.message || "Failed to update password"
            );
        } finally {
            setLoader(false);
        }
    };

export const updateUserEmail =
    (sendData, toast, reset, setLoader, setOpen) => async (dispatch) => {
        try {
            setLoader(true);
            const { data } = await api.put("/auth/email", sendData);
            dispatch({ type: "LOGIN_USER", payload: data });
            if (data?.email) {
                localStorage.setItem("user-email", data.email);
            }
            reset();
            toast.success("Email updated successfully");
            setOpen(false);
        } catch (error) {
            console.log(error);
            toast.error(
                error?.response?.data?.message || "Failed to update email"
            );
        } finally {
            setLoader(false);
        }
    };

export const addUpdateUserAddress =
     (sendData, toast, addressId, setOpenAddressModal) => async (dispatch, getState) => {
    /*
    const { user } = getState().auth;
    await api.post(`/addresses`, sendData, {
          headers: { Authorization: "Bearer " + user.jwtToken },
        });
    */
    dispatch({ type:"BUTTON_LOADER" });
    try {
        if (!addressId) {
            const { data } = await api.post("/addresses", sendData);
        } else {
            await api.put(`/addresses/${addressId}`, sendData);
        }
        dispatch(getUserAddresses());
        toast.success("Address saved successfully");
        dispatch({ type:"IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Internal Server Error");
        dispatch({ type:"IS_ERROR", payload: null });
    } finally {
        setOpenAddressModal(false);
    }
};


export const deleteUserAddress = 
    (toast, addressId, setOpenDeleteModal) => async (dispatch, getState) => {
    try {
        dispatch({ type: "BUTTON_LOADER" });
        await api.delete(`/addresses/${addressId}`);
        dispatch({ type: "IS_SUCCESS" });
        dispatch(getUserAddresses());
        dispatch(clearCheckoutAddress());
        toast.success("Address deleted successfully");
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Some Error Occured",
         });
    } finally {
        setOpenDeleteModal(false);
    }
};

export const clearCheckoutAddress = () => {
    localStorage.removeItem("CHECKOUT_ADDRESS");
    return {
        type: "REMOVE_CHECKOUT_ADDRESS",
    }
};

export const getUserAddresses = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(`/users/addresses`);
        dispatch({type: "USER_ADDRESS", payload: mapAddresses(data)});
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch user addresses",
         });
    }
};

export const selectUserCheckoutAddress = (address) => {
    localStorage.setItem("CHECKOUT_ADDRESS", JSON.stringify(address));
    
    return {
        type: "SELECT_CHECKOUT_ADDRESS",
        payload: address,
    }
};


export const addPaymentMethod = (method) => {
    return {
        type: "ADD_PAYMENT_METHOD",
        payload: method,
    }
};


export const createUserCart = (sendCartItems) => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        await api.post('/cart/create', sendCartItems);
        await dispatch(getUserCart());
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to create cart items",
         });
    }
};


export const getUserCart = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get('/carts/users/cart');
        const mapped = mapCart(data);

        dispatch({
            type: "GET_USER_CART_PRODUCTS",
            payload: mapped.products,
            totalPrice: mapped.totalPrice,
            cartId: mapped.cartId
        })
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        // La ausencia de carrito (p.ej. admin/usuarios recien creados sin
        // carrito) NO es un error de UI: es un estado legítimo. Antes esto
        // despachaba IS_ERROR global con "NOT FOUND Cart WITH email...",
        // lo que ensuciaba errorMessage y aparecia en vistas ajenas al
        // carrito (p.ej. el Home lo mostraba creyendo que era error de
        // fetchProducts). Ahora reseteamos el carrito a vacio y dejamos el
        // reducer de errores intacto.
        dispatch({ type: "CLEAR_CART" });
        dispatch({ type: "IS_SUCCESS" });
    }
};


export const syncCartWithProducts = (toast) => async (dispatch, getState) => {
    const { cart } = getState().carts;
    if (!cart || cart.length === 0) return;

    let removedCount = 0;
    let adjustedCount = 0;
    const reconciledCart = [];

    const buildStockMap = (products) => {
        const map = new Map();
        for (const p of products || []) {
            const key = String(p?.productId ?? p?.id ?? "");
            if (key) map.set(key, Number(p?.quantity) || 0);
        }
        return map;
    };

    const reconcile = (stockMap) => {
        for (const item of cart) {
            const key = String(item?.productId ?? item?.id ?? "");
            const stock = stockMap.get(key);

            if (!key || stock === undefined) {
                // Producto ya no existe en la BD
                removedCount += 1;
                continue;
            }

            if (stock <= 0) {
                removedCount += 1;
                continue;
            }

            const itemQty = Number(item.quantity) || 0;
            if (itemQty > stock) {
                reconciledCart.push({ ...item, quantity: stock });
                adjustedCount += 1;
            } else {
                reconciledCart.push(item);
            }
        }
    };

    // 1) Intenta reconciliar contra la BD (endpoint publico).
    try {
        const { data } = await api.get(
            "/public/products?pageNumber=0&pageSize=1000"
        );
        const availableProducts = mapProductsForState(data?.content || []);
        reconcile(buildStockMap(availableProducts));
    } catch (error) {
        console.log("syncCartWithProducts: BD fetch failed", error);
        // 2) Fallback: reconcilia contra los productos ya cargados en Redux.
        const { products } = getState().products;
        reconcile(buildStockMap(products));
    }

    if (removedCount === 0 && adjustedCount === 0) {
        return;
    }

    dispatch({ type: "SYNC_CART", payload: reconciledCart });

    const messages = [];
    if (removedCount > 0) {
        messages.push(
            `${removedCount} product(s) no longer available and were removed`
        );
    }
    if (adjustedCount > 0) {
        messages.push(
            `${adjustedCount} product(s) quantity adjusted to match stock`
        );
    }
    if (toast) {
        toast.success(messages.join(" · "), { id: "sync-cart", duration: 4000 });
    }
};


export const createStripePaymentSecret
    = (sendData, toast) => async (dispatch, getState) => {
        try {
            dispatch({ type: "IS_FETCHING" });
            const { data } = await api.post("/order/stripe-client-secret", sendData);
            dispatch({ type: "CLIENT_SECRET", payload: data });
              localStorage.setItem("client-secret", JSON.stringify(data));
              dispatch({ type: "IS_SUCCESS" });
        } catch (error) {
            console.log(error);
            // El backend puede devolver el error como { message } (APIException),
            // { error, message } (Spring default/AuthEntryPoint) o { description }.
            const msg =
                error?.response?.data?.message
                || error?.response?.data?.description
                || (typeof error?.response?.data === "string" ? error.response.data : null)
                || "Failed to create client secret";
            dispatch({ type: "IS_ERROR", payload: msg });
            if (toast) toast.error(msg);
        }
};
export const stripePaymentConfirmation
    = (sendData, setErrorMessage, setLoading, toast) => async (dispatch, getState) => {
        // Stripe ya nos dijo `redirect_status=succeeded`: el cobro al cliente
        // ya se efectuo en Stripe. placeOrder solo registra la orden en NUESTRA
        // BD. Por tanto, si placeOrder falla (500, "Cart is empty", duplicate,
        // LazyInitialization, etc.) NO debemos decirle al usuario que el pago
        // fallo: lo cobramos igual. Mostramos una advertencia pidiendo que
        // contacte soporte para sincronizar el pedido.
        const paymentSucceeded = sendData?.pgStatus === "succeeded";

        try {
            const response  = await api.post("/order/users/payments/Stripe", sendData);
            if (response.data) {
                localStorage.removeItem("CHECKOUT_ADDRESS");
                localStorage.removeItem("client-secret");
                dispatch({ type: "REMOVE_CLIENT_SECRET_ADDRESS"});
                dispatch({ type: "CLEAR_CART"});
                dispatch({ type: "ADD_PAYMENT_METHOD", payload: null });
                // Refresca el carrito del backend (ya vacio tras placeOrder)
                // para que el estado Redux quede consistente y el usuario
                // pueda iniciar una nueva compra sin restos del pedido previo.
                try {
                    await dispatch(getUserCart());
                } catch (cartErr) {
                    console.log("Failed to refresh cart after payment", cartErr);
                }
                toast.success("Order Accepted");
              } else if (paymentSucceeded) {
                  // El backend respondio 2xx pero con body vacio: inusual, pero
                  // como Stripe ya cobro, no podemos decirle "Payment Failed".
                  toast.success("Payment received. Your order is being processed.");
              } else {
                setErrorMessage("Payment Failed. Please try again.");
              }
        } catch (error) {
            console.log(error);
            const friendly = extractServerMessage(error, "Payment Failed. Please try again.");

            // "Cart is empty" tras un redirect de Stripe "succeeded" casi
            // siempre significa que placeOrder ya se ejecuto antes (primera
            // llamada vacio el carrito de Redux) y esta es una llamada duplicada
            // (recarga, StrictMode, doble click, etc.). El cobro de Stripe ya
            // ocurrio y la orden ya fue creada en la primera llamada, asi que
            // no debemos mostrarle al usuario un error engañoso "Cart is
            // empty": lo tratamos como exito idempotente y dejamos el estado
            // de checkout limpio.
            const isCartEmptyError =
                typeof friendly === "string" &&
                /cart is empty/i.test(friendly);

            if (isCartEmptyError) {
                localStorage.removeItem("CHECKOUT_ADDRESS");
                localStorage.removeItem("client-secret");
                dispatch({ type: "REMOVE_CLIENT_SECRET_ADDRESS"});
                dispatch({ type: "CLEAR_CART"});
                dispatch({ type: "ADD_PAYMENT_METHOD", payload: null });
                toast.success("Order Accepted");
                return;
            }

            if (paymentSucceeded) {
                // Stripe ya cobro (redirect_status=succeeded) pero placeOrder
                // fallo por un problema de sincronizacion con nuestra BD
                // (duplicate, 500, etc.). El pago NO fallo desde el punto de
                // vista del cliente. Limpiamos el checkout para no dejar
                // estado residual, pero en lugar de "Payment Failed",
                // mostramos un aviso pidiendo contactar soporte. Antes, esto
                // confundia al usuario con un "Payment Failed" cuando la
                // orden/pago SI estaban registrados en la BD.
                localStorage.removeItem("CHECKOUT_ADDRESS");
                localStorage.removeItem("client-secret");
                dispatch({ type: "REMOVE_CLIENT_SECRET_ADDRESS"});
                dispatch({ type: "CLEAR_CART"});
                dispatch({ type: "ADD_PAYMENT_METHOD", payload: null });
                if (toast) {
                    toast.success(
                        "Your payment was received. If your order is not visible in your account, please contact support.",
                        { duration: 6000 }
                    );
                }
                return;
            }

            const serverMsg = (typeof friendly === "string" && friendly.includes("Duplicate entry"))
                ? "There is a problem with the payment method configured on the server. Please contact support."
                : friendly;
            setErrorMessage(serverMsg);
            if (toast) toast.error(serverMsg);
        } finally {
            setLoading(false);
        }
};

export const analyticsAction = () => async (dispatch, getState) => {
        try {
            dispatch({ type: "IS_FETCHING"});
            const { data } = await api.get('/admin/app/analytics');
            dispatch({
                type: "FETCH_ANALYTICS",
                payload: data,
            })
            dispatch({ type: "IS_SUCCESS"});
        } catch (error) {
            dispatch({ 
                type: "IS_ERROR",
                payload: error?.response?.data?.message || "Failed to fetch analytics data",
            });
        }
};

export const sellerAnalyticsAction = () => async (dispatch) => {
        try {
            dispatch({ type: "IS_FETCHING"});
            const { data } = await api.get('/seller/app/analytics');
            dispatch({
                type: "FETCH_ANALYTICS",
                payload: data,
            })
            dispatch({ type: "IS_SUCCESS"});
        } catch (error) {
            dispatch({ 
                type: "IS_ERROR",
                payload: error?.response?.data?.message || "Failed to fetch analytics data",
            });
        }
};

export const getOrdersForDashboard = (queryString, isAdmin) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const endpoint = isAdmin ? "/admin/orders" : "/seller/orders";
        const { data } = await api.get(`${endpoint}?${queryString}`);
        const mapped = mapPageContent(data, mapOrders);
        dispatch({
            type: "GET_ADMIN_ORDERS",
            payload: mapped.content,
            pageNumber: mapped.pageNumber,
            pageSize: mapped.pageSize,
            totalElements: mapped.totalElements,
            totalPages: mapped.totalPages,
            lastPage: mapped.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        handleListError(
            dispatch,
            error?.response?.data?.message,
            "Failed to fetch orders data",
            dispatchEmptyOrders
        );
    }
};

export const getDashboardOrdersForCharts = (isAdmin) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const endpoint = isAdmin ? "/admin/orders" : "/seller/orders";
        const allOrders = [];
        let page = 0;
        const pageSize = 50;
        let lastPage = false;
        while (!lastPage) {
            const { data } = await api.get(
                `${endpoint}?pageNumber=${page}&pageSize=${pageSize}`
            );
            const mapped = mapPageContent(data, mapOrders);
            allOrders.push(...mapped.content);
            lastPage = mapped.lastPage;
            page += 1;
            if (page > 50) break;
        }
        dispatch({
            type: "SET_DASHBOARD_ORDERS_CHARTS",
            payload: allOrders,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ type: "IS_SUCCESS" });
    }
};





export const updateOrderStatusFromDashboard =
     (orderId, orderStatus, toast, setLoader, isAdmin) => async (dispatch, getState) => {
    try {
        setLoader(true);
        const endpoint = isAdmin ? "/admin/orders/" : "/seller/orders/";
        const { data } = await api.put(`${endpoint}${orderId}/status`, { status: orderStatus});
        toast.success(data.message || "Order updated successfully");
        await dispatch(getOrdersForDashboard());
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
        setLoader(false)
    }
};


export const dashboardProductsAction = (queryString, isAdmin) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const endpoint = isAdmin ? "/admin/products" : "/seller/products";
        const { data } = await api.get(`${endpoint}?${queryString}`);
        const mapped = mapPageContent(data, mapProductsForState);
        dispatch({
            type: "FETCH_PRODUCTS",
            payload: mapped.content,
            pageNumber: mapped.pageNumber,
            pageSize: mapped.pageSize,
            totalElements: mapped.totalElements,
            totalPages: mapped.totalPages,
            lastPage: mapped.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        handleListError(
            dispatch,
            error?.response?.data?.message,
            "Failed to fetch dashboard products",
            (d) => { dispatchEmptyProducts(d); dispatch({ type: "IS_SUCCESS" }); }
        );
    }
};


export const updateProductFromDashboard = 
    (sendData, toast, reset, setLoader, setOpen, isAdmin) => async (dispatch) => {
    try {
        setLoader(true);
        const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
        await api.put(`${endpoint}${sendData.id}`, buildProductPayload(sendData));
        toast.success("Product update successful");
        reset();
        setLoader(false);
        setOpen(false);
        await dispatch(dashboardProductsAction());
    } catch (error) {
        toast.error(extractServerMessage(error, "Product update failed"));

    }
};



export const addNewProductFromDashboard = 
    (sendData, toast, reset, setLoader, setOpen, isAdmin) => async(dispatch, getState) => {
        try {
            setLoader(true);
            const endpoint = isAdmin ? "/admin/categories/" : "/seller/categories/";
            await api.post(`${endpoint}${sendData.categoryId}/product`,
                buildProductPayload(sendData)
            );
            toast.success("Product created successfully");
            reset();
            setOpen(false);
            await dispatch(dashboardProductsAction());
        } catch (error) {
            console.error(error);
            toast.error(extractServerMessage(error, "Product creation failed"));
        } finally {
            setLoader(false);
        }
    }

export const deleteProduct = 
    (setLoader, productId, toast, setOpenDeleteModal, isAdmin) => async (dispatch, getState) => {
    try {
        setLoader(true)
        const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
        await api.delete(`${endpoint}${productId}`);
        toast.success("Product deleted successfully");
        setLoader(false);
        setOpenDeleteModal(false);
        await dispatch(dashboardProductsAction());
        // Reconcilia el carrito local por si el producto borrado estaba ahi
        await dispatch(syncCartWithProducts(toast));
    } catch (error) {
        console.log(error);
        toast.error(
            error?.response?.data?.message || "Some Error Occured"
        )
    }
};


export const updateProductImageFromDashboard = 
    (formData, productId, toast, setLoader, setOpen, isAdmin) => async (dispatch) => {
    try {
        setLoader(true);
        const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
        await api.put(`${endpoint}${productId}/image`, formData);
        toast.success("Image upload successful");
        setLoader(false);
        setOpen(false);
        await dispatch(dashboardProductsAction());
    } catch (error) {
        toast.error(extractServerMessage(error, "Product Image upload failed"));

    }
};

export const getAllCategoriesDashboard = (queryString) => async (dispatch) => {
  dispatch({ type: "CATEGORY_LOADER" });
  try {
    const base = "pageNumber=0&pageSize=1000";
    const query = queryString ? `${queryString}&pageSize=1000` : base;
    const { data } = await api.get(`/public/categories?${query}`);
    const mapped = mapPageContent(data, mapCategories);
    dispatch({
      type: "FETCH_CATEGORIES",
      payload: mapped.content,
      pageNumber: mapped.pageNumber,
      pageSize: mapped.pageSize,
      totalElements: mapped.totalElements,
      totalPages: mapped.totalPages,
      lastPage: mapped.lastPage,
    });

    dispatch({ type: "CATEGORY_SUCCESS" });
  } catch (err) {
    console.log(err);
    handleListError(
      dispatch,
      err?.response?.data?.message,
      "Failed to fetch categories",
      (d) => dispatchEmptyCategories(d, "CATEGORY_SUCCESS")
    );
  }
};

export const createCategoryDashboardAction =
  (sendData, setOpen, reset, toast) => async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });
      await api.post("/admin/categories", buildCategoryPayload(sendData));
      dispatch({ type: "CATEGORY_SUCCESS" });
      reset();
      toast.success("Category Created Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.categoryName || "Failed to create new category"
      );

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const updateCategoryDashboardAction =
  (sendData, setOpen, categoryID, reset, toast) =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });

      await api.put(`/admin/categories/${categoryID}`, buildCategoryPayload(sendData));

      dispatch({ type: "CATEGORY_SUCCESS" });

      reset();
      toast.success("Category Update Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.categoryName || "Failed to update category"
      );

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const deleteCategoryDashboardAction =
  (setOpen, categoryID, toast) => async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });

      await api.delete(`/admin/categories/${categoryID}`);

      dispatch({ type: "CATEGORY_SUCCESS" });

      toast.success("Category Delete Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to delete category");
      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };


  export const getAllSellersDashboard =
  (queryString) => async (dispatch, getState) => {
    const { user } = getState().auth;
    try {
      dispatch({ type: "IS_FETCHING" });
      const { data } = await api.get(`/auth/sellers?${queryString}`);
      const mapped = mapPageContent(data, mapSellers);
      dispatch({
        type: "GET_SELLERS",
        payload: mapped.content,
        pageNumber: mapped.pageNumber,
        pageSize: mapped.pageSize,
        totalElements: mapped.totalElements,
        totalPages: mapped.totalPages,
        lastPage: mapped.lastPage,
      });

      dispatch({ type: "IS_SUCCESS" });
    } catch (err) {
      console.log(err);
      handleListError(
        dispatch,
        err?.response?.data?.message,
        "Failed to fetch sellers data",
        dispatchEmptySellers
      );
    }
  };

export const addNewDashboardSeller =
  (sendData, toast, reset, setOpen, setLoader, navigate, pathname) => async (dispatch) => {
    try {
      setLoader(true);
      await api.post("/auth/signup", buildSellerPayload(sendData));
      reset();
      toast.success("Seller registered successfully!");

      if (navigate && pathname) {
        navigate(`${pathname}?page=1`);
      }
      await dispatch(getAllSellersDashboard("pageNumber=0"));
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.password ||
          "Internal Server Error"
      );
    } finally {
      setLoader(false);
      setOpen(false);
    }
  };

export const clearErrors = () => ({ type: "CLEAR_ERRORS" });

export const getUserOrders = (queryString) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(`/order/users?${queryString}`);
        const mapped = mapPageContent(data, mapOrders);
        dispatch({
            type: "GET_USER_ORDERS",
            payload: mapped.content,
            pageNumber: mapped.pageNumber,
            pageSize: mapped.pageSize,
            totalElements: mapped.totalElements,
            totalPages: mapped.totalPages,
            lastPage: mapped.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        handleListError(
            dispatch,
            error?.response?.data?.message,
            "Failed to fetch your orders",
            (d) => {
                const empty = buildEmptyPageResponse();
                dispatch({
                    type: "GET_USER_ORDERS",
                    payload: empty.content,
                    pageNumber: empty.pageNumber,
                    pageSize: empty.pageSize,
                    totalElements: empty.totalElements,
                    totalPages: empty.totalPages,
                    lastPage: empty.lastPage,
                });
                dispatch({ type: "IS_SUCCESS" });
            }
        );
    }
};

export const getUserOrderDetail = (orderId) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(`/order/users/${orderId}`);
        dispatch({ type: "GET_USER_ORDER_DETAIL", payload: mapOrder(data) });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch order details",
        });
    }
};

export const clearUserOrderDetail = () => ({ type: "CLEAR_USER_ORDER_DETAIL" });
export const clearUserOrders = () => ({ type: "CLEAR_USER_ORDERS" });