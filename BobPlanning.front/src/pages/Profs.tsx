import React, { useState, useEffect } from 'react';
import './Profs.css';
import ProfComponent from '../components/ProfComponent'; // Assurez-vous d'importer correctement votre composant
import { getTokenFromLocalStorage } from '../auth/Token';

interface ProfData {
  id: number;
  name: string;
  type: 'EXT' | 'INT';
  dispo: string; // JSON string des disponibilités
}

const Profs: React.FC = () => {
  const [profs, setProfs] = useState<ProfData[]>([]);

  useEffect(() => {
    // Récupérer les données des professeurs au chargement initial
    fetch('http://localhost:3000/getProfsData', {
        headers: {
            'x-access-token': getTokenFromLocalStorage() ?? '',
        },
    })
      .then((response) => response.json())
      .then((data) => setProfs(data))
      .catch((error) => console.error('Erreur lors de la récupération des professeurs:', error));
  }, []);

  const addProf = () => {
    const newProf: ProfData = {
      id: 0,
      name: '',
      type: 'INT',
      dispo: JSON.stringify({
        lundiMatin: false,
        lundiAprem: false,
        mardiMatin: false,
        mardiAprem: false,
        mercrediMatin: false,
        mercrediAprem: false,
        jeudiMatin: false,
        jeudiAprem: false,
        vendrediMatin: false,
        vendrediAprem: false,
      }),
    };
    setProfs([...profs, newProf]);
  };

  const deleteProf = (index: number) => {
    setProfs(profs.filter((_, i) => i !== index));
  };

  const updateProf = (index: number, updatedProf: ProfData) => {
    setProfs(profs.map((prof, i) => (i === index ? updatedProf : prof)));
  };

  const updateProfs = () => {
    // Vérifiez que tous les noms ne sont pas vides
    const invalidProfs = profs.some((prof) => prof.name.trim() === '');
    if (invalidProfs) {
      alert('Veuillez remplir le nom de tous les professeurs.');
      return;
    }
  
    // Mettre à jour les données des professeurs
    fetch('http://localhost:3000/setProfsData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': getTokenFromLocalStorage() ?? '',
      },
      body: JSON.stringify(profs),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Professeurs mis à jour:', data);
        // Mettre à jour les IDs des nouveaux professeurs
        data.insertedIds.forEach((id: number, index: number) => {
          setProfs((prevProfs) =>
            prevProfs.map((prof, i) => (i === index ? { ...prof, id } : prof))
          );
        });
      })
      .catch((error) => console.error('Erreur lors de la mise à jour des professeurs:', error));
  };

  return (
    <div className="contact-container">
      <h1>Profs</h1>
      {profs.map((prof, index) => (
        <div key={index}>
          <ProfComponent
            initialData={prof}
            onDelete={() => deleteProf(index)}
            onUpdate={(updatedProf) => updateProf(index, updatedProf)}
          />
        </div>
      ))}
      <button onClick={addProf}>Ajouter un prof</button>
      <button onClick={updateProfs}>Mettre à jour les profs</button>
    </div>
  );
};

export default Profs;
