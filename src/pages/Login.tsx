import React, { useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin'); // Redirection vers l'admin après connexion réussie
    } catch (err) {
      console.error(err);
      setError("Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 px-4 text-xs">
      <div className="bg-white border p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-light uppercase tracking-widest text-institut-dark">Connexion Admin</h1>
          <p className="text-gray-400 uppercase text-[9px]">Espace de gestion Studio Nail</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 border border-red-100 rounded-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-600 uppercase tracking-wider text-[10px]">Identifiant Email</label>
            <input 
              required
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-2.5 border bg-white focus:outline-none focus:ring-1 focus:ring-institut-gold" 
              placeholder="email@studionail.fr"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-600 uppercase tracking-wider text-[10px]">Mot de passe</label>
            <input 
              required
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-2.5 border bg-white focus:outline-none focus:ring-1 focus:ring-institut-gold" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-institut-dark hover:bg-institut-gold text-white font-bold uppercase py-3 tracking-widest transition disabled:bg-gray-400 cursor-pointer text-[10px]"
          >
            {loading ? "Vérification..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}