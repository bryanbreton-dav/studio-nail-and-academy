import * as functions from "firebase-functions";
import { Request, Response } from "express";
import Stripe from "stripe";

// --- CONFIGURATION STRIPE ---
const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("La clé secrète STRIPE_SECRET_KEY est manquante dans l'environnement.");
  }
  return new Stripe(secretKey, {
    apiVersion: "2023-10-16" as any,
  });
};

// --- FONCTION 1 : INTENT DE PAIEMENT STRIPE ---
export const createPaymentIntent = functions.https.onRequest(
  { secrets: ["STRIPE_SECRET_KEY"] },
  async (req: Request, res: Response): Promise<void> => {
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

// --- FONCTION 2 : ENVOI DES MAILS VIA BREVO (API DIRECTE) ---
export const sendReservationEmails = functions.https.onRequest(
  { secrets: ["BREVO_API_KEY"] }, // <-- Firebase injecte la clé ici de manière sécurisée
  async (req: Request, res: Response): Promise<void> => {
    
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      const { 
        clientEmail, 
        clientPrenom, 
        clientNom, 
        formationTitle, 
        dateSession, 
        acompteAmount 
      } = req.body;

      // Validation des données reçues
      if (!clientEmail || !clientPrenom || !formationTitle || !dateSession) {
        res.status(400).send({ error: "Données requises manquantes." });
        return;
      }

      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) {
        res.status(500).send({ error: "Clé API Brevo manquante dans l'environnement serveur." });
        return;
      }

      // Configuration de tes adresses de test
      const PERSO_EMAIL_SENDER = "pro.bryanbreton@gmail.com"; 
      const ADMIN_EMAIL_RECEIVER = "rozennathalie@yahoo.fr";

      const expediteur = { 
        name: "Institut de Formation", 
        email: PERSO_EMAIL_SENDER 
      };

      // Fonction interne pour appeler l'API HTTP de Brevo
      const callBrevoAPI = async (payload: any) => {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": apiKey,
            "content-type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Erreur API Brevo: ${JSON.stringify(errorData)}`);
        }
      };

      // 1. Structure du mail destiné au Client
      const emailClient = {
        sender: expediteur,
        to: [{ email: clientEmail, name: `${clientPrenom} ${clientNom}` }],
        subject: `Confirmation de votre réservation : ${formationTitle}`,
        htmlContent: `
          <html>
            <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
              <h2>Bonjour ${clientPrenom},</h2>
              <p>Nous vous confirmons la bonne réception de votre acompte de <strong>${acompteAmount} €</strong>.</p>
              <p>Votre place est désormais réservée pour la formation suivante :</p>
              <ul>
                <li><strong>Formation :</strong> ${formationTitle}</li>
                <li><strong>Session :</strong> ${dateSession}</li>
              </ul>
              <p>À très bientôt !</p>
            </body>
          </html>
        `
      };

      // 2. Structure du mail destiné à l’Hôte (Toi)
      const emailAdmin = {
        sender: expediteur,
        to: [{ email: ADMIN_EMAIL_RECEIVER, name: "Administrateur" }],
        subject: `🚨 Nouvelle inscription ! - ${formationTitle}`,
        htmlContent: `
          <html>
            <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
              <h2>Une nouvelle inscription vient d'avoir lieu !</h2>
              <p><strong>Élève :</strong> ${clientPrenom} ${clientNom} (${clientEmail})</p>
              <p><strong>Formation choisie :</strong> ${formationTitle}</p>
              <p><strong>Session :</strong> ${dateSession}</p>
              <p><strong>Acompte réglé :</strong> ${acompteAmount} €</p>
              <br/>
              <p>👉 Rendez-vous sur votre tableau de bord administratif pour consulter la liste d'émargement.</p>
            </body>
          </html>
        `
      };

      // Envoi des deux e-mails en parallèle
      await Promise.all([
        callBrevoAPI(emailClient),
        callBrevoAPI(emailAdmin)
      ]);

      res.status(200).send({ success: true, message: "E-mails envoyés avec succès." });
    } catch (error: any) {
      console.error("Erreur d'envoi Brevo:", error);
      res.status(500).send({ error: error.message });
    }
  }
);