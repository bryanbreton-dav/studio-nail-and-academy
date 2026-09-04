import { Link } from 'react-router-dom';

export default function GuideFAFCEA() {
  const steps = [
    {
      number: '01',
      title: 'Vérifier votre éligibilité',
      details: [
        'Avoir le statut de micro-entrepreneur ou dirigeant d’entreprise artisanale.',
        'Être inscrit au Registre National des Entreprises (RNE) sous un code NAF artisanal.',
        'Être à jour dans le versement de vos cotisations URSSAF (Contribution à la Formation Professionnelle).'
      ]
    },
    {
      number: '02',
      title: 'Créer votre compte FAFCEA',
      details: [
        'Rendez-vous sur le portail officiel fafcea.fr.',
        'Créez votre espace personnel pour activer la gestion de vos demandes de prise en charge.'
      ]
    },
    {
      number: '03',
      title: 'Déposer la demande de prise en charge',
      details: [
        'Déposez votre dossier complet au moins 3 mois avant le début de la formation (ou minimum 15 jours avant selon la période).',
        'Joignez les justificatifs fournis par l’académie : devis, programme détaillé et attestation URSSAF.'
      ]
    },
    {
      number: '04',
      title: 'Règlement et remboursement',
      details: [
        'Réglez les frais de formation auprès du centre.',
        'Conservez soigneusement votre facture et l’émargement / attestation de fin de formation.',
        'Transmettez les justificatifs pour déclencher le virement de remboursement par le FAFCEA.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1A17] font-sans selection:bg-[#E6DCD2]">
      {/* HEADER SECTION */}
      <section className="bg-[#1C1A17] text-white py-16 md:py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A880] block">
            Financement & Prise en charge
          </span>
          <h1 className="text-3xl sm:text-5xl font-extralight tracking-tight leading-tight">
            Guide Financement FAFCEA
          </h1>
          <p className="text-neutral-300 text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed pt-2">
            Formez-vous en toute sérénité. Nos formations en prothésie ongulaire sont éligibles au financement FAFCEA, l’organisme dédié aux chefs d’entreprise exerçant une activité artisanale.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* LES AVANTAGES ET PLAFONDS */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-100 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A880]">
              Avantages financiers
            </span>
            <h2 className="text-2xl md:text-3xl font-extralight tracking-tight text-[#1C1A17]">
              Jusqu'à <span className="font-serif italic text-[#C5A880]">3 500 €</span> d'enveloppe annuelle
            </h2>
            <p className="text-neutral-600 text-sm font-light leading-relaxed">
              Le FAFCEA prend en charge les formations des artisans pour leur permettre de monter en compétences et de maîtriser les nouvelles techniques du secteur.
            </p>
          </div>

          <div className="space-y-4 bg-[#FAF9F6] p-6 rounded-2xl border border-neutral-100">
            <div className="flex items-start gap-4 border-b border-neutral-200/60 pb-4">
              <span className="text-2xl">⏳</span>
              <div>
                <h3 className="font-semibold text-sm text-[#1C1A17]">100 Heures / an</h3>
                <p className="text-xs text-neutral-500 font-light">Plafond financé jusqu'à 35 € / heure (soit 3 500 € par an).</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-2xl">🚗</span>
              <div>
                <h3 className="font-semibold text-sm text-[#1C1A17]">Frais annexes</h3>
                <p className="text-xs text-neutral-500 font-light">Prise en charge complémentaire possible jusqu'à 200 € par formation (déplacement, hébergement).</p>
              </div>
            </div>
          </div>
        </section>

        {/* ÉTAPES PAS À PAS */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A880]">
              Procédure
            </span>
            <h2 className="text-2xl md:text-4xl font-extralight tracking-tight text-[#1C1A17]">
              Comment en profiter ?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#C5A880] tracking-widest block">
                    ÉTAPE #{step.number}
                  </span>
                  <h3 className="text-xl font-light text-[#1C1A17]">
                    {step.title}
                  </h3>
                  <ul className="space-y-2 pt-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="text-xs text-neutral-600 font-light flex items-start gap-2 leading-relaxed">
                        <span className="text-[#C5A880] mt-0.5">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="bg-[#1C1A17] text-white rounded-3xl p-8 md:p-12 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-extralight tracking-tight">
            Besoin d'un devis et du programme pour votre dossier ?
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 font-light max-w-xl mx-auto leading-relaxed">
            Contactez-nous pour établir les documents administratifs nécessaires à votre demande FAFCEA.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              to="/#formations"
              className="bg-[#C5A880] hover:bg-[#b0936d] text-white text-[11px] uppercase tracking-[0.2em] font-semibold px-8 py-4 rounded-xl transition-all"
            >
              Voir le catalogue
            </Link>
            <a
              href="tel:0672188165"
              className="bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] uppercase tracking-[0.2em] font-semibold px-8 py-4 rounded-xl transition-all border border-neutral-700"
            >
              Nous appeler
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}