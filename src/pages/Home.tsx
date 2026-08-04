import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import nathalieImage from '../assets/nathalie_rozen.jpg';

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
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFormations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "formations"));
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Formation[];
        
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
    // CORRECTION 1 : Retrait de "pt-[76px] md:pt-[88px]" pour coller parfaitement sous la navbar sticky
    <div className="bg-[#FAF9F6] text-[#1C1A17] font-sans selection:bg-[#E6DCD2] overflow-x-hidden">
      
      {/* ==========================================
          1. HERO SECTION
         ========================================== */}
      <section className="relative h-screen min-h-[650px] flex items-center justify-center px-4 overflow-hidden border-b border-neutral-100">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 animate-[subtle-zoom_20s_infinite_alternate]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=2000&q=90')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-white/10"></div>
        
        <div className="relative z-10 text-center space-y-6 max-w-5xl mx-auto text-white">
          <span className="inline-flex gap-2 bg-white/10 backdrop-blur-sm text-[#E6DCD2] text-[10px] font-semibold px-4 py-2 rounded-full uppercase tracking-[0.3em] mb-2 animate-fade-in">
            ✨ Studio Nail Academy
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight leading-[1.1] text-white">
            L'art du détail, <br />
            <span className="font-serif italic text-[#C5A880]">l'excellence</span> au bout des doigts.
          </h1>
          <p className="text-sm md:text-base font-light max-w-xl mx-auto opacity-80 leading-relaxed tracking-wide text-neutral-200">
            Centre de formation haute technicité dédié aux futur·e·s professionnel·le·s du stylisme ongulaire exigeant·e·s.
          </p>
          <div className="pt-8">
            <a 
              href="#formations" 
              className="inline-block bg-[#1C1A17] hover:bg-[#C5A880] text-white px-10 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-500 rounded-xl shadow-lg transform hover:-translate-y-0.5 active:scale-95"
            >
              Explorer le catalogue
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center space-y-2 opacity-60">
          <span className="text-[9px] uppercase tracking-widest text-neutral-600">Scroll</span>
          <div className="w-[1px] h-14 bg-gradient-to-b from-neutral-400 to-transparent animate-[pulse_2s_infinite]"></div>
        </div>
      </section>

      {/* ==========================================
          2. PRÉSENTATION
         ========================================== */}
      <section id="me" className="reveal max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 space-y-8 z-10">
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C5A880] block">
              👋 Faisons connaissance
            </span>
            <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-[#1C1A17] leading-tight">
              Mon parcours et ma vision <br />
              <span className="font-serif italic text-[#C5A880]">en quelques mots</span>
            </h2>
          </div>
          
          <div className="space-y-6 text-neutral-600 text-base md:text-lg font-light leading-relaxed text-justify">
            <p>
              Tout a commencé de l’autre côté. Et oui, j’ai moi aussi été cliente et ce jour fut pour moi une révélation ! J’ai démarré ma première formation en 2008. À cet instant, ce métier est devenu pour moi une vraie passion. J’ai monté mon premier institut et voulu me former auprès des meilleurs.
            </p>
            <p>
              J’ai intégré l’école de <strong>Crystal Nails France</strong> qui m’a permis d’être formée auprès de championnes mondiales venant de Hongrie. J’ai continué cette fabuleuse aventure en me formant encore et encore auprès des experts de la profession, afin d’affiner mon côté perfectionniste.
            </p>
            <p className="border-l-4 border-[#C5A880] pl-6 italic bg-white py-5 rounded-r-2xl shadow-sm text-neutral-700 font-normal">
              "Depuis 2021, j’ai compris que je souhaitais plus que tout transmettre ma passion en enseignant les meilleures et dernières techniques qui vous permettront d’être une excellente Prothésiste Ongulaire."
            </p>
            <p>
              Enseigner est devenu ma deuxième passion, et je mets tout mon cœur ainsi que ma rigueur à créer mes cours afin de vous faire évoluer au maximum. Mon bonheur ? Transmettre cette envie profonde de réussir dans ce magnifique métier.
            </p>
            <p className="font-semibold text-[#1C1A17] pt-2">
              Au plaisir de vous rencontrer prochainement lors d’une formation à mes côtés !
            </p>
          </div>
        </div>
        
        <div className="md:col-span-5 relative justify-self-center md:justify-self-end w-full max-w-md mt-12 md:mt-0 sticky top-24">
          <div className="absolute inset-0 bg-[#E6DCD2] rounded-3xl translate-x-4 translate-y-4 -z-10 transition-transform duration-700 group-hover:translate-x-6 hover:shadow-2xl"></div>
          <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[3/4] bg-white border-4 border-white">
            <img
              src={nathalieImage}
              alt="Nathalie Rozen - Formatrice"
              className="w-full h-full object-cover grayscale-30 hover:grayscale-0 transition-all duration-700 hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* ==========================================
          3. CATALOGUE
         ========================================== */}
      <section id="formations" className="reveal max-w-7xl mx-auto px-6 py-16 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 pb-12 mb-16">
          <div className="space-y-3">
            <span className="inline-flex gap-2 bg-[#C5A880]/10 text-[#C5A880] text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-2">
              💎 Cursus d'exception
            </span>
            <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-[#1C1A17]">Nos Programmes d'Élite</h2>
          </div>
          <p className="text-neutral-500 text-sm font-light max-w-sm leading-relaxed">
            Chaque cursus fait l'objet d'une certification stricte et ouvre droit aux financements d'État.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-24 text-xs uppercase tracking-widest text-neutral-400 animate-pulse">
            Sélection de nos pièces maîtresses...
          </div>
        ) : formations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200 shadow-sm">
            <div className="text-3xl mb-4">🪞</div>
            <p className="text-base text-neutral-500 italic font-light">Le catalogue se réinvente. Aucun programme publié pour le moment.</p>
            <Link to="/admin" className="text-[11px] uppercase tracking-wider font-bold text-[#C5A880] mt-5 inline-block hover:underline">
              Ouvrir le panneau d'administration →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
            {formations.map((formation) => {
              const premiereLigneProgramme = formation.program
                ? formation.program.split('\n')[0]
                : "Détails techniques complets disponibles dans le programme.";

              return (
                <div key={formation.id} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-neutral-100 flex flex-col transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="h-72 overflow-hidden relative">
                    <img
                      src={formation.imageUrl || "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80"}
                      alt={formation.title || "Formation"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                    <span className="absolute top-6 left-6 inline-flex gap-2 bg-[#1C1A17]/80 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-[0.15em]">
                      ⏳ {formation.duration}
                    </span>
                  </div>

                  <div className="p-8 md:p-10 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center gap-4 pt-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A880]">
                          SNA • Certification
                        </span>
                        <span className="text-lg md:text-xl font-bold tracking-tight text-[#1C1A17]">
                          {formation.priceTotal} €
                        </span>
                      </div>

                      <h3 className="text-xl md:text-2xl font-light text-[#1C1A17] leading-snug min-h-[60px] line-clamp-2 transition-colors duration-300">
                        {formation.title}
                      </h3>

                      <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 font-light pt-2">
                        {premiereLigneProgramme}
                      </p>

                      <div className="pt-5 border-t border-neutral-100 space-y-2.5">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 block">
                          Ouverture des sessions :
                        </span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {!formation.dates || formation.dates.length === 0 ? (
                            <span className="text-xs text-neutral-400 italic font-light">Sur liste d'attente</span>
                          ) : (
                            formation.dates.slice(0, 1).map((date, i) => (
                              <span key={i} className="inline-flex gap-2 items-center bg-[#FAF9F6] border border-neutral-100 text-[#1C1A17] text-[10px] px-3 py-1.5 rounded-full font-light shadow-2xs">
                                ✨ {date}
                              </span>
                            ))
                          )}
                          {formation.dates && formation.dates.length > 1 && (
                            <span className="text-[10px] text-neutral-400 self-center font-light pl-1">
                              +{formation.dates.length - 1} autre date{formation.dates.length > 2 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <Link
                        to={`/formation/${formation.id}`}
                        className="block text-center bg-[#1C1A17] hover:bg-[#C5A880] text-white text-[11px] uppercase font-semibold tracking-[0.2em] py-4 transition-all duration-500 rounded-xl shadow-md transform hover:-translate-y-0.5 active:scale-95"
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
          4. FOOTER (CORRECTION 2 : Marge et padding réduits)
         ========================================== */}
      <footer className="reveal bg-[#1C1A17] text-white mt-16 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-12 items-center">

            <div className="md:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A880] block">
                  Notre etablissement
                </span>
                <h3 className="text-2xl md:text-3xl font-extralight tracking-tight text-white leading-tight">Nous Contacter</h3>
              </div>

              <div className="space-y-4 text-neutral-300 text-sm font-light tracking-wide leading-relaxed">
                <p className="flex gap-4 border-b border-neutral-800 pb-3">
                  <span className="text-[#C5A880] text-base">📍</span> Studio nails, Centre commercial de la Gesvrine, 44240 LA CHAPELLE SUR ERDRE
                </p>
                <a href="tel:0672188165" className="flex gap-4 border-b border-neutral-800 pb-3 hover:text-white transition-colors">
                  <span className="text-[#C5A880] text-base">📞</span> 06 72 18 81 65
                </a>
                <a href="mailto:contact@studionailacademy.fr" className="flex gap-4 border-b border-neutral-800 pb-3 hover:text-white transition-colors">
                  <span className="text-[#C5A880] text-base">✉️</span> contact@studionailacademy.fr
                </a>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">Suivre nos coulisses :</p>
                <div className="flex gap-3">
                  <a href="https://www.instagram.com/studionail_academy" target="_blank" rel="noreferrer" className="flex items-center justify-center border border-neutral-800 text-neutral-400 hover:border-[#C5A880] hover:text-[#C5A880] w-10 h-10 rounded-full transition-all duration-300 hover:shadow-lg bg-transparent" aria-label="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="https://www.facebook.com/StudioNail44" target="_blank" rel="noreferrer" className="flex items-center justify-center border border-neutral-800 text-neutral-400 hover:border-[#C5A880] hover:text-[#C5A880] w-10 h-10 rounded-full transition-all duration-300 hover:shadow-lg bg-transparent" aria-label="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 w-full h-72 rounded-3xl overflow-hidden shadow-xl border border-neutral-800 bg-neutral-900 opacity-90 hover:opacity-100 transition-opacity duration-500">
              <iframe
                title="Google Maps Studio Nail"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2707.4593662504913!2d-1.5526216230825924!3d47.266274111415925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4805ef124e008067%3A0x80cf699ca932a98!2sStudionail%20and%20Academy!5e0!3m2!1sfr!2sfr!4v1780298396861!5m2!1sfr!2sfr"
                className="w-full h-full border-0 filter invert-[0.9] hue-rotate-180 contrast-105"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>
          
          <div className="text-center text-neutral-500 text-[10px] uppercase tracking-widest mt-10 pt-6 border-t border-neutral-900">
            © {new Date().getFullYear()} Studio Nail Academy. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}