import { Outlet } from 'react-router-dom';
import './App.css'
import Layout from './components/Layout';

function App() {

  console.log('.env : ', import.meta.env.VITE_RACINE_FETCHER_URL);

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default App