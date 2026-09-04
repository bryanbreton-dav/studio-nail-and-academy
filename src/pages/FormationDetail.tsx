import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, collection, addDoc, getDocs, query, where, type DocumentData } from 'firebase/firestore';

// IMPORTS STRIPE
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51UBatmAuqCScog0zSDOdLfjg9ooOhD03b04y3dXCp5F9KOHNSSHxLt42hS9Q7PPz8yYLpfholqGtJNJ5IpYUHzZg00CU0LjynL');

// 1. DÉFINITION DES INTERFACES
interface Formation {
  id: string;
  title: string;
  intro: string;
  imageUrl?: string;
  objectifs?: string;
  program: string;
  priceTotal: number | string;
  acompte: number | string;
  maxPlaces?: number;
  dates?: string[];
}

interface Reservation {
  formationId: string;
  formationTitle: string;
  dateSession: string;
  clientNom: string;
  clientPrenom: string;
  clientEmail: string;
  clientPhone: string;
  clientAdresse: string;
  createdAt: string;
  statutPaiement: string;
  stripePaymentId: string;
  montantAcompte: number | string;
}

// ==========================================
// SUB-COMPOSANT : FORMULAIRE STRIPE
// ==========================================
interface CheckoutFormProps {
  onPaymentSuccess: (id: string) => void;
  acompteAmount: number | string;
}

function CheckoutForm({ onPaymentSuccess, acompteAmount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message ?? "Une erreur inconnue est survenue");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-5 border border-neutral-100 rounded-2xl shadow-sm">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {errorMessage && (
        <div className="text-xs text-red-600 bg-red-50/80 p-4 rounded-xl border border-red-100 font-light leading-relaxed">
          ⚠️ {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-[#1C1A17] hover:bg-[#C5A880] text-white font-semibold uppercase tracking-[0.2em] py-4 text-[11px] transition-all duration-500 rounded-xl shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:bg-neutral-300 disabled:shadow-none disabled:transform-none cursor-pointer"
      >
        {isProcessing ? "Traitement bancaire..." : `Régler l'acompte (${acompteAmount} €)`}
      </button>
    </form>
  );
}

// ==========================================
// COMPOSANT PRINCIPAL : DETAIL DE FORMATION
// ==========================================
export default function FormationDetail() {
  const { id } = useParams<{ id: string }>();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [allReservations, setAllReservations] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [stripeClientSecret, setStripeClientSecret] = useState("");

  useEffect(() => {
    const fetchDocAndReservations = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "formations", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setFormation({ id: snap.id, ...snap.data() } as Formation);

          const q = query(collection(db, "reservations"), where("formationId", "==", snap.id));
          const resSnap = await getDocs(q);
          setAllReservations(resSnap.docs.map(d => d.data()));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocAndReservations();
  }, [id]);

  const getPlacesInfo = () => {
    if (!selectedDate || !formation) return { occupees: 0, reste: 0, isFull: false };

    const occupees = allReservations.filter(r => r.dateSession === selectedDate).length;
    const maxPlaces = formation.maxPlaces || 10;
    const reste = maxPlaces - occupees;

    return {
      occupees,
      reste: reste < 0 ? 0 : reste,
      isFull: occupees >= maxPlaces
    };
  };

  const { reste, isFull } = getPlacesInfo();

  const handleOpenReservation = () => {
    if (!selectedDate) {
      alert("Veuillez sélectionner une date disponible avant de réserver.");
      return;
    }
    if (isFull) {
      alert("Désolé, cette session est désormais complète.");
      return;
    }
    setModalStep(1);
    setShowModal(true);
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formation) return;
    if (!nom || !prenom || !email || !phone || !adresse) return alert("Champs requis.");

    setSubmitting(true);
    try {
      const response = await fetch("https://us-central1-studio-nails-586ea.cloudfunctions.net/createPaymentIntent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acompteAmount: formation.acompte,
          email: email,
          formationTitle: formation.title,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error || "Erreur lors de la récupération du secret de paiement.");
      }

      setStripeClientSecret(data.clientSecret);
      setModalStep(2);

    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      alert(`Impossible d'initialiser le module de paiement : ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!formation) return;
    
    try {
      const newReservation: Reservation = {
        formationId: formation.id,
        formationTitle: formation.title,
        dateSession: selectedDate,
        clientNom: nom,
        clientPrenom: prenom,
        clientEmail: email,
        clientPhone: phone,
        clientAdresse: adresse,
        createdAt: new Date().toISOString(),
        statutPaiement: "Payé",
        stripePaymentId: paymentIntentId,
        montantAcompte: formation.acompte
      };

      await addDoc(collection(db, "reservations"), newReservation);

      try {
        await fetch("https://us-central1-studio-nails-586ea.cloudfunctions.net/sendReservationEmails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientEmail: email,
            clientPrenom: prenom,
            clientNom: nom,
            formationTitle: formation.title,
            dateSession: selectedDate,
            acompteAmount: formation.acompte,
          }),
        });
      } catch (emailError) {
        console.error("L'enregistrement a réussi, mais l'envoi de l'e-mail a échoué :", emailError);
      }

      alert(`Paiement validé ! Merci ${prenom}, votre place est officiellement réservée.`);
      setShowModal(false);
      setNom(""); setPrenom(""); setEmail(""); setPhone(""); setAdresse("");

      const q = query(collection(db, "reservations"), where("formationId", "==", formation.id));
      const resSnap = await getDocs(q);
      setAllReservations(resSnap.docs.map(d => d.data()));

    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement de votre session. Contactez l'institut.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-xs uppercase tracking-[0.25em] text-neutral-400 animate-pulse">
        Chargement du programme d'exception...
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-6 px-4">
        <p className="text-base text-neutral-500 font-light italic text-center">Ce cursus n'existe pas ou a été déplacé.</p>
        <Link 
          to="/" 
          className="bg-[#1C1A17] hover:bg-[#C5A880] text-white px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-500 rounded-xl shadow-md"
        >
          ← Retourner au catalogue
        </Link>
      </div>
    );
  }

  const formatList = (text: string) => text ? text.split('\n').filter(line => line.trim() !== "") : [];

  const stripeOptions: StripeElementsOptions = {
    clientSecret: stripeClientSecret,
    appearance: {
      theme: 'flat' as const,
      variables: {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        colorPrimary: '#1C1A17',
        colorBackground: '#FAF9F6',
        colorText: '#1C1A17',
        borderRadius: '12px',
      },
    },
  };

  return (
    <div className="bg-[#FAF9F6] text-[#1C1A17] font-sans min-h-screen selection:bg-[#E6DCD2] pt-[88px] pb-32">
      
      {/* HEADER & FIL D'ARIANE */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-neutral-400 hover:text-[#C5A880] transition-colors mb-10 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Retour au catalogue
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-neutral-200/80 pb-10 mb-16">
          <div className="space-y-4 max-w-3xl">
            <span className="inline-flex gap-2 bg-[#C5A880]/10 text-[#C5A880] text-[10px] font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-[0.2em]">
              ✨ Studio Nail Academy • Masterclass
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extralight tracking-tight leading-[1.15] text-[#1C1A17]">
              {formation.title}
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-2.5 h-fit">
            <span className="text-[10px] uppercase tracking-wider font-semibold border border-emerald-200 bg-emerald-50/60 text-emerald-800 px-4 py-2 rounded-full">
              Certifié Qualiopi
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold border border-[#C5A880]/30 bg-white text-[#1C1A17] px-4 py-2 rounded-full shadow-2xs">
              Éligible FAFCEA
            </span>
          </div>
        </div>
      </div>

      {/* GRILLE DE CONTENU */}
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* COLONNE GAUCHE : VISUEL ET DÉTAILS */}
        <div className="lg:col-span-7 space-y-16">
          <div className="relative overflow-hidden rounded-3xl shadow-lg bg-white aspect-[16/10] border-4 border-white">
            <img 
              src={formation.imageUrl || "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80"} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
              alt={formation.title} 
            />
          </div>

          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
              <span className="text-base">💎</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880]">Présentation du Cursus</h2>
            </div>
            <p className="text-base text-neutral-600 font-light leading-relaxed whitespace-pre-line text-justify">
              {formation.intro}
            </p>
            {formation.objectifs && (
              <div className="bg-white border-l-4 border-[#C5A880] p-6 rounded-r-2xl shadow-sm space-y-2 mt-4">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A880] block">Objectif Clé</span>
                <p className="text-sm text-neutral-700 italic font-normal leading-relaxed">“{formation.objectifs}”</p>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
              <span className="text-base">📜</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880]">Curriculum Spécifique</h2>
            </div>
            <div className="space-y-3.5">
              {formatList(formation.program).map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-neutral-100 shadow-2xs hover:shadow-md transition-all duration-300">
                  <span className="font-serif text-sm italic text-[#C5A880] bg-[#FAF9F6] border border-[#E6DCD2] w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-neutral-700 font-light pt-0.5 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* COLONNE DROITE : CARTE DE RÉSERVATION STICKY */}
        <div className="lg:col-span-5 sticky top-28">
          <div className="bg-white rounded-3xl p-8 md:p-10 space-y-8 border border-neutral-100 shadow-xl">
            
            <div className="flex justify-between items-end border-b border-neutral-100 pb-6">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 block mb-1 font-semibold">Valeur du cursus</span>
                <span className="text-2xl font-light tracking-tight text-[#1C1A17]">{formation.priceTotal} €</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-widest text-[#C5A880] font-bold block mb-1">Acompte requis</span>
                <span className="text-2xl font-bold tracking-tight text-[#C5A880]">{formation.acompte} €</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-[0.15em] text-neutral-500 block">
                Choisir votre session :
              </label>
              <div className="relative">
                <select 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  className="w-full p-4 border border-neutral-200 text-xs bg-[#FAF9F6] text-[#1C1A17] rounded-xl focus:outline-none appearance-none focus:border-[#C5A880] transition-colors font-light cursor-pointer pr-10"
                >
                  <option value="">-- Sélectionner une date disponible --</option>
                  {formation.dates?.map((d, i) => <option key={i} value={d}>{d}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400 text-xs">▼</div>
              </div>
            </div>

            {selectedDate && (
              <div className="animate-fade-in">
                {isFull ? (
                  <div className="text-center py-3 px-4 text-[10px] uppercase tracking-wider font-semibold rounded-xl bg-red-50 border border-red-100 text-red-600">
                    ⚠️ Session complète
                  </div>
                ) : reste <= 2 ? (
                  <div className="text-center py-3 px-4 text-[10px] uppercase tracking-wider font-bold rounded-xl bg-amber-50 border border-amber-200 text-amber-800 animate-[pulse_2.5s_infinite]">
                    🔥 Plus que {reste} place{reste > 1 ? 's' : ''} disponible{reste > 1 ? 's' : ''} !
                  </div>
                ) : (
                  <div className="text-center py-3 px-4 text-[10px] uppercase tracking-wider rounded-xl bg-[#FAF9F6] border border-neutral-100 text-neutral-600 font-light">
                    {reste} places disponibles
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleOpenReservation}
              disabled={isFull || !selectedDate}
              className={`w-full py-4 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-500 rounded-xl shadow-lg cursor-pointer text-white transform active:scale-95 ${
                isFull || !selectedDate 
                  ? 'bg-neutral-200 text-neutral-400 border-neutral-200 cursor-not-allowed shadow-none transform-none' 
                  : 'bg-[#1C1A17] hover:bg-[#C5A880] hover:-translate-y-0.5'
              }`}
            >
              {isFull ? "Complet" : !selectedDate ? "Sélectionnez une date" : "Réserver ma place en ligne"}
            </button>

            <p className="text-[10px] text-center text-neutral-400 font-light leading-relaxed">
              🔒 Paiement 100% sécurisé via Stripe • Validation immédiate
            </p>
          </div>
        </div>
      </div>

      {/* POP-IN (MODAL) HAUT DE GAMME */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-[#FAF9F6] p-8 md:p-10 max-w-lg w-full rounded-3xl shadow-2xl space-y-6 border border-white/20 relative max-h-[90vh] overflow-y-auto">

            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-neutral-200/50 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer text-lg font-light"
            >
              ×
            </button>

            {/* ÉTAPE 1 : RENSEIGNEMENTS */}
            {modalStep === 1 && (
              <>
                <div className="space-y-2 border-b border-neutral-200/80 pb-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">Étape 1 sur 2</span>
                  <h3 className="text-xl font-light text-[#1C1A17]">Vos Coordonnées</h3>
                  <p className="text-xs font-light text-neutral-500">
                    Session sélectionnée : <span className="font-semibold text-[#1C1A17]">{selectedDate}</span>
                  </p>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Prénom</label>
                      <input required type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="w-full p-3.5 bg-white border border-neutral-200 focus:outline-none focus:border-[#C5A880] text-xs rounded-xl font-light transition-colors" placeholder="Julie" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Nom</label>
                      <input required type="text" value={nom} onChange={(e) => setNom(e.target.value)} className="w-full p-3.5 bg-white border border-neutral-200 focus:outline-none focus:border-[#C5A880] text-xs rounded-xl font-light transition-colors" placeholder="Dupont" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Adresse Électronique</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 bg-white border border-neutral-200 focus:outline-none focus:border-[#C5A880] text-xs rounded-xl font-light transition-colors" placeholder="julie.dupont@exemple.com" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Téléphone</label>
                    <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3.5 bg-white border border-neutral-200 focus:outline-none focus:border-[#C5A880] text-xs rounded-xl font-light transition-colors" placeholder="06 12 34 56 78" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Adresse Postale Complète</label>
                    <textarea required rows={2} value={adresse} onChange={(e) => setAdresse(e.target.value)} className="w-full p-3.5 bg-white border border-neutral-200 focus:outline-none focus:border-[#C5A880] text-xs rounded-xl resize-none font-light transition-colors" placeholder="12 rue de la Paix, 75000 Paris"></textarea>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="w-full bg-[#1C1A17] hover:bg-[#C5A880] text-white font-semibold uppercase tracking-[0.2em] py-4 text-[11px] transition-all duration-500 rounded-xl shadow-lg transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    >
                      {submitting ? "Traitement..." : "Continuer vers le paiement →"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ÉTAPE 2 : PAIEMENT STRIPE */}
            {modalStep === 2 && stripeClientSecret && (
              <>
                <div className="space-y-2 border-b border-neutral-200/80 pb-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A880]">Étape 2 sur 2</span>
                  <h3 className="text-xl font-light text-[#1C1A17]">Règlement de l'acompte</h3>
                  <p className="text-xs font-light text-neutral-500">
                    Réservation au nom de <span className="font-semibold text-[#1C1A17]">{prenom} {nom}</span>
                  </p>
                </div>

                <Elements stripe={stripePromise} options={stripeOptions}>
                  <CheckoutForm
                    acompteAmount={formation.acompte}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </Elements>

                <button
                  onClick={() => setModalStep(1)}
                  className="text-center w-full block text-[10px] uppercase font-semibold tracking-wider text-neutral-400 hover:text-[#1C1A17] transition-colors pt-2 cursor-pointer"
                >
                  ← Modifier mes informations
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}