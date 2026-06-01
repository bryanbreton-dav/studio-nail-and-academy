import * as functions from "firebase-functions";
import { Request, Response } from "express";
import Stripe from "stripe";

// On initialise Stripe à l'intérieur ou à l'extérieur, 
// mais on ne l'instancie avec la clé que si process.env est disponible
const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("La clé secrète STRIPE_SECRET_KEY est manquante dans l'environnement.");
  }
  return new Stripe(secretKey, {
    apiVersion: "2023-10-16" as any,
  });
};

export const createPaymentIntent = functions.https.onRequest(
  { secrets: ["STRIPE_SECRET_KEY"] }, // <-- CRUCIAL : Indique à Firebase d'injecter le secret ici
  async (req: Request, res: Response): Promise<void> => {
    
    // Configurer les headers CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      const { acompteAmount, email, formationTitle } = req.body;

      if (!acompteAmount) {
        res.status(400).send({ error: "Le montant de l'acompte est requis." });
        return;
      }

      const amountInCents = Math.round(parseFloat(acompteAmount) * 100);

      // On récupère l'instance Stripe configurée avec le secret masqué
      const stripe = getStripeInstance();

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "eur",
        automatic_payment_methods: { enabled: true },
        receipt_email: email,
        metadata: {
          formation: formationTitle,
        },
      });

      res.status(200).send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Erreur Stripe:", error);
      res.status(500).send({ error: error.message });
    }
  }
);