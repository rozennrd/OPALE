import React, { useState, useEffect } from 'react';
import './Profs.css';
import ProfComponent from '../components/ProfComponent'; 
import { getTokenFromLocalStorage } from '../auth/Token';

const RACINE_FETCHER_URL = import.meta.env.VITE_RACINE_FETCHER_URL;

interface ProfData {
  id: any;
  name: string;
  type: 'EXT' | 'INT';
  dispo: Record<string, boolean> ;
}

const Profs: React.FC = () => {
  const [profs, setProfs] = useState<ProfData[]>([]);
  const [newProfs, setNewProfs] = useState<ProfData[]>([]);

  useEffect(() => {
    const token = getTokenFromLocalStorage();
    if (token) {
    // Récupérer les données des professeurs au chargement initial
    fetch(`${RACINE_FETCHER_URL}/getProfsData`, {
        headers: {
          'x-access-token': token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setProfs(data);
          console.log("📌 Liste des profs chargée :", data);
        })
        .catch((error) => console.error('❌ Erreur lors de la récupération des professeurs:', error));
    }
  }, []);

  // ➕ Ajouter un nouveau professeur temporaire (sans ID)
  const addProf = () => {
    const newProf: ProfData = {
      id: null, // 🚀 No ID by default
      name: '',
      type: 'INT',
      dispo: {
        lundiMatin: false, lundiAprem: false,
        mardiMatin: false, mardiAprem: false,
        mercrediMatin: false, mercrediAprem: false,
        jeudiMatin: false, jeudiAprem: false,
        vendrediMatin: false, vendrediAprem: false
      },
    };
    setNewProfs((prev) => [...prev, newProf]);
  };

  // 🗑 Supprimer un professeur
  const deleteProf = async (id: number | null) => {
    if (id === null) {
      setNewProfs((prev) => prev.filter((prof) => prof.id !== id));
      return;
    }

    const token = getTokenFromLocalStorage();
    if (!token) {
      alert('⚠️ Vous devez être connecté pour supprimer un professeur.');
      return;
    }

    try {
      const response = await fetch(`${RACINE_FETCHER_URL}/deleteProf/${id}`, {
        method: 'DELETE',
        headers: { 'x-access-token': token },
      });

      if (response.ok) {
        setProfs((prev) => prev.filter((prof) => prof.id !== id));
      } else {
        const message = await response.text();
        alert(`❌ Erreur: ${message}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du professeur", error);
      alert('❌ Une erreur est survenue.');
    }
  };

  // 🔄 Mettre à jour un professeur
  const updateProf = (updatedProfBis: ProfData, index: number, isNew: boolean) => {
    console.log(updatedProfBis);
    if (updatedProfBis.name.trim() === '') {
      alert('⚠️ Le nom du professeur ne peut pas être vide.');
      return;
    }

    if (isNew) {
      setNewProfs((prev) => {
        const updatedList = [...prev];
        updatedList[index] = updatedProfBis;
        return updatedList;
      });
    } else {
      setProfs((prev) => {
        const updatedList = [...prev];
        updatedList[index] = updatedProfBis;
        console.log(updatedList);
        return updatedList;
      });
    }
  };

  // 💾 Sauvegarder les nouveaux professeurs (avec ID généré par le serveur)
  const updateProfs = async () => {
    const validProfs = profs.filter((prof) => prof.name.trim() !== '');
    const validNewProfs = newProfs.filter((prof) => prof.name.trim() !== '');

    try {
      const token = getTokenFromLocalStorage();
      const response = await fetch(`${RACINE_FETCHER_URL}/setProfsData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token ?? '',
        },
        body: JSON.stringify(validProfs),
      });
      const responseNew = await fetch('http://localhost:3000/setProfsData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token ?? '',
        },
        body: JSON.stringify(validNewProfs),
      });

      const data = await response.json();
      const dataNew = await responseNew.json();
      
      if (data.success && dataNew && dataNew.insertedIds) {
        const updatedNewProfs = validNewProfs.map((prof, index) => ({
          ...prof,
          id: data.insertedIds[index], // Assign real ID from server
        }));

        setProfs((prevProfs) => [...prevProfs, ...updatedNewProfs]);
        setNewProfs([]);
        alert('✅ Profs mis à jours avec success !');
      } else {
        alert('⚠️ Erreur lors de l’ajout des professeurs.');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des professeurs:', error);
      alert('❌ Une erreur est survenue.');
    }
  };

  return (
    <div className="profs-container">
      <h1>📚 Gestion des Professeurs</h1>

      <div className="profs-list">
        {profs.map((prof, index) => (
          <div key={prof.id} className="prof-item">
            <ProfComponent
              initialData={prof}
              onUpdate={(updatedProf) => updateProf(updatedProf, index, false)}
              onDelete={() => deleteProf(prof.id)}
            />
          </div>
        ))}

        {newProfs.map((prof, index) => (
          <div key={`new-${index}`} className="prof-item">
            <ProfComponent
              initialData={prof}
              onUpdate={(updatedProf) => updateProf(updatedProf, index, true)}
              onDelete={() => deleteProf(prof.id)}
            />
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button className="btn-add" onClick={addProf}>➕ Ajouter un professeur</button>
        <button className="btn-update" onClick={updateProfs}>💾 Sauvegarder les modifications</button>
      </div>
    </div>
  );
};

export default Profs;
