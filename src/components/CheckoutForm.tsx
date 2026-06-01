import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

// 1. TYPAGE DES PROPS
interface CheckoutFormProps {
  onPaymentSuccess: (paymentIntentId: string) => void;
  acompteAmount: number | string;
}

export default function CheckoutForm({ onPaymentSuccess, acompteAmount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  // 2. TYPAGE DE L'ÉTAT (Peut être string ou null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      // 3. Fallback au cas où error.message serait undefined
      setErrorMessage(error.message || "Une erreur inconnue est survenue.");
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