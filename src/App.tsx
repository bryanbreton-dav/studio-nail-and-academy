import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import FormationDetail from './pages/FormationDetail';
import Admin from './pages/Admin';
import Login from './pages/Login';
import DocumentationPage from './pages/Documentation';
import GuideFAFCEA from './pages/GuideFAFCEA';
import ContactSection from './pages/Contact';

function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Gestion des ancres pour qu'elles fonctionnent depuis n'importe quelle page
  const handleAnchorClick = (anchorId: string) => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    if (location.pathname !== '/') {
      navigate(`/${anchorId}`);
    } else {
      const element = document.querySelector(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-base sm:text-xl font-bold tracking-widest text-[#1C1A17] hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          STUDIONAIL <span className="text-[#C5A880]">AND ACADEMY</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-8 text-xs uppercase tracking-widest font-semibold text-[#1C1A17]">

          {/* BOUTON QUI SUIS-JE ? (Forcé sur 1 seule ligne avec whitespace-nowrap) */}
          <button
            onClick={() => handleAnchorClick('#me')}
            className="hover:text-[#C5A880] transition-colors cursor-pointer bg-transparent border-0 uppercase tracking-widest font-semibold whitespace-nowrap"
          >
            Qui&nbsp;suis-je?
          </button>

          <button
            onClick={() => handleAnchorClick('#formations')}
            className="hover:text-[#C5A880] transition-colors cursor-pointer bg-transparent border-0 uppercase tracking-widest font-semibold whitespace-nowrap"
          >
            Formations
          </button>

          {/* MENU DÉROULANT : FINANCEMENT & INFOS */}
          <div
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-[#C5A880] transition-colors py-2 uppercase tracking-widest font-semibold bg-transparent border-0 whitespace-nowrap">
              <span>Financement & Infos</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* CONTENU DROPDOWN */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-48 bg-white border border-neutral-100 shadow-xl rounded-xl py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <Link
                  to="/guide-fafcea"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-4 py-2.5 text-[11px] text-[#1C1A17] hover:bg-[#FAF9F6] hover:text-[#C5A880] transition-colors"
                >
                  Guide FAFCEA
                </Link>
                <Link
                  to="/documentation"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-4 py-2.5 text-[11px] text-[#1C1A17] hover:bg-[#FAF9F6] hover:text-[#C5A880] transition-colors"
                >
                  Documentation
                </Link>
              </div>
            )}
          </div>

          {/* LIEN CONTACT */}
          <Link
            to="/contact"
            className="hover:text-[#C5A880] transition-colors uppercase tracking-widest font-semibold whitespace-nowrap"
          >
            Contact
          </Link>

          {/* SÉPARATEUR */}
          <div className="h-4 w-[1px] bg-neutral-200"></div>

          {/* LIEN TÉLÉPHONE & RÉSEAUX RS */}
          <div className="flex items-center space-x-2 lg:space-x-3 normal-case font-normal text-sm">
            <a
              href="tel:0672188165"
              className="flex items-center gap-1.5 text-[#1C1A17] hover:text-[#C5A880] transition-colors font-medium text-xs tracking-wider whitespace-nowrap"
              title="Nous appeler"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#C5A880]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>0672188165</span>
            </a>

            <a
              href="https://www.instagram.com/studionail_academy"
              target="_blank"
              rel="noreferrer"
              className="text-[#1C1A17] hover:text-[#C5A880] transition-colors p-1"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>

            <a
              href="https://www.facebook.com/StudioNail44"
              target="_blank"
              rel="noreferrer"
              className="text-[#1C1A17] hover:text-[#C5A880] transition-colors p-1"
              aria-label="Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>

        {/* BOUTON HAMBURGER (Mobile) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-[#1C1A17] hover:text-[#C5A880] hover:bg-neutral-100 transition-all"
          aria-label="Ouvrir le menu"
        >
          {isMobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* MENU MOBILE DÉROULANT */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-neutral-100 px-6 pt-4 pb-8 space-y-3 animate-in slide-in-from-top-2 duration-300">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2.5 text-sm uppercase tracking-widest font-semibold text-[#1C1A17] border-b border-neutral-100 hover:text-[#C5A880]"
          >
            Accueil
          </Link>

          <button
            onClick={() => handleAnchorClick('#me')}
            className="w-full text-left py-2.5 text-sm uppercase tracking-widest font-semibold text-[#1C1A17] border-b border-neutral-100 hover:text-[#C5A880]"
          >
            Qui suis-je?
          </button>

          <button
            onClick={() => handleAnchorClick('#formations')}
            className="w-full text-left py-2.5 text-sm uppercase tracking-widest font-semibold text-[#1C1A17] border-b border-neutral-100 hover:text-[#C5A880]"
          >
            Formations
          </button>

          <Link
            to="/guide-fafcea"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2.5 text-sm uppercase tracking-widest font-semibold text-[#1C1A17] border-b border-neutral-100 hover:text-[#C5A880]"
          >
            Guide FAFCEA
          </Link>

          <Link
            to="/documentation"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2.5 text-sm uppercase tracking-widest font-semibold text-[#1C1A17] border-b border-neutral-100 hover:text-[#C5A880]"
          >
            Documentation
          </Link>

          <Link
            to="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2.5 text-sm uppercase tracking-widest font-semibold text-[#1C1A17] border-b border-neutral-100 hover:text-[#C5A880]"
          >
            Contact
          </Link>

          {/* RÉSEAUX & TEL SUR MOBILE */}
          <div className="pt-4 flex items-center justify-between">
            <a
              href="tel:0672188165"
              className="flex items-center gap-2 text-sm font-semibold text-[#1C1A17] hover:text-[#C5A880]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C5A880]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>0672188165</span>
            </a>

            <div className="flex space-x-3">
              <a
                href="https://www.instagram.com/studionail_academy"
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-neutral-200 rounded-full text-[#1C1A17] hover:text-[#C5A880]"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a
                href="https://www.facebook.com/StudioNail44"
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-neutral-200 rounded-full text-[#1C1A17] hover:text-[#C5A880]"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FAF9F6] text-[#1C1A17] font-sans flex flex-col selection:bg-[#E6DCD2]">

        {/* Navigation intégrée */}
        <Navigation />

        {/* Contenu des Pages */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/formation/:id" element={<FormationDetail />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/guide-fafcea" element={<GuideFAFCEA />} />
            <Route path="/contact" element={<ContactSection />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}