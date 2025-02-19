import React, { useState, useEffect } from 'react';
import './Profs.css';
import ProfComponent from '../components/ProfComponent'; 
import { getTokenFromLocalStorage } from '../auth/Token';

interface ProfData {
  id: number;
  name: string;
  type: 'EXT' | 'INT';
  dispo: string | { [key: string]: boolean };
}

const Profs: React.FC = () => {
  const [profs, setProfs] = useState<ProfData[]>([]);
  const [newProfs, setNewProfs] = useState<ProfData[]>([]); // Stocke les nouveaux profs temporairement

  useEffect(() => {
    const token = getTokenFromLocalStorage();
    if (token) {
      fetch('http://localhost:3000/getProfsData', {
        headers: {
          'x-access-token': token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // Désérialisation si dispo est une chaîne
          const updatedData = data.map((prof: ProfData) => ({
            ...prof,
            dispo: typeof prof.dispo === 'string' ? JSON.parse(prof.dispo) : prof.dispo,
          }));
          setProfs(updatedData);
        })
        .catch((error) => console.error('❌ Erreur lors de la récupération des professeurs:', error));
    }
  }, []);

  // ➕ Ajouter un nouveau professeur temporaire
  const addProf = () => {
    const newProf: ProfData = {
      id: 0, // Id initialisé à 0 car c'est un nouveau prof
      name: '',
      type: 'INT',
      dispo: {
        lundiMatin: false, lundiAprem: false,
        mardiMatin: false, mardiAprem: false,
        mercrediMatin: false, mercrediAprem: false,
        jeudiMatin: false, jeudiAprem: false,
        vendrediMatin: false, vendrediAprem: false,
      },
    };
    setNewProfs([...newProfs, newProf]);
  };

  const deleteProf = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    console.log("Token récupéré:", token);  // Ajout du log pour vérifier le token

    if (!token) {
      alert('⚠️ Vous devez être connecté pour supprimer un professeur.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/deleteProf/${id}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token,
        },
      });

      if (response.ok) {
        setProfs(profs.filter((prof) => prof.id !== id));
        console.log("Professeur supprimé avec succès");
      } else {
        const message = await response.text();
        console.error(`Erreur lors de la suppression du professeur : ${message}`);
        alert(`❌ Erreur: ${message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du professeur", error);
      alert('❌ Une erreur est survenue lors de la suppression.');
    }
  };

  const updateProf = (updatedProf: ProfData, index: number, isNew: boolean) => {
    if (updatedProf.name.trim() === '') {
      alert('⚠️ Le nom du professeur ne peut pas être vide.');
      return;
    }

    if (isNew) {
      setNewProfs(newProfs.map((prof, i) => (i === index ? updatedProf : prof)));
    } else {
      setProfs(profs.map((prof, i) => (i === index ? updatedProf : prof)));
    }
  };

  const updateProfs = async () => {
    const allProfs = [...profs, ...newProfs].filter(prof => prof.name.trim() !== '');

    if (allProfs.length === 0) {
      alert('⚠️ Aucun professeur valide à mettre à jour.');
      return;
    }

    const preparedProfs = allProfs.map(prof => ({
      ...prof,
      dispo: typeof prof.dispo === 'string' ? JSON.parse(prof.dispo) : prof.dispo, 
    }));

    try {
      const token = getTokenFromLocalStorage();
      const response = await fetch('http://localhost:3000/setProfsData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token ?? '',
        },
        body: JSON.stringify(preparedProfs),
      });

      const data = await response.json();
      console.log('✅ Réponse du serveur:', data);

      if (data.insertedIds && data.insertedIds.length) {
        setProfs((prevProfs) =>
          prevProfs.map((prof, index) => 
            prof.id === 0 ? { ...prof, id: data.insertedIds.shift() ?? 0 } : prof
          )
        );
      }

      setNewProfs([]);
      alert('✅ Professeurs mis à jour avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des professeurs:', error);
      alert('Erreur lors de la mise à jour des professeurs.');
    }
  };

  return (
    <div className="profs-container">
      <h1>📚 Gestion des Professeurs</h1>

      {/* Liste des professeurs existants */}
      <div className="profs-list">
        {profs.map((prof, index) => (
          <div key={prof.id} className="prof-item">
            <ProfComponent
              initialData={prof}
              onUpdate={(updatedProf) => updateProf(updatedProf, index, false)}
              onDelete={() => deleteProf(prof.id)} // Passe l'ID du professeur
            />
          </div>
        ))}

        {/* Liste des nouveaux professeurs */}
        {newProfs.map((prof, index) => (
          <div key={`new-${index}`} className="prof-item">
            <ProfComponent
              initialData={prof}
              onUpdate={(updatedProf) => updateProf(updatedProf, index, true)}
              onDelete={() => deleteProf(prof.id)} // Passe l'ID du professeur
            />
          </div>
        ))}
      </div>

      <div className="action-buttons">
        {/* ➕ Ajouter un professeur temporairement */}
        <button className="btn-add" onClick={addProf}>➕ Ajouter un professeur</button>

        {/* 🔄 Mettre à jour tous les professeurs */}
        <button className="btn-update" onClick={updateProfs}>💾 Sauvegarder les modifications</button>
      </div>
    </div>
  );
};

export default Profs;
