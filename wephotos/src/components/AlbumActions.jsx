import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../supabaseClient'
import RichTextEditor from './RichTextEditor'

export default function AlbumActions({ album, onUpdate, onDelete, className = "" }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState({
    title: album.title || '',
    description: album.description || ''
  })

  const handleEdit = async () => {
    if (!editData.title.trim()) return

    try {
      const { error } = await supabase
        .from('albums')
        .update({
          title: editData.title,
          description: editData.description
        })
        .eq('id', album.id)

      if (!error) {
        onUpdate?.({ ...album, ...editData })
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating album:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот альбом? Все фотографии в нем останутся, но будут перемещены в "Без альбома".')) return

    setIsDeleting(true)
    try {
      // Перемещаем все фото из альбома в "Без альбома"
      const { error: updatePhotosError } = await supabase
        .from('photos')
        .update({ album_id: null })
        .eq('album_id', album.id)

      if (updatePhotosError) {
        console.error('Error updating photos:', updatePhotosError)
      }

      // Удаляем альбом
      const { error: deleteError } = await supabase
        .from('albums')
        .delete()
        .eq('id', album.id)

      if (!deleteError) {
        onDelete?.(album.id)
      }
    } catch (error) {
      console.error('Error deleting album:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Кнопка меню */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsEditing(true)}
        className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </motion.button>

      {/* Модальное окно редактирования */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 border border-gray-600 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-cyan-100 mb-4">Редактировать альбом</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-cyan-200/70 mb-2">Название альбома</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/5 border border-cyan-200/20 text-cyan-100 placeholder-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    placeholder="Название альбома"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-cyan-200/70 mb-2">Описание</label>
                  <RichTextEditor
                    value={editData.description}
                    onChange={(value) => setEditData({ ...editData, description: value })}
                    placeholder="Описание альбома"
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                >
                  Сохранить
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-cyan-200 transition-all duration-300"
                >
                  Отмена
                </motion.button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-600">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-300 hover:text-red-200 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-300 mr-2"></div>
                      Удаление...
                    </div>
                  ) : (
                    'Удалить альбом'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
