import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import FormationDetail from './pages/FormationDetail';
import Admin from './pages/Admin'; // <-- Ajoutez cet import
import Login from './pages/Login';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-institut-pink text-institut-dark font-sans flex flex-col">
        
        {/* Barre de Navigation (Navbar) */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold tracking-widest text-institut-dark hover:opacity-80">
              STUDIO <span className="text-institut-gold">NAIL</span>
            </Link>
            <div className="space-x-8 font-medium">
              <Link to="/" className="hover:text-institut-gold transition">Accueil</Link>
              <a href="#me" className="hover:text-institut-gold transition">Qui suis-je?</a>
              <a href="#formations" className="hover:text-institut-gold transition">Formations</a>
            </div>
          </div>
        </nav>

        {/* Contenu des Pages */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/formation/:id" element={<FormationDetail />} />
            <Route path="/admin" element={<Admin />} /> {/* <-- Nouvelle Route */}
            <Route path="/login" element={<Login />}/>
          </Routes>
        </main>
      </div>
    </Router>
  );
}