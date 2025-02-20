import * as React from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import MaquetteDisplay from './MaquetteDisplay';
import { getTokenFromLocalStorage } from '../auth/Token';

const RACINE_FETCHER_URL = import.meta.env.VITE_RACINE_FETCHER_URL;

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

//props
interface InputFileUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  responseData: any | null;
  onResponseData: (data: any) => void;
}


export default function InputFileUpload({ onFileUpload, uploadedFile, responseData, onResponseData }: InputFileUploadProps) {

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`${RACINE_FETCHER_URL}/readMaquette`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            "x-access-token": getTokenFromLocalStorage() ?? "",
          },
        });

        console.log('Uploading file successful', response.data);
        //callback
        onFileUpload(file);
        onResponseData(response.data);
        saveCoursesToDB(response.data);
      } catch (error) {
        console.error('Error uploading file : ', error);
      }
    }
  }

  const saveCoursesToDB = async (data: any) => {
    if (!data || !data.cours) return;

    try {
      const payload = {
        courses: data.cours.map((course: any) => ({
          promo: "Promo 2024",  // À modifier dynamiquement si nécessaire
                name: course.name,
                UE: course.UE,
                Semestre: course.semestre.join(','), // Convertir `[1]` en `"1"`
                Periode: JSON.stringify(course.periode), // Stocker en JSON string
                Prof: null, // Par défaut vide (sera mis à jour plus tard)
                typeSalle: "classique", // Valeur par défaut
                heure: JSON.stringify({
                    total: course.heure.total ?? 0,
                    totalAvecProf: course.heure.totalAvecProf ?? 0,
                    coursMagistral: course.heure.coursMagistral ?? 0,
                    coursInteractif: course.heure.coursInteractif ?? 0,
                    td: course.heure.td ?? 0,
                    tp: course.heure.tp ?? 0,
                    projet: course.heure.projet ?? 0,
                    elearning: course.heure.elearning ?? 0
                })
        })),
      };

      const response = await fetch(`${RACINE_FETCHER_URL}/setAllCourses`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-access-token": getTokenFromLocalStorage() ?? "",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement des matières');
      }

      const responseData = await response.json();
      console.log("Toutes les matières ont été enregistrées avec succès.", responseData);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des matières :", error);
    }
  };

  return (
    <div style={{ display: 'contents' }}>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
        sx={{
          backgroundColor: 'var(--secondary-color)',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: 'var(--primary-color)',
          },
          mt: 3,
        }}
      >
        Upload file
        <VisuallyHiddenInput
          type="file"
          onChange={handleUpload}
          multiple
        />
      </Button>
      {uploadedFile && <p>Fichier importé : {uploadedFile.name}</p>}
      {responseData && <MaquetteDisplay data={responseData} />}
    </div>
  );
}
