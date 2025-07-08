import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Shows from './pages/Shows'
import Episodes from './pages/Episodes'
import ToastContainer from './components/ui/ToastContainer'

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/episodes" element={<Episodes />} />
        </Routes>
      </Layout>
      <ToastContainer />
    </>
  )
}

export default App