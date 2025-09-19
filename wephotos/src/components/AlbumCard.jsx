import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AlbumActions from './AlbumActions'
import { supabase } from '../supabaseClient'

export default function AlbumCard({ album, onOpen, onAlbumUpdate, onAlbumDelete }) {
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPreviewPhoto()
  }, [album.id])

  async function fetchPreviewPhoto() {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('url, title')
        .eq('album_id', album.id)
        .order('created_at', { ascending: true })
        .limit(1)
      
      if (!error && data && data.length > 0) {
        setPreviewPhoto(data[0])
      }
    } catch (error) {
      console.error('Error fetching preview photo:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="group cursor-pointer"
    >
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/20 hover:border-cyan-400/40 transition-all duration-300 shadow-lg hover:shadow-2xl relative">
        {/* Действия с альбомом */}
        <AlbumActions
          album={album}
          onUpdate={onAlbumUpdate}
          onDelete={onAlbumDelete}
          className="absolute top-2 right-2 z-10"
        />
        
        <div onClick={() => onOpen(album.id)}>
          <div className="h-48 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center text-3xl font-bold text-cyan-100 group-hover:from-cyan-500/30 group-hover:via-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300 relative overflow-hidden">
            {loading ? (
              <div className="animate-pulse bg-cyan-500/20 rounded-lg w-16 h-16"></div>
            ) : previewPhoto ? (
              <img 
                src={previewPhoto.url} 
                alt={previewPhoto.title || album.title}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">{album.title}</span>
              </>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-cyan-100 mb-2 group-hover:text-cyan-300 transition-colors">
              {album.title}
            </h3>
            <div 
              className="text-sm text-cyan-200/70 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: album.description || 'Описание отсутствует' }}
            />
            <div className="mt-3 flex items-center text-xs text-cyan-400/60">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Нажмите для просмотра
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
