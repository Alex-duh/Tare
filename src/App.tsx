import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import AnimatedBackground from './components/AnimatedBackground'
import Landing from './pages/Landing'
import Results from './pages/Results'
import './i18n'

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/results" element={<Results />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  )
}
