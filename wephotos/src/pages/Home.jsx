import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import Gallery from '../components/Gallery'
import PhotoViewer from '../components/PhotoViewer'
import { CameraIcon, FolderIcon } from '../components/Icons'
import { supabase } from '../supabaseClient'

export default function Home({ user, openAlbum }) {
  const [photos, setPhotos] = useState([])
  const [albums, setAlbums] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const navigate = useNavigate()
  
  useEffect(() => {
    fetchPhotos()
    fetchAlbums()
  }, [])

  async function fetchPhotos() {
    const { data, error } = await supabase.from('photos').select('*').order('created_at', {ascending:false})
    if (!error) setPhotos(data || [])
  }

  async function fetchAlbums() {
    const { data, error } = await supabase.from('albums').select('*').order('created_at', {ascending:false})
    if (!error) setAlbums(data || [])
  }

  const handlePhotoOpen = (photo) => {
    const index = photos.findIndex(p => p.id === photo.id)
    setSelectedPhoto(photo)
    setSelectedIndex(index)
    setIsViewerOpen(true)
  }

  const handleViewerClose = () => {
    setIsViewerOpen(false)
    setSelectedPhoto(null)
  }

  const handlePhotoUpdate = (updatedPhoto) => {
    setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p))
  }

  const handlePhotoDelete = (photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
    >
      {!user ? (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AuthForm onSignedIn={() => fetchPhotos()} />
          </motion.div>
        </div>
      ) : (
        <motion.div variants={itemVariants} className="p-4">
          <Gallery 
            photos={photos} 
            onOpen={handlePhotoOpen}
            onPhotoUpdate={handlePhotoUpdate}
            onPhotoDelete={handlePhotoDelete}
          />
        </motion.div>
      )}
      
      <PhotoViewer
        photo={selectedPhoto}
        photos={photos}
        currentIndex={selectedIndex}
        isOpen={isViewerOpen}
        onClose={handleViewerClose}
      />
    </motion.div>
  )
}
