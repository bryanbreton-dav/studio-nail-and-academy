import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

// IMPORTS FULLCALENDAR
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Admin() {
  const [formations, setFormations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ÉTATS FORMULAIRE CATALOGUE
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [acompte, setAcompte] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [intro, setIntro] = useState("");
  const [objectifs, setObjectifs] = useState("");
  const [program, setProgram] = useState(""); 
  const [prerequis, setPrerequis] = useState("");
  const [modalites, setModalites] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [financement, setFinancement] = useState("");
  const [lesPlus, setLesPlus] = useState("");
  const [maxPlaces, setMaxPlaces] = useState("");
  // ÉTATS AJOUT SESSIONS (CALENDRIER)
  const [selectedFormationId, setSelectedFormationId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ÉTATS POUR L'AFFICHAGE DES ÉLÈVES DE LA SESSION SÉLECTIONNÉE
  const [activeSessionInfo, setActiveSessionInfo] = useState(null);

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
      setFormations(snapFormations.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const snapReservations = await getDocs(collection(db, "reservations"));
      setReservations(snapReservations.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

  const handleUploadImage = async (file) => {
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

  const handleSaveFormation = async (e) => {
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
    alert("Formation enregistrée !");
  };

  const handleEditClick = (f) => {
    setIsEditing(true); setCurrentId(f.id);
    setTitle(f.title); setDuration(f.duration); setPrice(f.priceTotal); setAcompte(f.acompte);
    setImageUrl(f.imageUrl || ""); setImageFile(null); setMaxPlaces(f.maxPlaces || "");
    setIntro(f.intro || ""); setObjectifs(f.objectifs || ""); setProgram(f.program || "");
    setPrerequis(f.prerequis || ""); setModalites(f.modalites || "");
    setEvaluation(f.evaluation || ""); setFinancement(f.financement || ""); setLesPlus(f.lesPlus || "");
  };

  const resetForm = () => {
    setIsEditing(false); setTitle(""); setDuration(""); setPrice(""); setAcompte("");
    setImageUrl(""); setImageFile(null); setMaxPlaces("");
    setIntro(""); setObjectifs(""); setProgram(""); setPrerequis(""); setModalites("");
    setEvaluation(""); setFinancement(""); setLesPlus("");
  };

  // FORMATAGE TEXTE POUR LE CLIENT
  const formatDatesRange = (start, end) => {
    if (!start) return "";
    const options = { day: 'numeric', month: 'long', year: 'numeric' } as const;
    const dateDebut = new Date(start).toLocaleDateString('fr-FR', options);
    if (end && end !== start) {
      const dateFin = new Date(end).toLocaleDateString('fr-FR', options);
      return `Du ${dateDebut} au ${dateFin}`;
    }
    return `Le ${dateDebut}`;
  };

  // PLANIFIER UNE NOUVELLE SESSION
  const handleAddDate = async (e) => {
    e.preventDefault();
    if (!selectedFormationId || !startDate) return alert("Champs obligatoires manquants.");
    
    const dateFormatee = formatDatesRange(startDate, endDate);
    const targetFormation = formations.find(form => form.id === selectedFormationId);
    
    // Structure pour le calendrier FullCalendar
    const newSessionObj = {
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

  // COMPILER LES ÉVÉNEMENTS POUR FULLCALENDAR
  const getCalendarEvents = () => {
    const events = [];
    formations.forEach(f => {
      if (f.sessionsDetails) {
        f.sessionsDetails.forEach(session => {
          // FullCalendar s'arrête le jour "end" à 00h00. Pour étaler la ligne sur le dernier jour inclus, on ajoute +1 jour au calendrier visuel
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
            backgroundColor: '#1e293b', // Couleur ardoise élégante
            borderColor: '#d97706',     // Bordure or/dorée
            textColor: '#ffffff'
          });
        });
      }
    });
    return events;
  };

  // AU CLIC SUR UNE LIGNE DU CALENDRIER
  const handleEventClick = (info) => {
    const { formationId, textLabel } = info.event.extendedProps;
    setActiveSessionInfo({
      formationId,
      formationTitle: info.event.title,
      dateLabel: textLabel
    });
  };

  // Filtrer les élèves selon la session cliquée sur le calendrier
  const elevesInscrits = activeSessionInfo 
    ? reservations.filter(r => r.formationId === activeSessionInfo.formationId && r.dateSession === activeSessionInfo.dateLabel)
    : [];

  if (loading) return <div className="p-20 text-center">Chargement global...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-xs space-y-12">
      
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-light uppercase tracking-widest">Tableau de Bord Administratif</h1>
        <button onClick={handleLogout} className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 px-3 py-1.5 rounded-xs font-bold uppercase tracking-wider text-[9px] transition cursor-pointer">
          Se déconnecter ✕
        </button>
      </div>

      {/* SECTION DU VRAI CALENDRIER INTERACTIF */}
      <section className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Le Calendrier à gauche */}
        <div className="lg:col-span-2 bg-white p-6 border shadow-sm rounded-sm admin-calendar">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-institut-dark border-b pb-2">🗓 Planning Général des Sessions</h2>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="fr"
            firstDay={1} // Commence le lundi
            buttonText={{ today: "Aujourd'hui" }}
            events={getCalendarEvents()}
            eventClick={handleEventClick}
            height="auto"
          />
          <p className="text-[10px] text-gray-400 mt-2 italic">👉 Cliquez sur une barre de formation pour charger sa liste d'élèves à droite.</p>
        </div>

        {/* Panneau latéral de la session cliquée à droite */}
        <div className="bg-slate-900 text-white p-6 rounded-sm shadow-md space-y-4 h-full min-h-[400px]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-institut-gold border-b border-gray-700 pb-2">👥 Liste d'Émargement</h2>
          
          {activeSessionInfo ? (
            <div className="space-y-4">
              <div className="bg-slate-800 p-3 rounded-xs border-l-2 border-institut-gold">
                <p className="font-bold text-sm text-white">{activeSessionInfo.formationTitle}</p>
                <p className="text-[10px] text-gray-300 font-mono mt-1">{activeSessionInfo.dateLabel}</p>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {elevesInscrits.length === 0 ? (
                  <p className="text-amber-500 italic py-4 text-center">Aucune inscription pour le moment.</p>
                ) : (
                  elevesInscrits.map(e => (
                    <div key={e.id} className="bg-white text-black p-3 rounded-xs space-y-1 shadow-xs">
                      <div className="flex justify-between font-bold text-xs">
                        <span>{e.clientPrenom} {e.clientNom}</span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 rounded-sm">{e.statutPaiement}</span>
                      </div>
                      <p className="text-gray-500 text-[10px]">📧 {e.clientEmail}</p>
                      <p className="text-gray-500 text-[10px]">📞 {e.clientPhone}</p>
                      <p className="text-gray-400 text-[9px] pt-1 border-t border-gray-100">{e.clientAdresse}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 italic text-center py-12">Cliquez sur une formation dans le calendrier pour voir les participants inscrits.</p>
          )}
        </div>
      </section>

      {/* FORMULAIRES DE CONFIGURATION (BAS DE PAGE) */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveFormation} className="bg-white p-8 border space-y-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase mb-4 border-b pb-2">{isEditing ? "Modifier" : "Créer"} une formation</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Titre de la formation" className="p-2 border" />
              <input type="text" value={duration} onChange={(e)=>setDuration(e.target.value)} placeholder="Durée" className="p-2 border" />
              <input type="text" value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Prix" className="p-2 border" />
              <input type="number" value={acompte} onChange={(e)=>setAcompte(e.target.value)} placeholder="Acompte" className="p-2 border" />
              <input 
                type="number" 
                value={maxPlaces} 
                onChange={(e)=>setMaxPlaces(e.target.value)} 
                placeholder="Places max (ex: 4)" 
                className="p-2 border" 
                min="1"
              />
            </div>

            <div className="border border-dashed border-gray-300 p-4 bg-gray-50 rounded-sm text-center">
              <label htmlFor="file-upload" className="cursor-pointer bg-white hover:bg-institut-dark text-institut-dark hover:text-white border border-institut-dark px-4 py-2 rounded-xs font-semibold uppercase tracking-wider text-[10px] transition shadow-xs inline-block">
                {imageFile ? "🔄 Changer d'image" : "📁 Choisir une image sur mon PC"}
              </label>
              <input id="file-upload" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" />
              {imageFile && <p className="text-[10px] text-gray-600 font-medium italic mt-2">Sélectionné : {imageFile.name}</p>}
            </div>

            <textarea rows={3} value={intro} onChange={(e)=>setIntro(e.target.value)} placeholder="Introduction" className="w-full p-2 border"></textarea>
            <textarea rows={2} value={objectifs} onChange={(e)=>setObjectifs(e.target.value)} placeholder="Objectifs" className="w-full p-2 border"></textarea>
            <textarea rows={6} value={program} onChange={(e)=>setProgram(e.target.value)} placeholder="Programme détaillé" className="w-full p-2 border font-mono"></textarea>
            <div className="grid grid-cols-2 gap-4">
               <textarea rows={3} value={prerequis} onChange={(e)=>setPrerequis(e.target.value)} placeholder="Pré-requis" className="p-2 border"></textarea>
               <textarea rows={3} value={modalites} onChange={(e)=>setModalites(e.target.value)} placeholder="Modalités" className="p-2 border"></textarea>
            </div>
            <input type="text" value={evaluation} onChange={(e)=>setEvaluation(e.target.value)} placeholder="Évaluation" className="w-full p-2 border" />
            <textarea rows={2} value={financement} onChange={(e)=>setFinancement(e.target.value)} placeholder="Financement" className="w-full p-2 border"></textarea>
            <textarea rows={2} value={lesPlus} onChange={(e)=>setLesPlus(e.target.value)} placeholder="Les Plus" className="w-full p-2 border"></textarea>
            <button type="submit" disabled={uploading} className="bg-institut-dark text-white px-6 py-3 uppercase font-bold hover:bg-institut-gold transition disabled:bg-gray-400">
              {uploading ? "Transfert..." : "Enregistrer la formation"}
            </button>
          </form>

          {/* CATALOGUE */}
          <div className="bg-white p-6 border">
            <h2 className="font-bold mb-4 uppercase">Catalogue Actuel</h2>
            <div className="space-y-3">
              {formations.map(f => (
                <div key={f.id} className="p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border">
                  <div className="flex items-center gap-3">
                    {f.imageUrl && <img src={f.imageUrl} className="w-10 h-10 object-cover rounded-xs border" alt="" />}
                    <div>
                      <span className="font-semibold block text-sm">{f.title}</span>
                      <span className="text-[10px] text-gray-400">{f.duration}</span>
                    </div>
                  </div>
                  <button onClick={()=>handleEditClick(f)} className="text-institut-gold font-bold underline">Editer</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PLANIFICATEUR DE SESSIONS (LIÉ AU COMPORTEMENT DU CALENDRIER DU HAUT) */}
        <div className="bg-white p-6 border h-fit sticky top-24 shadow-sm space-y-4">
          <h2 className="font-bold uppercase border-b pb-2">🗓 Planifier une session</h2>
          <form onSubmit={handleAddDate} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1 text-gray-600">Formation cible :</label>
              <select value={selectedFormationId} onChange={(e)=>setSelectedFormationId(e.target.value)} className="w-full p-2.5 border bg-white focus:outline-none">
                <option value="">Sélectionner une formation</option>
                {formations.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1 text-gray-600">Début :</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border bg-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-600">Fin :</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border bg-white" />
              </div>
            </div>
            <button type="submit" className="w-full bg-institut-dark text-white py-3 font-bold uppercase hover:bg-institut-gold transition">Ajouter au calendrier</button>
          </form>
        </div>
      </div>

    </div>
  );
}