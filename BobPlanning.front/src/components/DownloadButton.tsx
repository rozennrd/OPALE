// // DownloadButton.tsx
// import * as React from 'react';
// import Button from '@mui/material/Button';
// import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

// interface DownloadButtonProps {
//   fileUrl: string | null;
//   label: string;
// }

// const DownloadButton: React.FC<DownloadButtonProps> = ({ fileUrl, label }) => {
//   const handleDownload = () => {
//     if (fileUrl) {
//       const link = document.createElement('a');
//       link.href = fileUrl;
//       link.setAttribute('download', 'EdtMacro.xlsx'); // Nom du fichier à télécharger
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   return (
//     <Button
//       onClick={handleDownload}
//       variant="contained"
//       startIcon={<CloudDownloadIcon />}
//       disabled={!fileUrl} // Désactiver le bouton si l'URL du fichier n'est pas définie
//       sx={{
//         backgroundColor: 'var(--secondary-color)',
//         color: '#FFFFFF',
//         '&:hover': {
//           backgroundColor: 'var(--primary-color)',
//         },
//         mt: 3,
//       }}
//     >
//       {label}
//     </Button>
//   );
// };

// export default DownloadButton;
// DownloadButton.tsx
import * as React from 'react';
import Button from '@mui/material/Button';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

interface DownloadButtonProps {
  fileUrl: string | null;
  label: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ fileUrl, label }) => {
  const handleDownload = async () => {
    if (!fileUrl) return;

    try {
      const token = localStorage.getItem("accessToken"); // Récupérer le token

      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          "x-access-token": token ?? "", // Ajouter le token dans l'en-tête
        },
      });

      if (!response.ok) {
        throw new Error("Échec du téléchargement du fichier : " + response.statusText);
      }

      // Convertir la réponse en Blob (fichier binaire)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Création du lien pour le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'EdtMacro.xlsx'); // Nom du fichier
      document.body.appendChild(link);
      link.click();

      // Nettoyage
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error);
      alert("Erreur lors du téléchargement du fichier.");
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
