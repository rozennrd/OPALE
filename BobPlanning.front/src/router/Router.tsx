import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../Login"
import Parametres from "../pages/Parametres";
import Calendriers from "../pages/Calendriers";
import ErrorPage from "../pages/404";
import Contact from "../pages/Contact";
import ParametresMicro from "../pages/ParametresMicro";
import TrueHome from "../pages/TrueHome";
import Connexion from "../pages/Connexion";
import Salle from "../pages/Salle";
import Profs from "../pages/Profs";
import Profs2 from "../pages/Profs2"

const router = createBrowserRouter([
   // Route pour la connexion (sans Layout)
   {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Connexion />,
      }]
  },
    // Route avec Layout pour toutes les autres pages
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/TrueHome",
        element: <TrueHome />,
        //  element: <Home />,
      },
      {
        path: "/parametres",
        element: <Parametres />,
      },
      {
        path: "/calendriers",
        element: <Calendriers />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/parametresMicro",
        element: <ParametresMicro />,
      },
      {
        path: "/Salle",
        element: <Salle />,
        //  element: <Salle />,
      },
      {
        path: "/Profs",
        element: <Profs />,
        //  element: <Profs />,
      },
      {
        path: "/Profs2",
        element: <Profs2 />,
        //  element: <Profs />,
      }
    ],
  },
]);

export default router;