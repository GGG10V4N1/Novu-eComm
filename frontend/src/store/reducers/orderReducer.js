const initialState = {
    adminOrder: null,
    pagination: {},
    userOrders: [],
    userOrderPagination: {},
    userOrderDetail: null,
};

export const orderReducer = (state = initialState, action) => {
    switch (action.type) {
        case "GET_ADMIN_ORDERS":
            return {
                ...state,
                adminOrder: action.payload,
                pagination: {
                    ...state.pagination,
                    pageNumber: action.pageNumber,
                    pageSize: action.pageSize,
                    totalElements: action.totalElements,
                    totalPages: action.totalPages,
                    lastPage: action.lastPage,
                },
            };
        case "GET_USER_ORDERS":
            return {
                ...state,
                userOrders: action.payload,
                userOrderPagination: {
                    pageNumber: action.pageNumber,
                    pageSize: action.pageSize,
                    totalElements: action.totalElements,
                    totalPages: action.totalPages,
                    lastPage: action.lastPage,
                },
            };
        case "GET_USER_ORDER_DETAIL":
            return {
                ...state,
                userOrderDetail: action.payload,
            };
        case "CLEAR_USER_ORDER_DETAIL":
            return {
                ...state,
                userOrderDetail: null,
            };
        case "CLEAR_USER_ORDERS":
            return {
                ...state,
                userOrders: [],
                userOrderPagination: {},
                userOrderDetail: null,
            };
        case "CLEAR_ADMIN_ORDERS":
            return {
                ...state,
                adminOrder: [],
                pagination: {},
            };
        default:
            return state;
    }
};