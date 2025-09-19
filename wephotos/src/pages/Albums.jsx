import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../supabaseClient'
import AlbumCard from '../components/AlbumCard'
import { useNavigate } from 'react-router-dom'

export default function Albums() {
  const [albums, setAlbums] = useState([])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAlbums()
  }, [])

  async function fetchAlbums() {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setAlbums(data || [])
  }

  async function createAlbum(e) {
    e?.preventDefault()
    if (!title) return
    setIsCreating(true)
    await supabase.from('albums').insert([{ title, description: desc }])
    setTitle('')
    setDesc('')
    await fetchAlbums()
    setIsCreating(false)
  }

  function openAlbum(id) {
    navigate(`/album/${id}`)
  }

  const handleAlbumUpdate = (updatedAlbum) => {
    setAlbums(prev => prev.map(a => a.id === updatedAlbum.id ? updatedAlbum : a))
  }

  const handleAlbumDelete = (albumId) => {
    setAlbums(prev => prev.filter(a => a.id !== albumId))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-6 max-w-7xl mx-auto"
    >
      {/* Заголовок */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Мои альбомы
        </h1>
        <p className="text-xl text-cyan-200/70 max-w-2xl mx-auto">
          Организуйте ваши фотографии в красивые коллекции
        </p>
      </motion.div>

      {/* Форма создания альбома */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-cyan-200/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-cyan-100 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Создать новый альбом
          </h2>
          <form onSubmit={createAlbum} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Название альбома"
                className="p-4 rounded-xl bg-white/5 border border-cyan-200/20 text-cyan-100 placeholder-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                required
              />
              <input
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Описание альбома"
                className="p-4 rounded-xl bg-white/5 border border-cyan-200/20 text-cyan-100 placeholder-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isCreating}
              className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Создание...
                </div>
              ) : (
                'Создать альбом'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Сетка альбомов */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-cyan-100">Ваши альбомы</h2>
          <div className="text-cyan-200/70">
            {albums.length} {albums.length === 1 ? 'альбом' : 'альбомов'}
          </div>
        </div>
        
        <AnimatePresence>
          {albums.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-2xl font-bold text-cyan-100 mb-2">Пока нет альбомов</h3>
              <p className="text-cyan-200/70">Создайте первый альбом выше</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {albums.map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <AlbumCard 
                    album={album} 
                    onOpen={() => openAlbum(album.id)}
                    onAlbumUpdate={handleAlbumUpdate}
                    onAlbumDelete={handleAlbumDelete}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
