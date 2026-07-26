import React, { useEffect, useRef, useState } from 'react'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom'
import { stripePaymentConfirmation } from '../../store/actions';
import toast from 'react-hot-toast';
import Skeleton from '../shared/Skeleton';

const PaymentConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const dispatch = useDispatch();
    const  [errorMessage, setErrorMessage ] = useState("");
    const [ loading, setLoading] = useState(false);
    const reduxCheckoutAddress = useSelector(
        (state) => state.auth.selectedUserCheckoutAddress
    );
    // Idempotencia frente a StrictMode (dev) Y recargas del navegador:
    // sessionStorage sobrevive a F5 dentro de la misma pestana, evitando
    // disparar placeOrder dos veces para el mismo payment_intent. Sin esto,
    // la 2a llamada encuentra el carrito ya vacio -> "Cart is empty".
    const confirmedRef = useRef(false);

    // El redirect de Stripe (3DS off-site) provoca una recarga de pagina,
    // reiniciando Redux. Por eso se persiste CHECKOUT_ADDRESS en localStorage
    // como puente entre el checkout y la confirmacion. Se prefiere Redux si
    // esta disponible.
    const selectedUserCheckoutAddress = reduxCheckoutAddress
        || (localStorage.getItem("CHECKOUT_ADDRESS")
            ? JSON.parse(localStorage.getItem("CHECKOUT_ADDRESS"))
            : null);

    // Caso A (nuevo flujo, redirect: "if_required"): PaymentForm despacho
    // placeOrder y navego aqui con navigation state. No hay query params de
    // Stripe; el resultado llega en location.state. Si leemos state
    // redirectStatus === "succeeded", NO volvemos a disparar placeOrder.
    const navState = location.state || {};
    const fromFormSuccess = navState.redirectStatus === "succeeded";

    // Caso B (flujo legacy, redirect: "always" en 3DS off-site): Stripe
    // redirige con query params. Los leemos para disparar placeOrder.
    const paymentIntent = navState.paymentIntent
        || searchParams.get("payment_intent");
    const clientSecret = searchParams.get("payment_intent_client_secret");
    const redirectStatus = fromFormSuccess
        ? "succeeded"
        : searchParams.get("redirect_status");

    useEffect(() => {
        // Caso A: ya fue confirmado por PaymentForm via dispatch directo. Solo
        // mostramos el resultado que nos paso; jamas disparamos placeOrder de
        // nuevo (evita duplicacion y el falso "Payment Failed" de "Cart is
        // empty").
        if (fromFormSuccess) {
            if (navState.error) setErrorMessage(navState.error);
            return;
        }

        // Caso B (legacy): Stripe redirigio con query params.
        if (!paymentIntent || !clientSecret) {
            setErrorMessage(
                "We could not verify your payment. If you were charged, please contact support."
            );
            return;
        }

        if (redirectStatus !== "succeeded") {
            const statusText = redirectStatus === "processing"
                ? "Your payment is still processing. We will notify you once it completes."
                : redirectStatus === "requires_payment_method"
                    ? "The payment was not completed. Please try again."
                    : `Payment status: ${redirectStatus || "unknown"}. Please try again.`;
            setErrorMessage(statusText);
            return;
        }

        if (!selectedUserCheckoutAddress?.addressId) {
            setErrorMessage(
                "We could not find your checkout address. If you were charged, please contact support."
            );
            return;
        }

        // Idempotencia frente a StrictMode (dev) Y recargas del navegador.
        const confirmKey = `pi_confirmed:${paymentIntent}`;
        if (confirmedRef.current || sessionStorage.getItem(confirmKey) === "1") {
            return;
        }
        confirmedRef.current = true;
        sessionStorage.setItem(confirmKey, "1");

        setLoading(true);
        const sendData = {
            addressId: selectedUserCheckoutAddress.addressId,
            pgName: "Stripe",
            pgPaymentId: paymentIntent,
            pgStatus: "succeeded",
            pgResponseMessage: "Payment successful"
        };
        const onError = (msg) => {
            sessionStorage.removeItem(confirmKey);
            confirmedRef.current = false;
            setErrorMessage(msg);
        };
        dispatch(stripePaymentConfirmation(
            sendData,
            onError,
            setLoading,
            toast
        ));
    }, [paymentIntent, clientSecret, redirectStatus, dispatch, selectedUserCheckoutAddress, fromFormSuccess, navState.error]);

  return (
    <div className='min-h-screen flex items-center justify-center'>
        {loading ? (
            <div className="max-w-xl mx-auto">
                <Skeleton />
          </div>
        ) : (
            <div className="p-8 rounded-lg shadow-lg text-center max-w-md mx-auto border border-gray-200">
                {errorMessage ? (
                    <>
                        <div className="text-red-500 mb-4 flex justify-center">
                            <FaTimesCircle size={64} />
                        </div>
                        <h2 className='text-3xl font-bold text-gray-800 mb-2'>Payment Failed</h2>
                        <p className="text-gray-600 mb-6">{errorMessage}</p>
                    </>
                ) : (
                    <>
                        <div className="text-green-500 mb-4 flex  justify-center">
                            <FaCheckCircle size={64} />
                        </div>
                        <h2 className='text-3xl font-bold text-gray-800 mb-2'>Payment Successful!</h2>
                        <p className="text-gray-600 mb-6">
                            Thank you for your purchase! Your payment was successful, and we’re
                            processing your order.
                        </p>
                    </>
                )}
                <button
                    onClick={() => navigate("/")}
                    className="bg-custom-blue text-white font-semibold px-6 h-10 rounded-md w-full">
                    Continue Shopping
                </button>
            </div>
        )}
    </div>
  )
}

export default PaymentConfirmation
