import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { VehicleDetail } from './pages/VehicleDetail'
import { AlertsPage } from './pages/AlertsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicle/:id" element={<VehicleDetail />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/ai-assistant" element={<Dashboard />} /> {/* Placeholder */}
      </Routes>
    </BrowserRouter>
  )
}

export default App