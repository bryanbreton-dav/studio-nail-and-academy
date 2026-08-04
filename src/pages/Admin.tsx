import { useState, useEffect, useRef } from 'react';
import { db, storage, auth } from '../../firebase';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// IMPORTS FULLCALENDAR
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// 1. DÉFINITION DES INTERFACES (TYPES)
interface SessionDetail {
  id: string;
  startDate: string;
  endDate: string;
  textLabel: string;
}

interface Formation {
  id: string;
  title: string;
  duration: string;
  priceTotal: string;
  acompte: number;
  maxPlaces: number;
  imageUrl?: string;
  intro?: string;
  objectifs?: string;
  program?: string;
  prerequis?: string;
  modalites?: string;
  evaluation?: string;
  financement?: string;
  lesPlus?: string;
  dates?: string[];
  sessionsDetails?: SessionDetail[];
}

interface Reservation {
  id: string;
  formationId: string;
  dateSession: string;
  clientPrenom: string;
  clientNom: string;
  clientEmail: string;
  clientPhone: string;
  clientAdresse: string;
  statutPaiement: string;
}

interface ActiveSessionInfo {
  formationId: string;
  formationTitle: string;
  dateLabel: string;
}

export default function Admin() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  // ÉTATS FORMULAIRE CATALOGUE
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [acompte, setAcompte] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [intro, setIntro] = useState<string>("");
  const [objectifs, setObjectifs] = useState<string>("");
  const [program, setProgram] = useState<string>(""); 
  const [prerequis, setPrerequis] = useState<string>("");
  const [modalites, setModalites] = useState<string>("");
  const [evaluation, setEvaluation] = useState<string>("");
  const [financement, setFinancement] = useState<string>("");
  const [lesPlus, setLesPlus] = useState<string>("");
  const [maxPlaces, setMaxPlaces] = useState<string>("");

  // ÉTATS AJOUT SESSIONS (CALENDRIER)
  const [selectedFormationId, setSelectedFormationId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // ÉTATS POUR L'AFFICHAGE DES ÉLÈVES DE LA SESSION SÉLECTIONNÉE
  const [activeSessionInfo, setActiveSessionInfo] = useState<ActiveSessionInfo | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/login');
      else fetchData();
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const snapFormations = await getDocs(collection(db, "formations"));
      setFormations(snapFormations.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Formation));
      
      const snapReservations = await getDocs(collection(db, "reservations"));
      setReservations(snapReservations.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Reservation));
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vous déconnecter ?")) {
      await signOut(auth);
      navigate('/login');
    }
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    if (!file) return "";
    setUploading(true);
    try {
      const storageRef = ref(storage, `formations_images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setUploading(false);
      return url;
    } catch (error) {
      console.error(error);
      setUploading(false);
      return "";
    }
  };

  const handleSaveFormation = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalImageUrl = imageUrl;
    if (imageFile) finalImageUrl = await handleUploadImage(imageFile);

    const data = {
      title, duration, priceTotal: price, acompte: Number(acompte),
      maxPlaces: Number(maxPlaces) || 10,
      imageUrl: finalImageUrl,
      intro, objectifs, program, prerequis, modalites, evaluation, financement, lesPlus
    };

    if (isEditing) {
      await updateDoc(doc(db, "formations", currentId), data);
    } else {
      await addDoc(collection(db, "formations"), { ...data, dates: [], sessionsDetails: [] });
    }
    resetForm(); fetchData();
    alert("Formation enregistrée avec succès !");
  };

  const handleEditClick = (f: Formation) => {
    setIsEditing(true); setCurrentId(f.id);
    setTitle(f.title); setDuration(f.duration); setPrice(f.priceTotal); setAcompte(String(f.acompte));
    setImageUrl(f.imageUrl || ""); setImageFile(null); setMaxPlaces(String(f.maxPlaces) || "");
    setIntro(f.intro || ""); setObjectifs(f.objectifs || ""); setProgram(f.program || "");
    setPrerequis(f.prerequis || ""); setModalites(f.modalites || "");
    setEvaluation(f.evaluation || ""); setFinancement(f.financement || ""); setLesPlus(f.lesPlus || "");
    // Défilement fluide vers le formulaire
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetForm = () => {
    setIsEditing(false); setTitle(""); setDuration(""); setPrice(""); setAcompte("");
    setImageUrl(""); setImageFile(null); setMaxPlaces("");
    setIntro(""); setObjectifs(""); setProgram(""); setPrerequis(""); setModalites("");
    setEvaluation(""); setFinancement(""); setLesPlus("");
  };

  const formatDatesRange = (start: string, end: string) => {
    if (!start) return "";
    const options = { day: 'numeric', month: 'long', year: 'numeric' } as const;
    const dateDebut = new Date(start).toLocaleDateString('fr-FR', options);
    if (end && end !== start) {
      const dateFin = new Date(end).toLocaleDateString('fr-FR', options);
      return `Du ${dateDebut} au ${dateFin}`;
    }
    return `Le ${dateDebut}`;
  };

  const handleAddDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormationId || !startDate) return alert("Champs obligatoires manquants.");
    
    const targetFormation = formations.find(form => form.id === selectedFormationId);
    if (!targetFormation) return alert("Formation introuvable.");

    const dateFormatee = formatDatesRange(startDate, endDate);
    
    const newSessionObj: SessionDetail = {
      id: `${selectedFormationId}_${Date.now()}`,
      startDate: startDate,
      endDate: endDate || startDate,
      textLabel: dateFormatee
    };

    const updatedDatesText = [...(targetFormation.dates || []), dateFormatee];
    const updatedSessionsDetails = [...(targetFormation.sessionsDetails || []), newSessionObj];

    await updateDoc(doc(db, "formations", selectedFormationId), { 
      dates: updatedDatesText,
      sessionsDetails: updatedSessionsDetails
    });

    setStartDate(""); setEndDate(""); setSelectedFormationId(""); fetchData();
    alert("Session ajoutée au calendrier visuel !");
  };

  const getCalendarEvents = () => {
    const events: any[] = [];
    formations.forEach(f => {
      if (f.sessionsDetails) {
        f.sessionsDetails.forEach(session => {
          const visualEndDate = new Date(session.endDate);
          visualEndDate.setDate(visualEndDate.getDate() + 1);

          events.push({
            id: session.id,
            title: f.title,
            start: session.startDate,
            end: visualEndDate.toISOString().split('T')[0],
            extendedProps: {
              formationId: f.id,
              textLabel: session.textLabel
            },
            backgroundColor: '#1C1A17',
            borderColor: '#C5A880',
            textColor: '#FFFFFF'
          });
        });
      }
    });
    return events;
  };

  const handleEventClick = (info: any) => {
    const { formationId, textLabel } = info.event.extendedProps;
    setActiveSessionInfo({
      formationId,
      formationTitle: info.event.title,
      dateLabel: textLabel
    });
  };

  const elevesInscrits = activeSessionInfo 
    ? reservations.filter(r => r.formationId === activeSessionInfo.formationId && r.dateSession === activeSessionInfo.dateLabel)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-xs uppercase tracking-[0.25em] text-neutral-400 animate-pulse">
        Chargement de l'espace d'administration...
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] text-[#1C1A17] font-sans min-h-screen selection:bg-[#E6DCD2] pt-28 pb-32">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* HEADER ADMIN */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-neutral-200/80 pb-8">
          <div className="space-y-2">
            <span className="inline-flex gap-2 bg-[#C5A880]/10 text-[#C5A880] text-[10px] font-semibold px-3.5 py-1.5 rounded-full uppercase tracking-[0.2em]">
              👑 Administration System
            </span>
            <h1 className="text-3xl sm:text-4xl font-extralight tracking-tight text-[#1C1A17]">
              Tableau de Bord
            </h1>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="w-fit bg-red-50 hover:bg-red-500 hover:text-white border border-red-200 text-red-600 px-5 py-2.5 rounded-xl font-semibold uppercase tracking-[0.15em] text-[10px] transition-all duration-300 shadow-2xs active:scale-95 cursor-pointer"
          >
            Déconnexion ✕
          </button>
        </div>

        {/* SECTION CALENDRIER & ÉMARGEMENT */}
        <section className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* CALENDRIER */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
              <span className="text-base">🗓</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880]">Planning Général des Sessions</h2>
            </div>
            
            <div className="admin-calendar-custom text-xs">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale="fr"
                firstDay={1}
                buttonText={{ today: "Aujourd'hui" }}
                events={getCalendarEvents()}
                eventClick={handleEventClick}
                height="auto"
              />
            </div>
            
            <p className="text-[10px] text-neutral-400 italic text-center">
              👉 Cliquez sur une session du calendrier pour charger la liste des élèves enregistrés.
            </p>
          </div>

          {/* LISTE D'ÉMARGEMENT */}
          <div className="lg:col-span-4 bg-[#1C1A17] text-white p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 sticky top-28 border border-neutral-800">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <span className="text-base">👥</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880]">Liste d'Émargement</h2>
            </div>
            
            {activeSessionInfo ? (
              <div className="space-y-4">
                <div className="bg-neutral-800/80 p-4 rounded-2xl border-l-4 border-[#C5A880]">
                  <p className="font-semibold text-sm text-white">{activeSessionInfo.formationTitle}</p>
                  <p className="text-[10px] text-[#C5A880] mt-1 tracking-wider uppercase font-medium">{activeSessionInfo.dateLabel}</p>
                </div>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {elevesInscrits.length === 0 ? (
                    <div className="bg-neutral-800/40 p-6 rounded-2xl text-center border border-neutral-800">
                      <p className="text-neutral-400 italic text-xs">Aucune inscription pour le moment.</p>
                    </div>
                  ) : (
                    elevesInscrits.map(e => (
                      <div key={e.id} className="bg-white text-[#1C1A17] p-4 rounded-2xl space-y-2 shadow-md">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-xs">{e.clientPrenom} {e.clientNom}</span>
                          <span className="text-[9px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {e.statutPaiement}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 font-light space-y-0.5">
                          <p className="flex items-center gap-1.5">✉️ {e.clientEmail}</p>
                          <p className="flex items-center gap-1.5">📞 {e.clientPhone}</p>
                          <p className="text-[10px] text-neutral-400 pt-1.5 border-t border-neutral-100 mt-1">📍 {e.clientAdresse}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <span className="text-2xl block opacity-40">👇</span>
                <p className="text-neutral-400 italic text-xs font-light leading-relaxed">
                  Sélectionnez une formation dans le calendrier pour consulter les participants.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION GESTION DU CATALOGUE ET PLANIFICATION */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* COLONNE FORMULAIRE & LISTE */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* FORMULAIRE Saisie / Édition */}
            <form ref={formRef} onSubmit={handleSaveFormation} className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-base">✨</span>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880]">
                    {isEditing ? "Modifier la Formation" : "Créer une Nouvelle Formation"}
                  </h2>
                </div>
                {isEditing && (
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="text-[10px] uppercase tracking-wider text-neutral-400 hover:text-neutral-700 underline cursor-pointer"
                  >
                    Annuler l'édition
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="text" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Titre de la formation" className="p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light" />
                <input required type="text" value={duration} onChange={(e)=>setDuration(e.target.value)} placeholder="Durée (ex: 2 jours / 14h)" className="p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light" />
                <input required type="text" value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Prix total (€)" className="p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light" />
                <input required type="number" value={acompte} onChange={(e)=>setAcompte(e.target.value)} placeholder="Acompte requis (€)" className="p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light" />
                <input type="number" min="1" value={maxPlaces} onChange={(e)=>setMaxPlaces(e.target.value)} placeholder="Places max par session (ex: 4)" className="p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light sm:col-span-2" />
              </div>

              {/* UPLOAD PHOTO */}
              <div className="border border-dashed border-neutral-300 p-6 bg-[#FAF9F6] rounded-2xl text-center space-y-2">
                <label htmlFor="file-upload" className="cursor-pointer bg-white hover:bg-[#1C1A17] text-[#1C1A17] hover:text-white border border-neutral-300 hover:border-[#1C1A17] px-5 py-2.5 rounded-xl font-semibold uppercase tracking-[0.15em] text-[10px] transition-all duration-300 shadow-2xs inline-block">
                  {imageFile ? "🔄 Remplacer l'image" : "📷 Choisir une image illustrative"}
                </label>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImageFile(e.target.files[0]);
                    }
                  }} 
                  className="hidden" 
                />
                {imageFile && <p className="text-[11px] text-[#C5A880] font-medium italic">Sélectionné : {imageFile.name}</p>}
                {!imageFile && imageUrl && <p className="text-[10px] text-neutral-400 italic">Une image existe déjà pour ce cursus.</p>}
              </div>

              <textarea rows={3} value={intro} onChange={(e)=>setIntro(e.target.value)} placeholder="Présentation / Introduction globale" className="w-full p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light resize-none"></textarea>
              <textarea rows={2} value={objectifs} onChange={(e)=>setObjectifs(e.target.value)} placeholder="Objectif principal" className="w-full p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light resize-none"></textarea>
              <textarea rows={5} value={program} onChange={(e)=>setProgram(e.target.value)} placeholder="Programme détaillé (Un module par ligne)" className="w-full p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-mono resize-none"></textarea>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <textarea rows={2} value={prerequis} onChange={(e)=>setPrerequis(e.target.value)} placeholder="Pré-requis" className="p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light resize-none"></textarea>
                <textarea rows={2} value={modalites} onChange={(e)=>setModalites(e.target.value)} placeholder="Modalités pédagogiques" className="p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light resize-none"></textarea>
              </div>

              <input type="text" value={evaluation} onChange={(e)=>setEvaluation(e.target.value)} placeholder="Évaluation (ex: Examen pratique & théorie)" className="w-full p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <textarea rows={2} value={financement} onChange={(e)=>setFinancement(e.target.value)} placeholder="Financement (FAFCEA, Qualiopi...)" className="p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light resize-none"></textarea>
                <textarea rows={2} value={lesPlus} onChange={(e)=>setLesPlus(e.target.value)} placeholder="Les + de la formation" className="p-3.5 bg-[#FAF9F6] border border-neutral-200 text-xs rounded-xl focus:outline-none focus:border-[#C5A880] transition-colors font-light resize-none"></textarea>
              </div>

              <button 
                type="submit" 
                disabled={uploading} 
                className="w-full bg-[#1C1A17] hover:bg-[#C5A880] text-white font-semibold uppercase tracking-[0.2em] py-4 text-[11px] transition-all duration-500 rounded-xl shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:bg-neutral-300 cursor-pointer"
              >
                {uploading ? "Envoi du fichier..." : isEditing ? "Mettre à jour le cursus" : "Créer le cursus"}
              </button>
            </form>

            {/* CATALOGUE EXISTANT */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                <span className="text-base">📚</span>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880]">Catalogue des Cursus ({formations.length})</h2>
              </div>

              <div className="space-y-3">
                {formations.map(f => (
                  <div key={f.id} className="p-4 bg-[#FAF9F6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl border border-neutral-100 hover:border-neutral-200 transition-colors">
                    <div className="flex items-center gap-4">
                      {f.imageUrl && <img src={f.imageUrl} className="w-12 h-12 object-cover rounded-xl border border-white shadow-2xs" alt="" />}
                      <div>
                        <span className="font-semibold text-sm text-[#1C1A17] block">{f.title}</span>
                        <span className="text-[10px] text-neutral-400 font-light">{f.duration} • {f.priceTotal} € (Acompte: {f.acompte} €)</span>
                      </div>
                    </div>
                    <button 
                      onClick={()=>handleEditClick(f)} 
                      className="text-[10px] font-semibold uppercase tracking-wider text-[#C5A880] hover:text-[#1C1A17] border border-[#C5A880]/30 hover:border-[#1C1A17] px-4 py-2 rounded-xl bg-white transition-all duration-300 cursor-pointer"
                    >
                      Éditer
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* PLANIFICATION DES DATES DE SESSION */}
          <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-neutral-100 shadow-xl space-y-6 sticky top-28">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
              <span className="text-base">➕</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A880]">Ouvrir une Session</h2>
            </div>

            <form onSubmit={handleAddDate} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-neutral-500">Formation cible :</label>
                <div className="relative">
                  <select 
                    value={selectedFormationId} 
                    onChange={(e)=>setSelectedFormationId(e.target.value)} 
                    className="w-full p-3.5 border border-neutral-200 text-xs bg-[#FAF9F6] text-[#1C1A17] rounded-xl focus:outline-none appearance-none focus:border-[#C5A880] transition-colors font-light cursor-pointer pr-10"
                  >
                    <option value="">-- Sélectionner --</option>
                    {formations.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400 text-xs">▼</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-semibold tracking-wider text-neutral-500">Date de Début :</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="w-full p-3 border border-neutral-200 text-xs bg-[#FAF9F6] rounded-xl focus:outline-none focus:border-[#C5A880] font-light" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-semibold tracking-wider text-neutral-500">Date de Fin :</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className="w-full p-3 border border-neutral-200 text-xs bg-[#FAF9F6] rounded-xl focus:outline-none focus:border-[#C5A880] font-light" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#1C1A17] hover:bg-[#C5A880] text-white font-semibold uppercase tracking-[0.2em] py-4 text-[11px] transition-all duration-500 rounded-xl shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                Publier la session
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}