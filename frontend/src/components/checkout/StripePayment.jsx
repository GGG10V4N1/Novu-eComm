import { Alert, AlertTitle, Skeleton } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import PaymentForm from './PaymentForm';
import { clearErrors, createStripePaymentSecret } from '../../store/actions';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePayment = () => {
  const dispatch = useDispatch();
  const { clientSecret } = useSelector((state) => state.auth);
  const { totalPrice } = useSelector((state) => state.carts);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const { user, selectedUserCheckoutAddress } = useSelector((state) => state.auth);

  useEffect(() => {
    // Limpia cualquier errorMessage residual en el reducer de errores.
    // Sin esto, un fallo previo de createStripePaymentSecret (p.ej. por un
    // error transitorio) deja errorMessage seteado y el render muestra el
    // Alert "Payment Error" en lugar de reintentar crear el clientSecret,
    // dejando al usuario sin poder pagar aunque el carrito y la direccion
    // esten correctos. Checkout.jsx tambien llama clearErrors al montar,
    // pero un error que ocurra despues podia quedar pegado.
    dispatch(clearErrors());
  }, [dispatch]);

  useEffect(() => {
    // Solo crea un nuevo client secret si no existe uno previo (o si el monto
    // cambio desde la ultima solicitud). Si quedo un clientSecret residual
    // de una compra anterior, lo anulamos primero para forzar uno fresco.
    if (!clientSecret && user?.email && selectedUserCheckoutAddress && totalPrice > 0) {
    const sendData = {
      amount: Number(totalPrice) * 100,
      currency: "usd",
      email: user.email,
      name: `${user.username}`,
      address: selectedUserCheckoutAddress,
      description: `Order for ${user.email}`,
      metadata: {
        test: "1"
      }
    };
      dispatch(createStripePaymentSecret(sendData, toast));
    }
  }, [clientSecret, dispatch, user, selectedUserCheckoutAddress, totalPrice]);

  if (isLoading) {
    return (
      <div className='max-w-lg mx-auto'>
        <Skeleton />
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className='max-w-lg mx-auto'>
        <Alert severity='error'>
          <AlertTitle>Payment Error</AlertTitle>
          {errorMessage}
        </Alert>
      </div>
    )
  }

  return (
    <>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm clientSecret={clientSecret} totalPrice={totalPrice} />
        </Elements>
      )}
      {!clientSecret && !isLoading && !errorMessage && (
        <div className='max-w-lg mx-auto p-4 text-center text-gray-600'>
          <p className='font-semibold'>Preparing your payment…</p>
          <p className='text-sm mt-1'>
            If this takes too long, please go back and verify that an address
            is selected and your cart is not empty.
          </p>
        </div>
      )}
    </>
  )
}

export default StripePayment
