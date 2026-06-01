import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

export default function CheckoutForm({ onPaymentSuccess, acompteAmount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    // 1. Confirmer le paiement directement avec Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Empêche la redirection automatique si la banque ne l'exige pas
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // 2. Le paiement est un succès ! On déclenche le callback du composant parent
      onPaymentSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Composant Stripe officiel hautement sécurisé */}
      <div className="bg-white p-4 border border-neutral-200 rounded-xl shadow-3xs">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {errorMessage && (
        <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-light">
          ⚠️ {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-[#1C1A17] hover:bg-[#C5A880] text-white font-bold uppercase tracking-[0.2em] py-4 text-[10px] transition-all duration-500 rounded-none shadow-md disabled:bg-neutral-300 cursor-pointer"
      >
        {isProcessing ? "Traitement bancaire..." : `Régler l'acompte (${acompteAmount} €)`}
      </button>
    </form>
  );
}