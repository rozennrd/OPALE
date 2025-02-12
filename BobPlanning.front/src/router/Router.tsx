import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Parametres from "../pages/Parametres";
import Calendriers from "../pages/Calendriers";
import ErrorPage from "../pages/404";
import Contact from "../pages/Contact";
import ParametresMicro from "../pages/ParametresMicro";
import TrueHome from "../pages/TrueHome";
import Salles from "../pages/Salles";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      
      {
        path: "/",
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
        path: "/salles",
        element: <Salles />,
      }
    ],
  },
]);

export default router;