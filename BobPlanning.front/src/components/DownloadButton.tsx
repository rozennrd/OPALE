// DownloadButton.tsx
import * as React from 'react';
import Button from '@mui/material/Button';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

interface DownloadButtonProps {
  fileUrl: string | null;
  label: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ fileUrl, label }) => {
  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', 'EdtMacro.xlsx'); // Nom du fichier à télécharger
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      variant="contained"
      startIcon={<CloudDownloadIcon />}
      disabled={!fileUrl} // Désactiver le bouton si l'URL du fichier n'est pas définie
      sx={{
        backgroundColor: 'var(--secondary-color)',
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: 'var(--primary-color)',
        },
        mt: 3,
      }}
    >
      {label}
    </Button>
  );
};

export default DownloadButton;
