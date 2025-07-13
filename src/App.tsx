import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Shows from './pages/Shows'
import ShowDetails from './pages/ShowDetails'
import Episodes from './pages/Episodes'
import Characters from './pages/Characters'
import Scripts from './pages/Scripts'
import ScriptGeneration from './pages/ScriptGeneration'
import ScriptReview from './pages/ScriptReview'
import Audio from './pages/Audio'
import AudioGeneration from './pages/AudioGeneration'
import Settings from './pages/Settings'
import ToastContainer from './components/ui/ToastContainer'
import ErrorBoundary from './components/ErrorBoundary'
import { useWebSocket } from './hooks/useWebSocket'

function App() {
  // Initialize WebSocket connection for real-time updates
  useWebSocket()

  return (
    <>
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shows" element={<Shows />} />
            <Route path="/shows/:id" element={<ShowDetails />} />
            <Route path="/episodes" element={<Episodes />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/scripts" element={<Scripts />} />
            <Route path="/audio" element={<Audio />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/episodes/:id/script-generation" element={<ScriptGeneration />} />
            <Route path="/episodes/:id/script-review" element={<ScriptReview />} />
            <Route path="/episodes/:id/audio-generation" element={<AudioGeneration />} />
          </Routes>
        </Layout>
        <ToastContainer />
      </ErrorBoundary>
    </>
  )
}

export default App