import React, { useCallback, useEffect, useState } from 'react';
import { CardElement, useElements, useStripe } from './cardElement';
import { useDispatch, useSelector } from 'react-redux';
import {
  accessCartItems,
  paymentSuccessful,
  postCreatePaymentIntentAsyncThunk
} from '../../../features/cart/cartSlice';
import { LoadingSpinner } from '../../elements/Loading';
import './checkoutForm.scss';
import { safelyExecuteSync } from '../../../shared/promises';


export function CheckoutForm() {

  const [ succeeded, setSucceeded ] = useState(false);
  const [ error, setError ] = useState(null);
  const [ processing, setProcessing ] = useState('');
  const [ disabled, setDisabled ] = useState(true);
  const [ clientSecret, setClientSecret ] = useState('');

  const stripe = useStripe();
  const elements = useElements();
  const cartItems = useSelector(accessCartItems());

  const dispatch = useDispatch();
  const handleCreatePaymentIntent = useCallback(async (items) => {
    // POST api/payment/intent:
    const { payload } = await dispatch(postCreatePaymentIntentAsyncThunk({ items }));
    setClientSecret(payload?.clientSecret ?? '');
  }, [ dispatch ]);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    void handleCreatePaymentIntent(cartItems);
    setSucceeded(false);
  }, [ cartItems, handleCreatePaymentIntent ]);

  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#32325d'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  };

  const handleChange = useCallback(async (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : '');
  }, []);

  const handleSubmit = useCallback(async ev => {

    ev.preventDefault();
    setProcessing(true);

    const [ err, card ] = safelyExecuteSync(() => elements.getCardValue())();
    if (err) {
      console.log(err);
      debugger;
      throw err;
    }

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card //: elements.getElement(CardElement)
      }
    });

    if (payload.error) {
      setError(`${ payload.error.message }`);
      setProcessing(false);
    } else {
      setError(null);
      setProcessing(false);
      setSucceeded(true);
      dispatch(paymentSuccessful());
    }
  }, [ clientSecret, dispatch, elements, stripe ]);

  if (!clientSecret) {
    return null;
  }

  return (
    <form id="payment-form" onSubmit={ handleSubmit }>
      <CardElement id="card-element" options={ cardStyle } onChange={ handleChange } />
      <button type="submit"
        disabled={ processing || disabled || succeeded }
        id="submit"
      >
        <span id="button-text">
          { processing ? (
            <LoadingSpinner />
          ) : (
            'Pay now'
          ) }
        </span>
      </button>
      {/* Show any error that happens when processing the payment */ }
      { error && (
        <div className="card-error text-danger my-2" role="alert">
          Payment failed: <strong>{ error }</strong>
        </div>
      ) }
      {/* Show a success message upon completion */ }
      <p className={ succeeded ? 'result-message text-success my-2 font-weight-bold' : 'd-none' }>
        Payment succeeded!
      </p>
    </form>
  );
}
