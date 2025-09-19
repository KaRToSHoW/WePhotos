import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Albums from './pages/Albums'
import UploadPage from './pages/UploadPage'
import AlbumPage from './pages/AlbumPage'
import AuthForm from './components/AuthForm'

function AlbumPageWrapper() {
  const { id } = useParams()
  return <AlbumPage albumId={id} />
}

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0f24] via-[#111633] to-[#1a1f3a] flex items-center justify-center">
        {/* тут просто показываем AuthForm, без setSession */}
        <AuthForm />
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b1a] via-[#0f0f23] to-[#1a1a2e] text-cyan-100 relative overflow-hidden">
        {/* Анимированный фон */}
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse"></div>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent"></div>
        
        <Navbar user={session.user} />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Home user={session.user} />} />
            <Route path="/albums" element={<Albums user={session.user} />} />
            <Route path="/upload" element={<UploadPage user={session.user} />} />
            <Route path="/album/:id" element={<AlbumPageWrapper />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
