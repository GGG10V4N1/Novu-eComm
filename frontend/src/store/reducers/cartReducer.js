const initialState = {
    cart: [],
    totalPrice: 0,
    cartId: null,
}

export const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_CART": {
            const productToAdd = action.payload;
            const existingProduct = state.cart.find(
                (item) => item.productId === productToAdd.productId
            );

            if(existingProduct) {
                const existingQty = Number(existingProduct.quantity) || 0;
                const addingQty = Number(productToAdd.quantity) || 0;
                const updatedCart = state.cart.map((item) => {
                    if (item.productId === productToAdd.productId) {
                        return {
                            ...item,
                            ...productToAdd,
                            quantity: existingQty + addingQty,
                        };
                    } else {
                        return item;
                    }
                });

                return {
                    ...state,
                    cart: updatedCart,
                };
            } else {
                const newCart = [...state.cart, productToAdd];
                return {
                    ...state,
                    cart: newCart,
                };
            }
        }
        case "SET_CART_QUANTITY": {
            const productToUpdate = action.payload;
            const updatedCart = state.cart.map((item) => {
                if (item.productId === productToUpdate.productId) {
                    return {
                        ...item,
                        ...productToUpdate,
                        quantity: Number(productToUpdate.quantity) || 0,
                    };
                }
                return item;
            });

            return {
                ...state,
                cart: updatedCart,
            };
        }
        case "REMOVE_CART":
            return {
                ...state,
                cart: state.cart.filter(
                    (item) => item.productId !== action.payload.productId
                ),
            };
        case "SYNC_CART":
            return {
                ...state,
                cart: action.payload || [],
            };
        case "GET_USER_CART_PRODUCTS":
            return {
                ...state,
                cart: action.payload,
                totalPrice: action.totalPrice,
                cartId: action.cartId,
            };
        case "CLEAR_CART":
            return { cart:[], totalPrice: 0, cartId: null};
        default:
            return state;
    }
}