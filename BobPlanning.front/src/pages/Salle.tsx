import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem } from '@mui/material';

const Salle: React.FC = () => {
  const [salles, setSalles] = useState([]);
  const [nom, setNom] = useState('');
  const [type, setType] = useState('');
  const [capacite, setCapacite] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const typesDisponibles = ['classique', 'electronique', 'informatique', 'projet'];

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

  const handleSubmit = async () => {
    if (!nom || !type || !capacite) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    try {
      const url = editId ? 'http://localhost:3000/updateSalle' : 'http://localhost:3000/setSallesData';
      const method = editId ? 'PUT' : 'POST';
      const body = editId ? { id: editId, name: nom, type, capacite: Number(capacite) } : { name: nom, type, capacite: Number(capacite) };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('accessToken') ?? '',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        loadSalles();
        setNom('');
        setType('');
        setCapacite('');
        setEditId(null);
        setError(''); 
      } else {
        setError("Erreur lors de l'enregistrement de la salle");
      }
    } catch (err) {
      setError('Problème de connexion avec le serveur');
    }
  };

  const deleteSalle = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/deleteSalle?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': localStorage.getItem('accessToken') ?? '',
        },
      });

      if (response.ok) {
        loadSalles();
        setError(''); 
      } else {
        setError('Erreur lors de la suppression de la salle');
      }
    } catch (err) {
      setError('Problème de connexion avec le serveur');
    }
  };

  const startEdit = (salle: any) => {
    setEditId(salle.id);
    setNom(salle.name);
    setType(salle.type);
    setCapacite(salle.capacite ? salle.capacite.toString() : '');
  };

  return (
    <div className="salle-container">
      <Typography variant="h4">Gestion des Salles</Typography>

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
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
        <TextField label="Capacité" type="number" value={capacite} onChange={(e) => setCapacite(e.target.value)} />
        <Button variant="contained" onClick={handleSubmit} style={{ marginLeft: 10 }}>
          {editId ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </div>

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
                <TableCell>{salle.capacite}</TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => startEdit(salle)} style={{ marginRight: 10 }}>
                    Modifier
                  </Button>
                  <Button color="error" onClick={() => deleteSalle(salle.id)}>
                    Supprimer
                  </Button>
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
