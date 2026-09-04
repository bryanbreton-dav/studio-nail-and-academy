import { useState } from 'react';

export default function DocumentationPage() {
  // État pour gérer l'ouverture/fermeture des questions de la FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "Les formations nous donnent elles, le droit à un diplôme ?",
      answer: "Bien sûr, à la fin de chaque formation, je vous délivre un certificat de formation."
    },
    {
      question: "Pour les formations finies y a-t-il un suivi ?",
      answer: "Oui, je vous suis et vous pouvez toujours me contacter pour me poser vos questions et m’envoyer vos photos via une plateforme en ligne."
    },
    {
      question: "Peut-on se faire financer ?",
      answer: "Oui et non. La demande de financement via le FAFCEA est possible pour les indépendants. Renseignements sur fafcea.com. Par contre, je ne prends aucun financement, ni CPF ou autre organisme."
    }
  ];

  return (
    <div className="min-h-screen bg-[#1C1A17] text-white py-16 px-6 sm:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* EN-TÊTE DE LA PAGE */}
        <div className="text-center space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A880] block">
            Informations & Ressources
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-tight text-white">
            Documentation & Accessibilité
          </h1>
          <p className="text-neutral-400 text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed">
            Retrouvez tous les documents administratifs, nos engagements en matière d'accessibilité et les réponses à vos questions fréquentes.
          </p>
        </div>

        {/* SECTION 1 : ACCÈS PMR & RÈGLEMENT INTÉRIEUR */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* CARTE ACCÈS PMR */}
          <div className="bg-neutral-900/60 border border-neutral-800 p-8 rounded-3xl space-y-4 flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-2xl text-[#C5A880]">
                ♿
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">Inclusivité</span>
                <h2 className="text-xl font-light text-white">Accessibilité PMR</h2>
              </div>
              <p className="text-neutral-300 text-sm font-light leading-relaxed">
                Nos locaux et nos sessions de formation sont entièrement accessibles à tous. Nous veillons à ce que chaque apprenant, quelle que soit sa situation ou son handicap, bénéficie d'un accueil adapté et des meilleures conditions d'apprentissage.
              </p>
            </div>
            <div className="pt-2 text-xs text-neutral-400 font-light flex items-center gap-2">
              Établissement conforme aux normes d'accessibilité.
            </div>
          </div>

          {/* CARTE RÈGLEMENT INTÉRIEUR */}
          <div className="bg-neutral-900/60 border border-neutral-800 p-8 rounded-3xl space-y-4 flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-2xl text-[#C5A880]">
                📄
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">Documents Officiels</span>
                <h2 className="text-xl font-light text-white">Règlement Intérieur</h2>
              </div>
              <p className="text-neutral-300 text-sm font-light leading-relaxed">
                Consultez et téléchargez notre règlement intérieur régissant le fonctionnement de notre centre de formation, les règles d'hygiène, de sécurité et la vie au sein de l'établissement.
              </p>
            </div>
            
            <div className="pt-4">
              {/* Remplacez '/reglement-interieur.pdf' par le chemin exact vers votre fichier PDF */}
              <a 
                href="/reglement-interieur-2026.pdf" 
                download
                className="inline-flex items-center justify-center gap-3 w-full bg-[#C5A880] hover:bg-[#b5976f] text-[#1C1A17] font-medium text-sm py-3 px-6 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Télécharger le Règlement Intérieur (PDF)
              </a>
            </div>
          </div>

        </div>

        {/* SECTION 2 : FOIRE AUX QUESTIONS (FAQ) */}
        <div className="space-y-8 pt-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A880] block">
              Des questions ?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extralight text-white">Foire Aux Questions</h2>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {faqData.map((item, index) => (
              <div 
                key={index}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 hover:bg-neutral-800/40 transition-colors focus:outline-none"
                >
                  <span className="text-base font-medium text-neutral-200">
                    {item.question}
                  </span>
                  <span className={`text-[#C5A880] text-xl transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                    ↓
                  </span>
                </button>

                {openFaq === index && (
                  <div className="px-6 pb-6 text-sm text-neutral-400 font-light leading-relaxed border-t border-neutral-800/50 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}