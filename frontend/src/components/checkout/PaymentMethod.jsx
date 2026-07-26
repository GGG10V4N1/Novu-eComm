import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { addPaymentMethod, createUserCart, getUserCart } from '../../store/actions';

const PaymentMethod = () => {
    const dispatch = useDispatch();
    const store = useStore();
    const { paymentMethod } = useSelector((state) => state.payment);
    const { cart, cartId } = useSelector((state) => state.carts);
    const { user } = useSelector((state) => state.auth);

    // Evita disparar createUserCart multiples veces (StrictMode en dev,
    // re-renders por cambios de cart, etc). Sin esta guarda, si el usuario
    // logueado tenia items en Redux pero cartId=null porque getUserCart aun
    // no habia respondido, el efecto disparaba createUserCart aunque el
    // backend ya tuviera un carrito valido con items -> el backend hacia
    // deleteAllByCartId + re-insert, dejando la sesion Hibernate inconsistente
    // y, eventualmente, placeOrder encontraba el carrito vacio ("Cart is empty").
    const syncingRef = useRef(false);

    useEffect(() => {
        // Solo aplica a usuarios logueados. Los invitados no tienen carrito en
        // backend; su carrito vive solo en Redux (memoria) y se materializa al final.
        if (!user) return;
        if (cartId) return;
        if (cart.length === 0) return;
        if (syncingRef.current) return;
        syncingRef.current = true;

        dispatch({ type: "CLEAR_ERRORS" });

        // Primero intentamos recuperar el carrito del backend: si ya existe
        // (con items), getUserCart() populara cartId en Redux y NO forzamos
        // createUserCart. Solo si getUserCart falla/no encuentra carrito,
        // creamos uno nuevo con los items locales. Esto evita el borrado
        // accidental de un carrito backend valido.
        (async () => {
            try {
                await dispatch(getUserCart());
            } catch {
                // getUserCart ya gestiona sus errores internamente; ignoramos.
            }

            // Si tras getUserCart aun no hay cartId, el carrito no existe en
            // backend: lo creamos con los items locales.
            const stillNoCartId = !store.getState().carts.cartId;
            if (stillNoCartId) {
                const sendCartItems = cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                }));
                dispatch(createUserCart(sendCartItems));
            }
        })();
    }, [dispatch, store, user, cartId, cart]);

    const paymentMethodHandler = (method) => {
        dispatch(addPaymentMethod(method));
    }
  return (
    <div className='max-w-md mx-auto p-5 bg-white shadow-md rounded-lg mt-16 border'>
        <h1 className='text-2xl font-semibold mb-4'>Select Payment Method</h1>
        <FormControl>
            <RadioGroup
                aria-label="payment method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => paymentMethodHandler(e.target.value)}
            >
                <FormControlLabel 
                    value="Stripe" 
                    control={<Radio color='primary' />} 
                    label="Stripe" 
                    className='text-gray-700'/>
            </RadioGroup>
        </FormControl>
    </div>
  )
}

export default PaymentMethod