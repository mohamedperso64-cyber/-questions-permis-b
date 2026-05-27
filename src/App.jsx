import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import HomePage from './pages/HomePage'
import StyleguidePage from './pages/StyleguidePage'
import QuestionPage from './pages/QuestionPage'
import ListePage from './pages/ListePage'
import ErreursPage from './pages/ErreursPage'
import ThemePage from './pages/ThemePage'
import ModePlaceholderPage from './pages/ModePlaceholderPage'
import AnnexeVoyantsPage from './pages/AnnexeVoyantsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/styleguide" element={<StyleguidePage />} />
        <Route path="/question/:id" element={<QuestionPage />} />
        <Route path="/mode/liste" element={<ListePage />} />
        <Route path="/mode/erreurs" element={<ErreursPage />} />
        <Route path="/mode/theme" element={<ThemePage />} />
        <Route path="/mode/theme/:themeKey" element={<ThemePage />} />
        <Route path="/mode/:mode" element={<ModePlaceholderPage />} />
        <Route path="/annexes/voyants" element={<AnnexeVoyantsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
