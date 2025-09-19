import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { HomeIcon, AlbumsIcon, UploadIcon, MenuIcon, CloseIcon } from './Icons'

export default function Navbar({ user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  async function signOut() {
    await supabase.auth.signOut()
  }

  const navItems = [
    { path: '/', label: 'Главная', icon: HomeIcon },
    { path: '/albums', label: 'Альбомы', icon: AlbumsIcon },
    { path: '/upload', label: 'Загрузить', icon: UploadIcon }
  ]

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-50"
    >
      <div className="bg-gradient-to-r from-black/20 via-black/40 to-black/20 backdrop-blur-md border-b border-cyan-200/10">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {/* Логотип */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <div>
                <div className="text-white font-bold text-xl group-hover:text-cyan-300 transition-colors">
                  WePhotos
                </div>
                <div className="text-sm text-cyan-200/60 group-hover:text-cyan-300/80 transition-colors">
                  Ваша фото галерея
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Навигация для десктопа */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <motion.div key={item.path} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'text-cyan-200/70 hover:text-cyan-300 hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Пользователь и меню */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden sm:block text-sm text-cyan-200/80 bg-white/5 px-3 py-2 rounded-lg"
                >
                  {user.email}
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={signOut}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-300 hover:text-red-200 transition-all duration-300 border border-red-500/20"
                >
                  Выйти
                </motion.button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Link
                  to="/"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                >
                  Войти
                </Link>
              </motion.div>
            )}

            {/* Мобильное меню */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <CloseIcon className="w-6 h-6 text-cyan-200" /> : <MenuIcon className="w-6 h-6 text-cyan-200" />}
            </motion.button>
          </div>
        </div>

        {/* Мобильное меню */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-cyan-200/10 bg-black/20 backdrop-blur-md"
            >
              <div className="px-6 py-4 space-y-2">
                {navItems.map((item) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        location.pathname === item.path
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300'
                          : 'text-cyan-200/70 hover:text-cyan-300 hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
