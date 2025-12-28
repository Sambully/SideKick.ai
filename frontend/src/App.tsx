import './App.css'
import { Route, Routes, useParams } from 'react-router-dom'
import { Signinpage } from './pages/Signinpage'
import { Signuppage } from './pages/Signuppage'
import { Dashboard } from './pages/Dashboard'
import { ThemeProvider } from "./components/ui/ttheme-provider"
import Companion from './pages/Companion'
import { Toaster } from "./components/ui/sonner"
const Campaignpage = () => {
  const params = useParams();
  return <Companion params={{ companionId: params.companionId || "new" }} />;
}
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
        <Route path='/companion/:companionId' element={<Campaignpage />} />



      </Routes>
      <Toaster />

    </ThemeProvider>









  )
}
export default App
