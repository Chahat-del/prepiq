import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Subject from './pages/Subject'
import StudyMaterial from './pages/StudyMaterial'
import PYQ from './pages/PYQ'
import Progress from './pages/Progress'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subject/:id" element={<Subject />} />
        <Route path="/subject/:id/material" element={<StudyMaterial />} />
        <Route path="/subject/:id/pyq" element={<PYQ />} />
        <Route path="/subject/:id/progress" element={<Progress />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App