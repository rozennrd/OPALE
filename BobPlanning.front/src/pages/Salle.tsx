import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem } from '@mui/material';

const Salle: React.FC = () => {
  const [salles, setSalles] = useState([]);
  const [nom, setNom] = useState('');
  const [type, setType] = useState('');
  const [capacite, setCapacite] = useState('');
  const [error, setError] = useState('');

  const typesDisponibles = ['classique', 'electronique', 'informatique', 'projet'];

  // Charger les salles depuis l'API
  const loadSalles = async () => {
    try {
      const response = await fetch('http://localhost:3000/getSallesData', {
        headers: {
          'x-access-token': localStorage.getItem('accessToken') ?? '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSalles(data);
      } else {
        throw new Error('Erreur lors du chargement des salles');
      }
    } catch (err) {
      setError('Problème de connexion avec le serveur');
    }
  };

  useEffect(() => {
    loadSalles();
  }, []);

  const addSalle = async () => {
    if (!nom || !type || !capacite) {
      setError('Tous les champs sont obligatoires');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/setSallesData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('accessToken') ?? '',
        },
        body: JSON.stringify({ name: nom, type, capacite: Number(capacite) }), 
      });
  
      if (response.ok) {
        loadSalles(); 
        setNom('');
        setType('');
        setCapacite('');
      } else {
        setError("Erreur lors de l'ajout de la salle");
      }
    } catch (err) {
      setError('Problème de connexion avec le serveur');
    }
  };
  

  // Supprimer une salle
  const deleteSalle = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/deleteSalle?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': localStorage.getItem('accessToken') ?? '',
        },
      });

      if (response.ok) {
        loadSalles(); // Réactualise la liste des salles
      } else {
        setError('Erreur lors de la suppression de la salle');
      }
    } catch (err) {
      setError('Problème de connexion avec le serveur');
    }
  };

  return (
    <div className="salle-container">
      <Typography variant="h4">Gestion des Salles</Typography>

      {/* Formulaire d'ajout */}
      <div style={{ marginBottom: 20 }}>
        <TextField label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} style={{ marginRight: 10 }} />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          displayEmpty
          style={{ marginRight: 10, minWidth: 120 }}
        >
          <MenuItem value="" disabled>Type</MenuItem>
          {typesDisponibles.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        <TextField label="Capacité" type="number" value={capacite} onChange={(e) => setCapacite(e.target.value)} />
        <Button variant="contained" onClick={addSalle} style={{ marginLeft: 10 }}>Ajouter</Button>
      </div>

      {/* Table des salles */}
      {error && <Typography color="error">{error}</Typography>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Capacité</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salles.map((salle: any) => (
              <TableRow key={salle.id}>
                <TableCell>{salle.name}</TableCell>
                <TableCell>{salle.type}</TableCell>
                <TableCell>{salle.capacity}</TableCell>
                <TableCell>
                  <Button color="error" onClick={() => deleteSalle(salle.id)}>Supprimer</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Salle;
