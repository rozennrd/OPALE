import React, { useState, useEffect } from 'react';
import './Profs.css';
import ProfComponent from '../components/ProfComponent'; 
import { getTokenFromLocalStorage } from '../auth/Token';

interface ProfData {
  id: number | null;
  name: string;
  type: 'EXT' | 'INT';
  dispo: string | object; // Peut être une chaîne ou un objet selon la sérialisation
}

const Profs: React.FC = () => {
  const [profs, setProfs] = useState<ProfData[]>([]);
  const [newProfs, setNewProfs] = useState<ProfData[]>([]);

  useEffect(() => {
    const token = getTokenFromLocalStorage();
    if (token) {
      fetch('http://localhost:3000/getProfsData', {
        headers: {
          'x-access-token': token,
        },
      })
        .then((response) => response.json())
        .then((data) => setProfs(data))
        .catch((error) => console.error('❌ Erreur lors de la récupération des professeurs:', error));
    }
  }, []);

  // ➕ Ajouter un nouveau professeur temporaire
  const addProf = () => {
    const newProf: ProfData = {
      id: null,
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
    setNewProfs([...newProfs, newProf]);
  };

  const deleteProf = async (id: number | null) => {
    if (id === null) {
      setNewProfs(newProfs.filter((prof) => prof.id !== id));
      return;
    }

    const token = getTokenFromLocalStorage();
    if (!token) {
      alert('⚠️ Vous devez être connecté pour supprimer un professeur.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/deleteProf/${id}`, {
        method: 'DELETE',
        headers: { 'x-access-token': token },
      });

      if (response.ok) {
        setProfs(profs.filter((prof) => prof.id !== id));
      } else {
        const message = await response.text();
        console.error(`Erreur lors de la suppression du professeur : ${message}`);
        alert(`❌ Erreur: ${message}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du professeur", error);
      alert('❌ Une erreur est survenue.');
    }
  };

  // 🔄 Mettre à jour un professeur dans la liste
  const updateProf = (updatedProf: ProfData, index: number, isNew: boolean) => {
    if (updatedProf.name.trim() === '') {
      alert('⚠️ Le nom du professeur ne peut pas être vide.');
      return;
    }

    if (isNew) {
      setNewProfs((prev) => {
        const updatedList = [...prev];
        updatedList[index] = updatedProf;
        return updatedList;
      });
    } else {
      setProfs((prev) => {
        const updatedList = [...prev];
        updatedList[index] = updatedProf;
        return updatedList;
      });
    }
  };

  const updateProfs = async () => {
    const validNewProfs = newProfs.filter((prof) => prof.name.trim() !== '');
    const updatedNewProfs = validNewProfs.map((prof) => ({ ...prof, id: null }));
    const allProfs = [...profs, ...updatedNewProfs];

    if (allProfs.length === 0) {
      alert('⚠️ Aucun professeur valide à mettre à jour.');
      return;
    }

    const preparedProfs = allProfs.map((prof) => ({
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

      if (data.insertedIds && data.insertedIds.length) {
        setProfs((prevProfs) =>
          prevProfs.map((prof) =>
            prof.id === null ? { ...prof, id: data.insertedIds.shift() ?? 0 } : prof
          )
        );
      }

      setNewProfs([]);
      alert('✅ Professeurs mis à jour avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des professeurs:', error);
      alert('❌ Erreur lors de la mise à jour.');
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
