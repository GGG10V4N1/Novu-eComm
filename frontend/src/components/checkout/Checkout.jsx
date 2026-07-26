import { Button, Step, StepLabel, Stepper } from '@mui/material';
import React, { useEffect, useState } from 'react'
import AddressInfo from './AddressInfo';
import { useDispatch, useSelector } from 'react-redux';
import { getUserAddresses } from '../../store/actions';
import { clearErrors } from '../../store/actions';
import toast from 'react-hot-toast';
import Skeleton from '../shared/Skeleton';
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';
import StripePayment from './StripePayment';

const Checkout = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [maxStepReached, setMaxStepReached] = useState(0);
    const dispatch = useDispatch();
    const { isLoading, errorMessage } = useSelector((state) => state.errors);
    const { cart, totalPrice } = useSelector((state) => state.carts);
    const { address, selectedUserCheckoutAddress } = useSelector(
        (state) => state.auth
    )
    const { paymentMethod } = useSelector((state) => state.payment);

    const handleBack = () => {
        setActiveStep((prevStep) => Math.max(0, prevStep - 1));
    };

    const handleNext = () => {
        if(activeStep === 0 && !selectedUserCheckoutAddress) {
            toast.error("Please select checkout address before proceeding.");
            return;
        }

        if(activeStep === 1 && (!selectedUserCheckoutAddress || !paymentMethod)) {
            if(!selectedUserCheckoutAddress) {
                toast.error("Please select checkout address before proceeding.");
            } else {
                toast.error("Please select payment method before proceeding.");
            }
            return;
        }
        
        setActiveStep((prevStep) => {
            const next = prevStep + 1;
            setMaxStepReached((prevMax) => Math.max(prevMax, next));
            return next;
        });
    };

    const handleStepClick = (index) => {
        if (index <= maxStepReached) {
            setActiveStep(index);
        }
    };

    const steps = [
        "Address",
        "Payment Method",
        "Order Summary",
        "Payment",
    ];
    
    useEffect(() => {
        // Limpia un posible clientSecret residual de una compra anterior para
        // que StripePayment cree un PaymentIntent nuevo. NO tocamos
        // selectedUserCheckoutAddress aqui: vienen de la seleccion del step 0.
        dispatch({ type: "REMOVE_CLIENT_SECRET" });
        dispatch(clearErrors());
        dispatch(getUserAddresses());
    }, [dispatch]);

  return (
    <div className='py-14 min-h-[calc(100vh-100px)]'>
        <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => {
                const isAccessible = index <= maxStepReached;
                const isCompleted = index < maxStepReached;
                return (
                    <Step
                        key={index}
                        completed={isCompleted}
                        sx={{
                            '& .MuiStepLabel-root': {
                                cursor: isAccessible ? 'pointer' : 'default',
                            },
                            '& .MuiStepLabel-label': {
                                color: isCompleted
                                    ? 'success.main'
                                    : undefined,
                            },
                            '& .Mui-completed': {
                                color: 'success.main !important',
                            },
                        }}
                        onClick={isAccessible ? () => handleStepClick(index) : undefined}
                        disabled={!isAccessible}
                    >
                        <StepLabel>{label}</StepLabel>
                    </Step>
                );
            })}
        </Stepper>

        {/*
          Skeleton global SOLO mientras se cargan las direcciones del backend
          (step 0). Los demas steps manejan su propio loading interno
          (PaymentMethod via createUserCart/getUserCart, StripePayment via
          createStripePaymentSecret). Antes, cualquier IS_FETCHING global
          (incluido getUserCart en segundo plano) mostraba Skeleton sobre TODO
          el contenido y bloqueaba el flujo de pago.
        */}
        {activeStep === 0 && isLoading ? (
            <div className='lg:w-[80%] mx-auto py-5 pb-28'>
                <Skeleton />
            </div>
        ) : (
            <div className='mt-5 pb-28'>
                {activeStep === 0 && <AddressInfo address={address} />}
                {activeStep === 1 && <PaymentMethod />}
                {activeStep === 2 && <OrderSummary 
                                        totalPrice={totalPrice}
                                        cart={cart}
                                        address={selectedUserCheckoutAddress}
                                        paymentMethod={paymentMethod}/>}
                {activeStep === 3 &&
                    <>
                        {paymentMethod === "Stripe" && (
                            <StripePayment />
                        )}
                    </>}
            </div>
        )}
        

        <div
            className='flex justify-between items-center px-4 fixed z-50 h-24 bottom-0 bg-white left-0 w-full py-4 border-slate-200'
            style={{ boxShadow: "0 -2px 4px rgba(100, 100, 100, 0.15)" }}>
            <Button
                variant='outlined'
                disabled={activeStep === 0}
                onClick={handleBack}>
                    Back
            </Button>

            {activeStep !== steps.length - 1 && (
                <button
                    disabled={!!errorMessage}
                    className={`bg-custom-blue font-semibold px-6 h-10 rounded-md text-white
                       ${errorMessage ? "opacity-60" : ""}`}
                       onClick={handleNext}>
                    Proceed
                </button>
            )} 
        </div>
    </div>
  );
}

export default Checkout;