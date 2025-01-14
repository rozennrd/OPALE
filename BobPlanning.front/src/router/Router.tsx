import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Parametres from "../pages/Parametres";
import Calendriers from "../pages/Calendriers";
import ErrorPage from "../pages/404";
import Contact from "../pages/Contact";
import ParametresMicro from "../pages/ParametresMicro";
import TrueHome from "../pages/TrueHome";

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
      }
    ],
  },
]);

export default router;