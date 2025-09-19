import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../supabaseClient'

export default function PhotoActions({ photo, onUpdate, onDelete, className = "" }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState({
    title: photo.title || '',
    description: photo.description || ''
  })

  const handleEdit = async () => {
    if (!editData.title.trim()) return

    try {
      const { error } = await supabase
        .from('photos')
        .update({
          title: editData.title,
          description: editData.description
        })
        .eq('id', photo.id)

      if (!error) {
        onUpdate?.({ ...photo, ...editData })
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating photo:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту фотографию?')) return

    setIsDeleting(true)
    try {
      // Удаляем файл из storage
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([photo.path])

      if (storageError) {
        console.error('Storage error:', storageError)
      }

      // Удаляем запись из базы данных
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id)

      if (!dbError) {
        onDelete?.(photo.id)
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Кнопка меню */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md mx-4 border border-cyan-200/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-cyan-100 mb-4">Редактировать фото</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-cyan-200/70 mb-2">Название</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/5 border border-cyan-200/20 text-cyan-100 placeholder-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    placeholder="Название фото"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-cyan-200/70 mb-2">Описание</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white/5 border border-cyan-200/20 text-cyan-100 placeholder-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none h-24"
                    placeholder="Описание фото"
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

              <div className="mt-4 pt-4 border-t border-cyan-200/20">
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
                    'Удалить фото'
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
