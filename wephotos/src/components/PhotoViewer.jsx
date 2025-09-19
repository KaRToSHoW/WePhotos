import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PhotoViewer({ photo, isOpen, onClose, photos = [], currentIndex = 0 }) {
  const [index, setIndex] = useState(currentIndex)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setIndex(currentIndex)
      setIsLoading(true)
    }
  }, [isOpen, currentIndex])

  const currentPhoto = photos[index] || photo

  const nextPhoto = () => {
    if (photos.length > 0) {
      setIndex((prev) => (prev + 1) % photos.length)
      setIsLoading(true)
    }
  }

  const prevPhoto = () => {
    if (photos.length > 0) {
      setIndex((prev) => (prev - 1 + photos.length) % photos.length)
      setIsLoading(true)
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen) return
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowRight':
        nextPhoto()
        break
      case 'ArrowLeft':
        prevPhoto()
        break
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen || !currentPhoto) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-6xl max-h-[90vh] w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Навигация */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Изображение */}
          <div className="relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-600 shadow-2xl">
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                </div>
              )}
              <img
                src={currentPhoto.url}
                alt={currentPhoto.title || 'Фотография'}
                className="w-full h-auto max-h-[70vh] object-contain"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            </div>

            {/* Информация о фото */}
            <div className="p-6 bg-gray-800">
              <h3 className="text-2xl font-bold text-cyan-100 mb-2">
                {currentPhoto.title || 'Без названия'}
              </h3>
              {currentPhoto.description && (
                <div 
                  className="text-cyan-200/80 mb-4 leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentPhoto.description }}
                />
              )}
              <div className="flex items-center justify-between text-sm text-cyan-300/60">
                <span>
                  {currentPhoto.created_at && new Date(currentPhoto.created_at).toLocaleDateString('ru-RU')}
                </span>
                {photos.length > 1 && (
                  <span>
                    {index + 1} из {photos.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Индикаторы */}
          {photos.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIndex(i)
                    setIsLoading(true)
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === index ? 'bg-cyan-400' : 'bg-cyan-400/30'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
