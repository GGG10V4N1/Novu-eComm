const initialState = {
    user: null,
    address: [],
    clientSecret: null,
    selectedUserCheckoutAddress: null,
    sessionHydrated: false,
}

export const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case "LOGIN_USER":
            return { ...state, user: action.payload, sessionHydrated: true };
        case "SESSION_HYDRATED":
            return { ...state, sessionHydrated: true };
        case "USER_ADDRESS":
            return { ...state, address: action.payload };
        case "SELECT_CHECKOUT_ADDRESS":
            return { ...state, selectedUserCheckoutAddress: action.payload };
        case "REMOVE_CHECKOUT_ADDRESS":
            return { ...state, selectedUserCheckoutAddress: null };
        case "CLIENT_SECRET":
            return { ...state, clientSecret: action.payload };
        case "REMOVE_CLIENT_SECRET":
            // Limpia solo el clientSecret. Mantiene la direccion de checkout
            // seleccionada (Checkout.jsx lo usa al montar para forzar un
            // PaymentIntent fresco sin perder la direccion elegida).
            return { ...state, clientSecret: null };
        case "REMOVE_CLIENT_SECRET_ADDRESS":
            return { ...state, clientSecret: null, selectedUserCheckoutAddress: null };
        case "LOG_OUT":
            return {
                user: null,
                address: null,
                clientSecret: null,
                selectedUserCheckoutAddress: null,
                // Tras logout no necesitamos volver a hidratar la sesion:
                // marcamos hydrated=true para que PrivateRoute no se quede
                // mostrando una pantalla blanca (null) esperando hydrateSession.
                sessionHydrated: true,
            };
             
        default:
            return state;
    }
};