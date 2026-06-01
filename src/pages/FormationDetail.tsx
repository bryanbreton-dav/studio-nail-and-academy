import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// IMPORTS STRIPE
// 1. Importe le TYPE depuis @stripe/stripe-js
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';

// 2. Importe les COMPOSANTS depuis @stripe/react-stripe-js
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';// TODO: Remplacer par ta propre clé publique Stripe (Test ou Live)
// public key, on peut l'afficher c ok
const stripePromise = loadStripe('pk_test_51TWYLHACwq5EuLNNbv6lPGtm3YlUbuxdo6hzQc2bmfsJ1xz7SZYIQcXTU1kqT9a8mN1qDs9P0mxDhoKwU2QsMVgH00cslvgugn');

// ==========================================
// SUB-COMPOSANT : FORMULAIRE DE CARTE BANCAIRE
// ==========================================
function CheckoutForm({ onPaymentSuccess, acompteAmount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

// ==========================================
// COMPOSANT PRINCIPAL : DETAIL DE FORMATION
// ==========================================
export default function FormationDetail() {
  const { id } = useParams();
  const [formation, setFormation] = useState(null);
  const [allReservations, setAllReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  // Gestion Modale & Étapes (1: Coordonnées, 2: Stripe)
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Intégration Stripe Secret
  const [stripeClientSecret, setStripeClientSecret] = useState("");

  useEffect(() => {
    const fetchDocAndReservations = async () => {
      const docRef = doc(db, "formations", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setFormation({ id: snap.id, ...snap.data() });

        const q = query(collection(db, "reservations"), where("formationId", "==", snap.id));
        const resSnap = await getDocs(q);
        setAllReservations(resSnap.docs.map(d => d.data()));
      }
      setLoading(false);
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

  // APPEL BACKEND : ÉTAPE 1 VERS ÉTAPE 2
  // APPEL BACKEND : ÉTAPE 1 VERS ÉTAPE 2
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !prenom || !email || !phone || !adresse) return alert("Champs requis.");

    setSubmitting(true);
    try {
      // APPEL À TA FIREBASE CLOUD FUNCTION
      // Remplace l'URL ci-dessous par l'URL fournie par Firebase après ton déploiement
      const response = await fetch("https://us-central1-studio-nails-586ea.cloudfunctions.net/createPaymentIntent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          acompteAmount: formation.acompte, // Montant brut (ex: 150)
          email: email,
          formationTitle: formation.title,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error || "Erreur lors de la récupération du secret de paiement.");
      }

      // On stocke le vrai jeton reçu de Stripe et on passe à l'affichage de la carte
      setStripeClientSecret(data.clientSecret);
      setModalStep(2);

    } catch (error: any) {
      console.error(error);
      alert(`Impossible d'initialiser le module de paiement : ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  // CALLBACK : SUCCÈS TRANSACTION STRIPE ET ENREGISTREMENT FIREBASE
  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      await addDoc(collection(db, "reservations"), {
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
      });

      alert(`Paiement validé ! Merci ${prenom}, votre place est officiellement réservée.`);
      setShowModal(false);
      setNom(""); setPrenom(""); setEmail(""); setPhone(""); setAdresse("");

      // Rafraîchir les compteurs immédiatement
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
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-xs uppercase tracking-[0.2em] text-neutral-400 animate-pulse">
        Analyse du programme...
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-4">
        <p className="text-sm text-neutral-500 font-light italic">Ce cursus n'existe pas ou a été déplacé.</p>
        <Link to="/" className="text-[11px] uppercase tracking-wider text-[#C5A880] underline">Retourner au catalogue</Link>
      </div>
    );
  }

  const formatList = (text) => text ? text.split('\n').filter(line => line.trim() !== "") : [];

  // Configuration graphique unifiée de l'iframe Stripe Elements
  const stripeOptions: StripeElementsOptions = {
    clientSecret: stripeClientSecret,
    appearance: {
      theme: 'flat' as const, // Le "as const" est crucial pour que TS comprenne que c'est le thème 'flat' exact, pas n'importe quelle string
      variables: {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        colorPrimary: '#1C1A17',
        colorBackground: '#FAF9F6',
        colorText: '#1C1A17',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="bg-[#FAF9F6] text-[#1C1A17] font-sans min-h-screen selection:bg-[#E6DCD2] pb-32">

      {/* HEADER DE LA FORMATION */}
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <Link to="/" className="text-[10px] text-neutral-400 hover:text-[#C5A880] transition-colors uppercase tracking-[0.25em] inline-flex items-center gap-2 group mb-12">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Retour au catalogue
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200/60 pb-8 mb-12">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A880] block">Studio nail academy • Masterclass</span>
            <h1 className="text-3xl md:text-5xl font-extralight tracking-tight leading-tight">{formation.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2 h-fit">
            <span className="text-[9px] uppercase tracking-wider font-semibold border border-emerald-200 bg-emerald-50/50 text-emerald-700 px-3 py-1.5 rounded-full">Certifié Qualiopi</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold border border-[#C5A880]/20 bg-white text-[#1C1A17] px-3 py-1.5 rounded-full">Éligible FAFCEA</span>
          </div>
        </div>
      </div>

      {/* BLOCS CONTENUS GRILLE */}
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start">

        {/* PRESENTATION */}
        <div className="lg:col-span-7 space-y-16">
          <div className="overflow-hidden rounded-2xl shadow-md aspect-video bg-white">
            <img src={formation.imageUrl || "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80"} className="w-full h-full object-cover" alt={formation.title} />
          </div>

          <section className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880] border-b border-neutral-200 pb-3">Présentation du Cursus</h2>
            <p className="text-sm text-neutral-600 font-light leading-relaxed whitespace-pre-line">{formation.intro}</p>
            {formation.objectifs && (
              <div className="bg-white border-l-2 border-[#C5A880] p-5 rounded-r-xl shadow-2xs">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#C5A880] block mb-1">Objectif Clé</span>
                <p className="text-xs text-neutral-700 italic font-light leading-relaxed">“{formation.objectifs}”</p>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880] border-b border-neutral-200 pb-3">Curriculum Spécifique</h2>
            <div className="grid sm:grid-cols-1 gap-4">
              {formatList(formation.program).map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-3xs hover:border-neutral-200 transition-colors">
                  <span className="font-serif text-sm italic text-[#C5A880] bg-[#FAF9F6] w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">{i + 1}</span>
                  <p className="text-xs text-neutral-600 font-light pt-0.5 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* PANNEAU FIXE TARIFS ET DATES */}
        <div className="lg:col-span-5 sticky top-12">
          <div className="bg-white border border-neutral-200/60 rounded-2xl p-8 space-y-8 shadow-sm">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-5">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 block mb-0.5">Valeur du cursus</span>
                <span className="text-xl font-light tracking-tight text-[#1C1A17]">{formation.priceTotal} €</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-widest text-[#C5A880] font-bold block mb-0.5">Acompte requis</span>
                <span className="text-xl font-semibold tracking-tight text-[#C5A880]">{formation.acompte} €</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">Choisir votre session :</label>
              <div className="relative">
                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-3.5 border border-neutral-200 text-xs bg-[#FAF9F6] text-[#1C1A17] rounded-none focus:outline-none appearance-none focus:border-[#1C1A17] transition-colors font-light">
                  <option value="">-- Sélectionner une date --</option>
                  {formation.dates?.map((d, i) => <option key={i} value={d}>{d}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400 text-xs">▼</div>
              </div>
            </div>

            {selectedDate && (
              <div className="transition-all duration-300">
                {isFull ? (
                  <div className="text-center py-2 px-4 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-red-50 border border-red-100 text-red-600">⚠️ Session complète</div>
                ) : reste <= 2 ? (
                  <div className="text-center py-2 px-4 text-[10px] uppercase tracking-wider font-bold rounded-full bg-amber-50 border border-amber-200 text-amber-700 animate-[pulse_2.5s_infinite]">🔥 Plus que {reste} places !</div>
                ) : (
                  <div className="text-center py-2 px-4 text-[10px] uppercase tracking-wider rounded-full bg-neutral-50 border border-neutral-200/60 text-neutral-500 font-light">{reste} places disponibles</div>
                )}
              </div>
            )}

            <button
              onClick={handleOpenReservation}
              disabled={isFull || !selectedDate}
              className={`w-full py-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-500 rounded-none shadow-xs cursor-pointer text-white ${isFull || !selectedDate ? 'bg-neutral-200 text-neutral-400 border-neutral-200 cursor-not-allowed shadow-none' : 'bg-[#1C1A17] hover:bg-[#C5A880]'}`}
            >
              {isFull ? "Complet" : !selectedDate ? "Sélectionner une date" : "Réserver ma place en ligne"}
            </button>
          </div>
        </div>
      </div>

      {/* POP-IN DOUBLE ÉTAPE (PROFIL -> STRIPE) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FAF9F6] p-8 max-w-lg w-full rounded-3xl shadow-2xl space-y-6 border border-neutral-200/40 relative">

            <button onClick={() => setShowModal(false)} className="absolute top-5 right-6 text-neutral-400 hover:text-black font-light text-2xl cursor-pointer">×</button>

            {/* ÉTAPE 1 : RENSEIGNEMENTS ET COORDONNÉES */}
            {modalStep === 1 && (
              <>
                <div className="space-y-1.5 border-b border-neutral-200 pb-4">
                  <h3 className="text-base font-light uppercase tracking-widest text-[#1C1A17]">1. Informations Stagiaire</h3>
                  <p className="text-[10px] font-light text-neutral-400">Date retenue : <span className="font-semibold text-[#C5A880]">{selectedDate}</span></p>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Prénom</label>
                      <input required type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="w-full p-3 bg-white border border-neutral-200 focus:outline-none text-xs rounded-lg font-light" placeholder="ex: Julie" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Nom</label>
                      <input required type="text" value={nom} onChange={(e) => setNom(e.target.value)} className="w-full p-3 bg-white border border-neutral-200 focus:outline-none text-xs rounded-lg font-light" placeholder="ex: Dupont" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Adresse Électronique</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-white border border-neutral-200 focus:outline-none text-xs rounded-lg font-light" placeholder="contact@exemple.com" />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Téléphone</label>
                    <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 bg-white border border-neutral-200 focus:outline-none text-xs rounded-lg font-light" placeholder="06 00 00 00 00" />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">Adresse Postale Complète</label>
                    <textarea required rows={2} value={adresse} onChange={(e) => setAdresse(e.target.value)} className="w-full p-3 bg-white border border-neutral-200 focus:outline-none text-xs rounded-lg resize-none font-light" placeholder="Numéro, rue, code postal et ville"></textarea>
                  </div>

                  <div className="pt-4">
                    <button type="submit" disabled={submitting} className="w-full bg-[#1C1A17] hover:bg-[#C5A880] text-white font-bold uppercase tracking-[0.2em] py-4 text-[10px] transition-all duration-500 rounded-none shadow-md cursor-pointer">
                      {submitting ? "Traitement du profil..." : "Continuer vers le paiement sécurisé →"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ÉTAPE 2 : PAIEMENT STRIPE INTEGRÉ (SANS REDIRECTION) */}
            {modalStep === 2 && stripeClientSecret && (
              <>
                <div className="space-y-1.5 border-b border-neutral-200 pb-4">
                  <h3 className="text-base font-light uppercase tracking-widest text-[#1C1A17]">2. Sécurisation de l'acompte</h3>
                  <p className="text-[10px] font-light text-neutral-400">Candidat : <span className="font-semibold text-neutral-700">{prenom} {nom}</span></p>
                </div>

                {/* 2. On s'assure en plus que la simulation ou le vrai token ne soit pas une chaîne vide */}
                {stripeClientSecret !== "" && (
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <CheckoutForm
                      acompteAmount={formation.acompte}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                )}

                <button
                  onClick={() => setModalStep(1)}
                  className="text-center w-full block text-[10px] uppercase tracking-wider text-neutral-400 hover:text-black transition-colors pt-2"
                >
                  ← Revenir aux détails stagiaire
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}