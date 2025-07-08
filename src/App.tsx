import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Shows from './pages/Shows'
import ShowDetails from './pages/ShowDetails'
import Episodes from './pages/Episodes'
import ToastContainer from './components/ui/ToastContainer'
import { useWebSocket } from './hooks/useWebSocket'

function App() {
  // Initialize WebSocket connection for real-time updates
  useWebSocket()

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/shows/:id" element={<ShowDetails />} />
          <Route path="/episodes" element={<Episodes />} />
        </Routes>
      </Layout>
      <ToastContainer />
    </>
  )
}

export default App