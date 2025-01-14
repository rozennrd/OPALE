import * as React from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import MaquetteDisplay from './MaquetteDisplay';

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

export default function InputFileUpload() {
  const [filename, setFilename] = React.useState<string | null>(null);
  const [responseData, setResponseData] = React.useState<any | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFilename(file.name);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('http://localhost:3000/readMaquette', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Uploading file successful', response.data);
        setResponseData(response.data);
      } catch (error) {
        console.error('Error uploading file : ', error);
      }
    }
  }
  return (
    <div  style={{ display: 'contents' }}>
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
      {filename &&
       <p> Fichier importé : {filename}</p>
       }
       {responseData && <MaquetteDisplay data={responseData} />}
    </div>
  );
}
