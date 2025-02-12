import * as React from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import MaquetteDisplay from './MaquetteDisplay';

const RACINE_FETCHER_URL =import.meta.env.VITE_RACINE_FETCHER_URL;

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
  uploadedFile : File | null;
  responseData: any | null;
  onResponseData: (data: any) => void;
}


export default function InputFileUpload({ onFileUpload , uploadedFile, responseData, onResponseData}: InputFileUploadProps) {

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`${RACINE_FETCHER_URL}/readMaquette`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Uploading file successful', response.data);
        //callback
        onFileUpload(file);
        onResponseData(response.data);
      } catch (error) {
        console.error('Error uploading file : ', error);
      }
    }
  }
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
