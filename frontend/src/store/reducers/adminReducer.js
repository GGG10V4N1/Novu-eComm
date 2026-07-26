const initialState = {
    analytics: {},
    dashboardOrders: [],
};

export const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_ANALYTICS":
            return {
                ...state,
                analytics: action.payload,
            };
        case "SET_DASHBOARD_ORDERS_CHARTS":
            return {
                ...state,
                dashboardOrders: action.payload,
            };
        case "CLEAR_DASHBOARD_DATA":
            return {
                ...state,
                analytics: {},
                dashboardOrders: [],
            };
            
        default:
            return state;
    }
};

