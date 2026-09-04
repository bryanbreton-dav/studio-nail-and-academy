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

// HELPER INTERNE POUR L'API BREVO
const callBrevoAPI = async (payload: any, apiKey: string) => {
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

// CONSTANTES E-MAILS
const PERSO_EMAIL_SENDER = "contact@la-maison-du-port.fr";
const ADMIN_EMAIL_RECEIVER = "pro.bryanbreton@gmail.com";
const EXPEDITEUR_DEFAUT = {
  name: "StudioNail & Academy",
  email: PERSO_EMAIL_SENDER
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


// --- FONCTION 2 : ENVOI DES MAILS DE RÉSERVATION ---
export const sendReservationEmails = functions.https.onRequest(
  { secrets: ["BREVO_API_KEY"] },
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

      if (!clientEmail || !clientPrenom || !formationTitle || !dateSession) {
        res.status(400).send({ error: "Données requises manquantes." });
        return;
      }

      const apiKey = "";
      if (!apiKey) {
        res.status(500).send({ error: "Clé API Brevo manquante dans l'environnement serveur." });
        return;
      }

      // 1. Mail destiné au Client
      const emailClient = {
        sender: EXPEDITEUR_DEFAUT,
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

      // 2. Mail destiné à l’Hôte (Admin)
      const emailAdmin = {
        sender: EXPEDITEUR_DEFAUT,
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

      await Promise.all([
        callBrevoAPI(emailClient, apiKey),
        callBrevoAPI(emailAdmin, apiKey)
      ]);

      res.status(200).send({ success: true, message: "E-mails de réservation envoyés avec succès." });
    } catch (error: any) {
      console.error("Erreur d'envoi Brevo (Réservation):", error);
      res.status(500).send({ error: error.message });
    }
  }
);


// --- FONCTION 3 : ENVOI DES MAILS DU FORMULAIRE DE CONTACT ---
export const sendContactEmail = functions.https.onRequest(
  { secrets: ["BREVO_API_KEY"] },
  async (req: Request, res: Response): Promise<void> => {

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      const { name, email, phone, message } = req.body;

      if (!name || !email || !message) {
        res.status(400).send({ error: "Le nom, l'e-mail et le message sont requis." });
        return;
      }

      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) {
        res.status(500).send({ error: "Clé API Brevo manquante dans l'environnement serveur." });
        return;
      }

      const formattedMessage = message.replace(/\n/g, "<br/>");

      // 1. Mail de notification pour l'Admin avec replyTo direct vers le client
      const emailAdmin = {
        sender: EXPEDITEUR_DEFAUT,
        to: [{ email: ADMIN_EMAIL_RECEIVER, name: "Administrateur StudioNail" }],
        replyTo: { email: email, name: name },
        subject: `📩 Nouveau message de contact : ${name}`,
        htmlContent: `
          <html>
            <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
              <h2 style="color: #C5A880;">Nouveau message depuis le formulaire de contact</h2>
              <p><strong>Nom :</strong> ${name}</p>
              <p><strong>E-mail :</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Téléphone :</strong> ${phone || "Non renseigné"}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
              <p><strong>Message :</strong></p>
              <blockquote style="background: #faf9f6; padding: 15px; border-left: 4px solid #C5A880; margin: 0;">
                ${formattedMessage}
              </blockquote>
              <br/>
              <p style="font-size: 12px; color: #777;">Astuce : Cliquez simplement sur "Répondre" dans votre boîte mail pour écrire directement à ${name}.</p>
            </body>
          </html>
        `
      };

      // 2. Accusé de réception automatique au client
      const emailClient = {
        sender: EXPEDITEUR_DEFAUT,
        to: [{ email: email, name: name }],
        subject: "Bien reçu ! Votre message à StudioNail & Academy",
        htmlContent: `
          <html>
            <body style="font-family: sans-serif; color: #333; line-height: 1.6;">
              <h2>Bonjour ${name},</h2>
              <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
              <p>Notre équipe traite votre demande et vous recontactera dans les plus brefs délais.</p>
              <br/>
              <p>Bien cordialement,</p>
              <p><strong>L'équipe StudioNail & Academy</strong></p>
            </body>
          </html>
        `
      };

      await Promise.all([
        callBrevoAPI(emailAdmin, apiKey),
        callBrevoAPI(emailClient, apiKey)
      ]);

      res.status(200).send({ success: true, message: "Message de contact envoyé avec succès." });
    } catch (error: any) {
      console.error("Erreur d'envoi Brevo (Contact):", error);
      res.status(500).send({ error: error.message });
    }
  }
);