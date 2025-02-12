import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../Login"
import Home from "../pages/Home";
import Parametres from "../pages/Parametres";
import Calendriers from "../pages/Calendriers";
import ErrorPage from "../pages/404";
import Contact from "../pages/Contact";
import ParametresMicro from "../pages/ParametresMicro";
import TrueHome from "../pages/TrueHome";
import Connexion from "../pages/Connexion";

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
      }
    ],
  },
]);

export default router;