import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AlbumSelect({ albums = [], value, onChange, placeholder = "Выберите альбом", className = "" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const selectRef = useRef(null)
  const inputRef = useRef(null)

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedAlbum = albums.find(album => album.id === value)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (album) => {
    onChange(album.id)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Кнопка селекта */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 rounded-xl bg-white/5 border border-cyan-200/20 text-left focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 hover:bg-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <div className="text-cyan-100 font-medium">
                {selectedAlbum ? selectedAlbum.title : placeholder}
              </div>
              {selectedAlbum && selectedAlbum.description && (
                <div className="text-sm text-cyan-200/60 truncate max-w-48">
                  {selectedAlbum.description}
                </div>
              )}
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-cyan-200/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.button>

      {/* Выпадающий список */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-cyan-200/20 shadow-2xl z-50 overflow-hidden"
          >
            {/* Поиск */}
            <div className="p-3 border-b border-cyan-200/10">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-200/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск альбома..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-cyan-200/20 rounded-lg text-cyan-100 placeholder-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm"
                />
              </div>
            </div>

            {/* Список альбомов */}
            <div className="max-h-64 overflow-y-auto">
              {/* Опция "Без альбома" */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                onClick={() => handleSelect({ id: '', title: 'Без альбома', description: 'Фотографии без альбома' })}
                className={`w-full p-3 text-left transition-colors duration-200 ${
                  value === '' ? 'bg-cyan-500/20 text-cyan-300' : 'text-cyan-200 hover:text-cyan-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Без альбома</div>
                    <div className="text-sm text-cyan-200/60">Фотографии без альбома</div>
                  </div>
                </div>
              </motion.button>

              {/* Альбомы */}
              {filteredAlbums.map((album, index) => (
                <motion.button
                  key={album.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                  onClick={() => handleSelect(album)}
                  className={`w-full p-3 text-left transition-colors duration-200 ${
                    value === album.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-cyan-200 hover:text-cyan-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{album.title}</div>
                      {album.description && (
                        <div className="text-sm text-cyan-200/60 truncate">
                          {album.description}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}

              {filteredAlbums.length === 0 && searchTerm && (
                <div className="p-4 text-center text-cyan-200/60">
                  <svg className="w-8 h-8 mx-auto mb-2 text-cyan-200/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div>Альбомы не найдены</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
