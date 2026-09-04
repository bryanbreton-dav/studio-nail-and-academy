import { useState } from 'react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Appel vers votre endpoint API (Serverless Function ou Serveur Node)
      const response = await fetch('https://us-central1-studio-nails-586ea.cloudfunctions.net/sendContactEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#FAF9F6] border-t border-neutral-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A880] block">
            Une question ? Un projet ?
          </span>
          <h2 className="text-3xl md:text-4xl font-extralight tracking-tight text-[#1C1A17]">
            Contactez-nous
          </h2>
          <p className="text-neutral-500 text-xs md:text-sm font-light max-w-lg mx-auto">
            Remplissez le formulaire ci-dessous pour toute demande de renseignement ou pour constituer votre dossier de financement.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-100 shadow-sm">
          {status === 'success' ? (
            <div className="text-center py-8 space-y-4">
              <span className="text-4xl">✨</span>
              <h3 className="text-xl font-light text-[#1C1A17]">Message envoyé avec succès !</h3>
              <p className="text-xs text-neutral-500 font-light">
                Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#C5A880] hover:underline"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[#1C1A17] mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-xl px-4 py-3 text-sm text-[#1C1A17] focus:outline-none focus:border-[#C5A880] transition-colors"
                    placeholder="Sophie Martin"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#1C1A17] mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-xl px-4 py-3 text-sm text-[#1C1A17] focus:outline-none focus:border-[#C5A880] transition-colors"
                    placeholder="sophie@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-[#1C1A17] mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-xl px-4 py-3 text-sm text-[#1C1A17] focus:outline-none focus:border-[#C5A880] transition-colors"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-[#1C1A17] mb-2">
                  Votre message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-xl px-4 py-3 text-sm text-[#1C1A17] focus:outline-none focus:border-[#C5A880] transition-colors resize-none"
                  placeholder="Précisez votre demande (formation souhaitée, financement FAFCEA, etc.)..."
                />
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-500 font-medium">
                  Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous appeler directement.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#1C1A17] hover:bg-neutral-800 text-white text-xs uppercase tracking-[0.2em] font-semibold py-4 rounded-xl transition-all disabled:opacity-50"
              >
                {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}