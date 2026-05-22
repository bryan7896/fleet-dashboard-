import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from './components/common/Toast'
import { Dashboard } from './pages/Dashboard'
import { VehicleDetail } from './pages/VehicleDetail'
import { AlertsPage } from './pages/AlertsPage'
import { AIAssistant } from './pages/AIAssistant'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicle/:id" element={<VehicleDetail />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App