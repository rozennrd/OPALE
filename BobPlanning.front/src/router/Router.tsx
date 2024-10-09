import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Parametres from "../pages/Parametres";
import Calendriers from "../pages/Calendriers";
import ErrorPage from "../pages/404";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/parametres",
        element: <Parametres />,
      },
      {
        path: "/calendriers",
        element: <Calendriers />,
      },
    ],
  },
]);

export default router;