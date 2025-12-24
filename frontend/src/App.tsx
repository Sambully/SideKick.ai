import './App.css'
import { Route, Routes } from 'react-router-dom'
import { Signinpage } from './pages/Signinpage'
import { Signuppage } from './pages/Signuppage'
import { Dashboard } from './pages/Dashboard'
import { ThemeProvider } from "./components/ui/ttheme-provider"
import Companion from './pages/Companion'
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        {/* AUTHENTICATION PART */}
        {/* ////////////////////////////////////////////////////////////////////////////////////////// */}
        {/* ////////////////////////////////////////////////////////////////////////////////////////// */}
        <Route path="/sign-in/*" element={<Signinpage />} />
        <Route path="/sign-up/*" element={<Signuppage />} />
        {/* ////////////////////////////////////////////////////////////////////////////////////////// */}
        {/* ////////////////////////////////////////////////////////////////////////////////////////// */}

        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path='/companion/new' element={<Companion />} />


      </Routes>

    </ThemeProvider>









  )
}
export default App
