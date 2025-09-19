import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import UploadForm from '../components/UploadForm'
import { supabase } from '../supabaseClient'

export default function UploadPage({ user }) {
  const [albums, setAlbums] = useState([])
  const [recentUploads, setRecentUploads] = useState([])
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerPhoto, setViewerPhoto] = useState(null)

  useEffect(() => {
    fetchAlbums()
    fetchRecentUploads()
    const handler = (e) => {
      setViewerPhoto(e.detail.photo)
      setViewerOpen(true)
    }
    window.addEventListener('open-photo-viewer', handler)
    return () => window.removeEventListener('open-photo-viewer', handler)
  }, [])

  async function fetchAlbums() {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setAlbums(data || [])
  }

  async function fetchRecentUploads() {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8)
    if (!error) setRecentUploads(data || [])
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
      <motion.div variants={itemVariants} className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Загрузка фотографий
        </h1>
        <p className="text-cyan-200/70 max-w-2xl mx-auto">
          Выберите файл и загрузите фотографию в нужный альбом.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Форма загрузки */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-cyan-200/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-100 mb-6">Загрузить новое фото</h2>
            <UploadForm 
              user={user} 
              albums={albums} 
              onUploaded={() => {
                fetchRecentUploads()
                fetchAlbums()
              }} 
            />
          </div>
        </motion.div>

        {/* Боковая панель */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Недавние загрузки */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/20">
            <h3 className="text-lg font-semibold text-cyan-100 mb-4">Недавние загрузки</h3>
            <div className="grid grid-cols-2 gap-3">
              {recentUploads.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={()=> {
                    // Открываем в модальном просмотрщике через простое событие
                    const event = new CustomEvent('open-photo-viewer', { detail: { photo } })
                    window.dispatchEvent(event)
                  }}
                  className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-white/10 to-transparent border border-cyan-200/20 cursor-pointer"
                >
                  <img 
                    src={photo.url} 
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      {viewerOpen && viewerPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={()=>setViewerOpen(false)}>
          <div className="max-w-5xl w-full px-4" onClick={(e)=>e.stopPropagation()}>
            <img src={viewerPhoto.url} alt={viewerPhoto.title} className="w-full h-auto object-contain max-h-[80vh] rounded-xl border border-cyan-200/20" />
            <div className="mt-3 text-center text-cyan-100 font-medium">{viewerPhoto.title || 'Без названия'}</div>
            {viewerPhoto.description && (<div className="mt-1 text-center text-cyan-200/70" dangerouslySetInnerHTML={{__html: viewerPhoto.description}} />)}
          </div>
        </div>
      )}
    </motion.div>
  )
}
