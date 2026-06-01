import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import nathalieImage from '../assets/nathalie_rozen.jpg';

// Optionnel mais recommandé : On définit la forme d'une formation pour TypeScript
interface Formation {
  id: string;
  title?: string;
  program?: string;
  imageUrl?: string;
  duration?: string;
  priceTotal?: number | string;
  dates?: string[];
}

export default function Home() {
  // CORRECTION ICI : On dit à TypeScript que c'est un tableau de Formations (ou n'importe quel objet)
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFormations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "formations"));
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Formation[]; // On force le type ici pour l'aligner avec le state
        
        setFormations(docs);
      } catch (error) {
        console.error("Erreur lors du chargement des formations :", error);
      } finally {
        setLoading(false);
      }
    };
    loadFormations();
  }, []);

  return (
    <div className="bg-[#FAF9F6] text-[#1C1A17] font-sans selection:bg-[#E6DCD2] overflow-x-hidden">
      
      {/* ==========================================
          1. HERO SECTION (ÉDITORIALE & IMMERSIVE)
         ========================================== */}
      <section className="relative h-screen min-h-[650px] flex items-center justify-center px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 animate-[subtle-zoom_20s_infinite_alternate]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=2000&q=90')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#FAF9F6]"></div>
        
        <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto text-white">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#E6DCD2] block animate-fade-in">
            Studio Nail Academy and formations
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight leading-[1.1] text-white">
            L'art du détail, <br />
            <span className="font-serif italic text-[#E6DCD2]">l'excellence</span> au bout des doigts.
          </h1>
          <p className="text-sm md:text-base font-light max-w-xl mx-auto opacity-80 leading-relaxed tracking-wide text-neutral-200">
            Centre de formation haute technicité dédié aux futur·e·s professionnel·le·s du stylisme ongulaire exigeant·e·s.
          </p>
          <div className="pt-6">
            <a 
              href="#formations" 
              className="inline-block bg-white hover:bg-[#1C1A17] text-[#1C1A17] hover:text-white border border-white px-10 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-500 rounded-none shadow-xs"
            >
              Explorer le catalogue
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center space-y-2 opacity-50">
          <span className="text-[9px] uppercase tracking-widest text-neutral-600">Scroll</span>
          <div className="w-[1px] h-12 bg-neutral-400 animate-[pulse_2s_infinite]"></div>
        </div>
      </section>

      {/* ==========================================
          2. MANIFESTE & PRÉSENTATION ASYMÉTRIQUE
         ========================================== */}
      <section id='me' className="max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-7 space-y-8 z-10">
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block">
              Présentation
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-[#1C1A17] leading-tight">
              Mon parcours et ma vision <br />
              <span className="font-serif italic">en quelques mots</span>
            </h2>
          </div>
          
          <div className="space-y-6 text-neutral-600 text-sm font-light leading-relaxed text-justify">
            <p>
              Tout a commencé de l’autre côté. Et oui, j’ai moi aussi été cliente et ce jour fut pour moi une révélation ! J’ai démarré ma première formation en 2008. À cet instant, ce métier est devenu pour moi une vraie passion. J’ai monté mon premier institut et voulu me former auprès des meilleurs.
            </p>
            <p>
              J’ai intégré l’école de <strong>Crystal Nails France</strong> qui m’a permis d’être formée auprès de championnes mondiales venant de Hongrie. J’ai continué cette fabuleuse aventure en me formant encore et encore auprès des experts de la profession, afin d’affiner mon côté perfectionniste.
            </p>
            <p className="border-l-2 border-[#C5A880] pl-4 italic bg-white/40 py-3 text-neutral-700 font-normal">
              "Depuis 2021, j’ai compris que je souhaitais plus que tout transmettre ma passion en enseignant les meilleures et dernières techniques qui vous permettront d’être une excellente Prothésiste Ongulaire."
            </p>
            <p>
              Enseigner est devenu ma deuxième passion, et je mets tout mon cœur ainsi que ma rigueur à créer mes cours afin de vous faire évoluer au maximum. Mon bonheur ? Transmettre cette envie profonde de réussir dans ce magnifique métier.
            </p>
            <p className="font-medium text-[#1C1A17] pt-2">
              Au plaisir de vous rencontrer prochainement lors d’une formation à mes côtés !
            </p>
          </div>
        </div>
        
        <div className="md:col-span-5 relative justify-self-center md:justify-self-end w-full max-w-md mt-8 md:mt-12 sticky top-8">
          <div className="absolute inset-0 bg-[#E6DCD2] rounded-3xl translate-x-4 translate-y-4 -z-10 transition-transform duration-700 group-hover:translate-x-6"></div>
          <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[3/4] bg-white">
            <img
              src={nathalieImage}
              alt="Nathalie Rozen - Formatrice"
              className="w-full h-full object-cover grayscale-20 hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </section>

      {/* ==========================================
          3. CATALOGUE CURATORIEL DYNAMIQUE
         ========================================== */}
      <section id="formations" className="max-w-7xl mx-auto px-6 py-20 scroll-mt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200 pb-8 mb-16">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block">
              Cursus disponibles
            </span>
            <h2 className="text-3xl font-light text-[#1C1A17]">Nos Programmes d'Élite</h2>
          </div>
          <p className="text-neutral-400 text-xs mt-4 md:mt-0 font-light max-w-xs">
            Chaque cursus fait l'objet d'une certification stricte et ouvre droit aux financements d'État.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-24 text-xs uppercase tracking-widest text-neutral-400 animate-pulse">
            Sélection de nos pièces maîtresses...
          </div>
        ) : formations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-neutral-200">
            <p className="text-sm text-neutral-400 italic">Le catalogue se réinvente. Aucun programme publié pour le moment.</p>
            <Link to="/admin" className="text-[11px] uppercase tracking-wider font-bold text-[#C5A880] mt-4 inline-block hover:underline">
              Ouvrir le panneau d'administration →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {formations.map((formation) => {
              const premiereLigneProgramme = formation.program
                ? formation.program.split('\n')[0]
                : "Détails techniques complets disponibles dans le programme.";

              return (
                <div key={formation.id} className="group flex flex-col space-y-5 bg-transparent">
                  
                  <div className="h-80 bg-neutral-100 rounded-2xl overflow-hidden relative shadow-xs group-hover:shadow-xl transition-all duration-700">
                    <img
                      src={formation.imageUrl || "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80"}
                      alt={formation.title || "Formation"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                    />
                    <div className="absolute bottom-4 left-4 backdrop-blur-md bg-black/40 text-white text-[9px] uppercase tracking-[0.15em] font-medium px-3 py-1.5 rounded-full">
                      ⏳ {formation.duration}
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow space-y-3 px-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#C5A880]">
                        SNA • Certification
                      </span>
                      <span className="text-sm font-semibold tracking-tight text-[#1C1A17]">
                        {formation.priceTotal} €
                      </span>
                    </div>

                    <h3 className="text-lg font-light text-[#1C1A17] group-hover:text-[#C5A880] transition-colors duration-300 leading-snug min-h-[50px] line-clamp-2">
                      {formation.title}
                    </h3>

                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 font-light">
                      {premiereLigneProgramme}
                    </p>

                    <div className="pt-3 border-t border-neutral-200/60 space-y-2">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400 block">
                        Ouverture des sessions :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {!formation.dates || formation.dates.length === 0 ? (
                          <span className="text-[10px] text-neutral-400 italic font-light">Sur liste d'attente</span>
                        ) : (
                          formation.dates.slice(0, 1).map((date, i) => (
                            <span key={i} className="bg-white border border-neutral-200 text-[#1C1A17] text-[9px] px-2.5 py-1 rounded-full font-light shadow-2xs">
                              ✨ {date}
                            </span>
                          ))
                        )}
                        {formation.dates && formation.dates.length > 1 && (
                          <span className="text-[9px] text-neutral-400 self-center font-light pl-1">
                            +{formation.dates.length - 1} autre date{formation.dates.length > 2 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Link
                        to={`/formation/${formation.id}`}
                        className="block text-center border border-[#1C1A17] group-hover:bg-[#1C1A17] text-[#1C1A17] group-hover:text-white text-[10px] uppercase font-bold tracking-[0.2em] py-3.5 transition-all duration-500 rounded-none"
                      >
                        Consulter & Réserver
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==========================================
          4. FOOTER AVEC MAP DESIGN ET COORDONNÉES
         ========================================== */}
      <section className="bg-[#1C1A17] text-white mt-32 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-12 gap-16 items-center">

            <div className="md:col-span-5 space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A880] block">
                  Établissement Paris
                </span>
                <h3 className="text-3xl font-light tracking-wide text-white">Nous Contacter</h3>
              </div>

              <div className="space-y-4 text-neutral-400 text-xs font-light tracking-wide leading-relaxed">
                <p className="flex items-center gap-4 border-b border-neutral-800 pb-3">
                  <span className="text-[#C5A880] text-sm">📍</span> Studio nails, Centre commercial de la Gesvrine, 44240 LA CHAPELLE SUR ERDRE
                </p>
                <p className="flex items-center gap-4 border-b border-neutral-800 pb-3">
                  <span className="text-[#C5A880] text-sm">📞</span> 06 72 18 81 65
                </p>
                <p className="flex items-center gap-4 border-b border-neutral-800 pb-3">
                  <span className="text-[#C5A880] text-sm">✉️</span> contact@studionailacademy.fr
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-semibold">Suivre nos coulisses :</p>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/studionail_academy"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center border border-neutral-800 text-neutral-400 hover:border-[#C5A880] hover:text-[#C5A880] w-10 h-10 rounded-full transition-colors duration-300 bg-transparent"
                    aria-label="Instagram"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a
                    href="https://www.facebook.com/StudioNail44"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center border border-neutral-800 text-neutral-400 hover:border-[#C5A880] hover:text-[#C5A880] w-10 h-10 rounded-full transition-colors duration-300 bg-transparent"
                    aria-label="Facebook"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 w-full h-80 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-900 opacity-80 hover:opacity-100 transition-opacity duration-500">
              <iframe
                title="Google Maps Studio Nail"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2707.4593662504913!2d-1.5526216230825924!3d47.266274111415925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4805ef124e008067%3A0x80cf699ca932a98!2sStudionail%20and%20Academy!5e0!3m2!1sfr!2sfr!4v1780298396861!5m2!1sfr!2sfr"
                className="w-full h-full border-0 filter invert-[0.9] hue-rotate-180 contrast-105"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>
          
          <div className="text-center text-neutral-600 text-[10px] uppercase tracking-widest mt-16 pt-8 border-t border-neutral-900">
            © {new Date().getFullYear()} Studio Nail Academy. Droits réservés.
          </div>
        </div>
      </section>
    </div>
  );
}