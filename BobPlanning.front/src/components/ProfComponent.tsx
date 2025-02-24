import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

type Disponibilites = {
  [key: string]: boolean;
};

interface ProfComponentProps {
  initialData?: {
    id: any;
    name: string;
    type: 'EXT' | 'INT';
    dispo: Record<string, boolean>;
  };
  onDelete: () => void;
  onUpdate: (updatedProf: { id: number; name: string; type: 'EXT' | 'INT'; dispo: string }) => void;
}

const ProfComponent: React.FC<ProfComponentProps> = ({ initialData, onDelete, onUpdate }) => {
  const [nom, setNom] = useState<string>(initialData?.name || '');
  const [typeProf, setTypeProf] = useState<'EXT' | 'INT'>(initialData?.type || 'INT');
  const [disponibilites, setDisponibilites] = useState<Disponibilites>(
    // Vérifie si dispo est une chaîne avant de la parser
    initialData?.dispo && typeof initialData.dispo === 'string'
      ? JSON.parse(initialData.dispo)
      : {
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
        }
  );

  useEffect(() => {
    if (initialData) {
      setNom(initialData.name);
      setTypeProf(initialData.type);
      // Vérifie si dispo est une chaîne avant de la parser
      if (initialData.dispo && typeof initialData.dispo === 'string') {
        setDisponibilites(JSON.parse(initialData.dispo));
      }
    }
  }, [initialData]);

  const handleCheckboxChange = (dayPeriod: string) => {
    setDisponibilites((prev) => ({
      ...prev,
      [dayPeriod]: !prev[dayPeriod],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updatedProf = {
      id: initialData?.id || null,
      name: nom,
      type: typeProf,
      // Convertit dispo en une chaîne JSON avant de l'envoyer
      dispo: JSON.stringify(disponibilites),
    };
    onUpdate(updatedProf);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Nom du professeur:
          <input
            type="text"
            value={nom}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNom(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Type:
          <select value={typeProf} onChange={(e: ChangeEvent<HTMLSelectElement>) => setTypeProf(e.target.value as 'EXT' | 'INT')}>
            <option value="INT">Interne</option>
            <option value="EXT">Externe</option>
          </select>
        </label>
      </div>
      <div className="disponibilites">
        <div className="day-row">
          <label>
            <input
              type="checkbox"
              checked={disponibilites.lundiMatin}
              onChange={() => handleCheckboxChange('lundiMatin')}
            />
            Lundi Matin
          </label>
          <label>
            <input
              type="checkbox"
              checked={disponibilites.lundiAprem}
              onChange={() => handleCheckboxChange('lundiAprem')}
            />
            Lundi Après-midi
          </label>
        </div>
        <div className="day-row">
          <label>
            <input
              type="checkbox"
              checked={disponibilites.mardiMatin}
              onChange={() => handleCheckboxChange('mardiMatin')}
            />
            Mardi Matin
          </label>
          <label>
            <input
              type="checkbox"
              checked={disponibilites.mardiAprem}
              onChange={() => handleCheckboxChange('mardiAprem')}
            />
            Mardi Après-midi
          </label>
        </div>
        <div className="day-row">
          <label>
            <input
              type="checkbox"
              checked={disponibilites.mercrediMatin}
              onChange={() => handleCheckboxChange('mercrediMatin')}
            />
            Mercredi Matin
          </label>
          <label>
            <input
              type="checkbox"
              checked={disponibilites.mercrediAprem}
              onChange={() => handleCheckboxChange('mercrediAprem')}
            />
            Mercredi Après-midi
          </label>
        </div>
        <div className="day-row">
          <label>
            <input
              type="checkbox"
              checked={disponibilites.jeudiMatin}
              onChange={() => handleCheckboxChange('jeudiMatin')}
            />
            Jeudi Matin
          </label>
          <label>
            <input
              type="checkbox"
              checked={disponibilites.jeudiAprem}
              onChange={() => handleCheckboxChange('jeudiAprem')}
            />
            Jeudi Après-midi
          </label>
        </div>
        <div className="day-row">
          <label>
            <input
              type="checkbox"
              checked={disponibilites.vendrediMatin}
              onChange={() => handleCheckboxChange('vendrediMatin')}
            />
            Vendredi Matin
          </label>
          <label>
            <input
              type="checkbox"
              checked={disponibilites.vendrediAprem}
              onChange={() => handleCheckboxChange('vendrediAprem')}
            />
            Vendredi Après-midi
          </label>
        </div>
      </div>
      <button type="button" onClick={onDelete}>Supprimer</button>
    </form>
  );
};

export default ProfComponent;