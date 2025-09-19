import React from 'react'
import { motion } from 'framer-motion'
import PhotoActions from './PhotoActions'

export default function Gallery({ photos = [], onOpen, onPhotoUpdate, onPhotoDelete }) {
  if (!photos.length) return <div className="text-cyan-200/50">Нет фотографий</div>

  return (
    <div className="[column-count:2] sm:[column-count:3] md:[column-count:4] [column-gap:1rem]">
      {photos.map((photo, idx) => (
        <motion.div
          key={photo.id}
          whileHover={{ y: -1 }}
          className="mb-4 break-inside-avoid rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 border border-cyan-200/10 shadow-md group cursor-pointer"
          onClick={() => onOpen?.(photo)}
          style={{
            /* Небольшая вариативность высоты превью */
            /* 48 -> 44/52/60 для живости сети */
            height: undefined
          }}
        >
          <div className="relative">
            <img
              src={photo.url}
              alt={photo.title || ''}
              className="w-full h-auto object-cover"
              loading="lazy"
            />

            <PhotoActions
              photo={photo}
              onUpdate={onPhotoUpdate}
              onDelete={onPhotoDelete}
              className="absolute top-2 right-2"
            />

            {(photo.title || photo.description) && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/35 backdrop-blur-sm p-2 rounded-md pointer-events-none">
                {photo.title && (
                  <div className="text-sm text-cyan-100 font-semibold truncate">{photo.title}</div>
                )}
                {photo.description && (
                  <div 
                    className="text-xs text-cyan-200/70 truncate mt-1"
                    dangerouslySetInnerHTML={{ __html: photo.description }}
                  />
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
