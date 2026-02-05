import './App.css'
import { Route, Routes, useParams } from 'react-router-dom'
import { Signinpage } from './pages/Signinpage'
import { Signuppage } from './pages/Signuppage'
import { Dashboard } from './pages/Dashboard'
import { ThemeProvider } from "./components/ui/ttheme-provider"
import Companion from './pages/Companion'
import { Toaster } from "./components/ui/sonner"
import Chat from './pages/Chat'
import Chatofcompanion from './component/Chatofcompanion'
import { Settings } from './pages/Settings'
import { SubscriptionContent } from './component/SubscriptionModal'
import LandingPage from './pages/LandingPage'

const Campaignpage = () => {
  const params = useParams();
  return <Companion params={{ companionId: params.companionId || "new" }} />;
}
const Companionchatparams = () => {
  const params = useParams();
  return <Chatofcompanion chatId={params.chatId || null} />
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
        <Route path='/chat/:chatId' element={<Companionchatparams />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/subscription' element={<SubscriptionContent />} />
        <Route path="/" element={<LandingPage />} />


      </Routes>
      <Toaster />

    </ThemeProvider>









  )
}
export default App
