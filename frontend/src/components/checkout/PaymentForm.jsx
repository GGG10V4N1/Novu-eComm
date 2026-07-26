import { Skeleton } from '@mui/material';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { stripePaymentConfirmation } from '../../store/actions';

const PaymentForm = ({ clientSecret, totalPrice }) => {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedUserCheckoutAddress } = useSelector((state) => state.auth);
    const [errorMessage, setErrorMessage] = useState("");
    const [processing, setProcessing] = useState(false);

    // Dispara placeOrder en el backend y navega a /order-confirm pasando el
    // resultado por navigation state (en lugar de por query params de Stripe),
    // evitando la recarga del navegador y la perdida de Redux.
    const confirmOrderAndNavigate = async (paymentIntent) => {
        // Sin direccion de checkout en Redux, derivamos al flujo legacy con
        // query params para que PaymentConfirmation lo gestione rehidratando
        // la direccion desde localStorage.
        if (!selectedUserCheckoutAddress?.addressId) {
            const pi = paymentIntent?.id || "";
            const cs = clientSecret || "";
            const qs = pi && cs
                ? `?payment_intent=${encodeURIComponent(pi)}&payment_intent_client_secret=${encodeURIComponent(cs)}&redirect_status=succeeded`
                : "";
            setProcessing(false);
            navigate(`/order-confirm${qs}`, { replace: true });
            return;
        }

        const sendData = {
            addressId: selectedUserCheckoutAddress.addressId,
            pgName: "Stripe",
            pgPaymentId: paymentIntent.id,
            pgStatus: "succeeded",
            pgResponseMessage: "Payment successful",
        };

        let placementError = null;
        const onError = (msg) => { placementError = msg; };
        const onFinally = () => { setProcessing(false); };

        // Esperamos a que el action termine antes de navegar, asi conocemos el
        // resultado y se lo pasamos a PaymentConfirmation via state (sin
        // depender de query params de Stripe, que ya no vienen con redirect
        // "if_required").
        await dispatch(stripePaymentConfirmation(
            sendData,
            onError,
            onFinally,
            toast
        ));

        navigate("/order-confirm", {
            replace: true,
            state: {
                paymentIntent: paymentIntent.id,
                redirectStatus: "succeeded",
                error: placementError,
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements || processing) {
            return;
        }

        setProcessing(true);
        setErrorMessage("");

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError.message);
            setProcessing(false);
            return;
        }

        // Usamos redirect: "if_required" para que el pago se confirme
        // in-place. Stripe solo redirige automaticamente si el metodo de pago
        // exige una accion off-site (3DS fuera de iframe). En el caso comun
        // (tarjeta sin 3DS, o 3DS dentro del iframe), la promesa resuelve con
        // { paymentIntent } y NO ocurre recarga del navegador.
        //
        // Esto es clave para evitar el bug del "Payment Failed" falso:
        //   - Con redirect: "always" (default), la recarga del navegador
        //     reinicia Redux (selectedUserCheckoutAddress se pierde y hay que
        //     rehidratarlo desde localStorage), y cualquier error transitorio
        //     o duplicacion de placeOrder terminaba mostrando "Payment Failed".
        //   - Con redirect: "if_required", controlamos el flujo: confirmamos
        //     el pago y, si succeeded, llamamos directamente a placeOrder en el
        //     backend con el estado de Redux intacto, sin recargar y sin pasar
        //     por /order-confirm con query params.
        const result = await stripe.confirmPayment({
            elements,
            clientSecret,
            redirect: "if_required",
        });

        // Flujo de exito: se confirma el cobro (con o sin error accionable).
        // Tanto result.paymentIntent como result.error?.paymentIntent (cuando
        // el SDK incluye el PI pese a un error no bloqueante) pueden traer
        // status "succeeded" -> el cobro SI ocurrio y debemos registrar la
        // orden.
        const pi = result.paymentIntent || result.error?.paymentIntent;
        if (pi && pi.status === "succeeded") {
            await confirmOrderAndNavigate(pi);
            return;
        }

        // A partir de aqui solo llegamos si hubo error y no tenemos un
        // PaymentIntent succeeded.
        if (result.error) {
            const type = result.error?.type || "";
            const code = result.error?.code || "";
            const isValidationErrorOrDecline =
                type === "validation_error" ||
                type === "card_error" ||
                code === "card_declined" ||
                code === "insufficient_funds" ||
                code === "expired_card" ||
                code === "incorrect_cvc" ||
                code === "processing_error" ||
                code === "fraudulent";

            if (isValidationErrorOrDecline) {
                // Error accionable: el cobro NO se efectuo. Mostramos el
                // mensaje para que el usuario corrija la tarjeta y reintente.
                setErrorMessage(result.error.message || "Your card was declined. Please try again.");
                setProcessing(false);
                return;
            }

            // Error no accionable (invalid_request_error, api_error, network,
            // etc.): el pago pudo quedar en estado incierto o en proceso, pero
            // NO confirmamos un cobro, asi que no mentimos con "Payment
            // Successful". Tampoco mostramos "Payment Failed", porque el cobro
            // pudo haberse iniciado en Stripe. Dejamos al usuario en
            // /order-confirm con un aviso neutral via state.
            if (toast) {
                toast.success(
                    "Your payment is being verified. If your order is not visible in your account shortly, please contact support.",
                    { duration: 6000 }
                );
            }
            setProcessing(false);
            navigate("/order-confirm", {
                replace: true,
                state: { redirectStatus: "succeeded", error: null },
            });
            return;
        }

        // result sin error pero sin paymentIntent succeeded (p.ej. status
        // "processing" o "requires_action"): el cobro aun no se concreto.
        setErrorMessage(
            `Your payment status is "${pi?.status || "unknown"}". If you were charged, please contact support.`
        );
        setProcessing(false);
    };

    const paymentElementOptions = {
        layout: "tabs",
    }

    const isLoading = !clientSecret || !stripe || !elements;

  return (
    <form onSubmit={handleSubmit} className='max-w-lg mx-auto p-4'>
        <h2 className='text-xl font-semibold mb-4'>Payment Information</h2>
        {isLoading ? (
            <Skeleton />
        ) : (
            <>
            {clientSecret && <PaymentElement  options={paymentElementOptions}/> }
            {errorMessage && (
                <div className='text-red-500 mt-2'>{errorMessage}</div>
            )}

            <button
                className='text-white w-full px-5 py-[10px] bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse'
                disabled={!stripe || isLoading || processing}>
                    {processing ? "Processing"
                        : !isLoading ? `Pay $${Number(totalPrice).toFixed(2)}`
                        : "Processing"}
            </button>
            </>
        )}
    </form>
  )
}

export default PaymentForm
