import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Gallery from "../components/Gallery";
import PhotoViewer from "../components/PhotoViewer";

export default function AlbumPage({ albumId }) {
  const [photos, setPhotos] = useState([]);
  const [album, setAlbum] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  // Добавление существующих фото
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [libraryPhotos, setLibraryPhotos] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  useEffect(() => {
    if (!albumId) return;
    fetchAlbum();
  }, [albumId]);

  async function fetchAlbum() {
    setIsLoading(true);
    try {
      // Получаем альбом
      const { data: a } = await supabase
        .from("albums")
        .select("*")
        .eq("id", albumId)
        .single();
      setAlbum(a);

      // Получаем фото
      const { data } = await supabase
        .from("photos")
        .select("*")
        .eq("album_id", albumId)
        .order("created_at", { ascending: false });

      if (data) {
        // Используем сохраненный URL или генерируем публичный URL
        const photosWithUrl = data.map(p => ({
          ...p,
          url: p.url || supabase.storage.from('photos').getPublicUrl(p.path).data.publicUrl
        }))
        setPhotos(photosWithUrl);
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.error('Error fetching album:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function openPicker() {
    setIsPickerOpen(true);
    await fetchLibraryPhotos();
  }

  async function fetchLibraryPhotos() {
    setPickerLoading(true);
    try {
      // Фото текущего пользователя, не в текущем альбоме или без альбома
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .or(`album_id.is.null,album_id.neq.${albumId}`)
        .order("created_at", { ascending: false });
      if (!error) {
        const withUrl = (data || []).map(p => ({
          ...p,
          url: p.url || supabase.storage.from('photos').getPublicUrl(p.path).data.publicUrl
        }));
        setLibraryPhotos(withUrl);
        setSelectedIds(new Set());
      }
    } finally {
      setPickerLoading(false);
    }
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function addSelectedToAlbum() {
    if (selectedIds.size === 0) return;
    setPickerLoading(true);
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from('photos')
        .update({ album_id: albumId })
        .in('id', ids);
      if (!error) {
        // Обновим локально
        const moved = libraryPhotos.filter(p => selectedIds.has(p.id)).map(p => ({ ...p, album_id: albumId }));
        const merged = [...moved, ...photos].sort((a,b)=> (new Date(b.created_at) - new Date(a.created_at)));
        setPhotos(merged);
        setIsPickerOpen(false);
      }
    } finally {
      setPickerLoading(false);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-cyan-200 text-xl">Загрузка альбома...</div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-2xl font-bold text-cyan-100 mb-2">Альбом не найден</h2>
          <p className="text-cyan-200/70 mb-6">Возможно, альбом был удален или не существует</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/albums')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
          >
            Вернуться к альбомам
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-6 max-w-7xl mx-auto"
    >
      {/* Заголовок альбома */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/albums')}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-200/20 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {album.title}
            </h1>
            <p className="text-xl text-cyan-200/70 mt-2">{album.description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-cyan-200/60 text-lg">
            {photos.length} {photos.length === 1 ? 'фотография' : 'фотографий'}
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-200/20 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 text-cyan-200 hover:text-cyan-100 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Добавить фото
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={openPicker}
              className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-200/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 text-cyan-200 hover:text-cyan-100 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Из библиотеки
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Галерея */}
      <motion.div variants={itemVariants}>
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-2xl font-bold text-cyan-100 mb-2">Альбом пуст</h3>
            <p className="text-cyan-200/70 mb-6">Добавьте первые фотографии в этот альбом</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/upload')}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
            >
              Загрузить фото
            </motion.button>
          </div>
        ) : (
          <Gallery 
            photos={photos} 
            onOpen={handlePhotoOpen}
            onPhotoUpdate={handlePhotoUpdate}
            onPhotoDelete={handlePhotoDelete}
          />
        )}
      </motion.div>
      
      <PhotoViewer
        photo={selectedPhoto}
        photos={photos}
        currentIndex={selectedIndex}
        isOpen={isViewerOpen}
        onClose={handleViewerClose}
      />

      {/* Модалка выбора существующих фото */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 w-full max-w-5xl mx-4 border border-cyan-200/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-cyan-100">Добавить фото в альбом</h3>
              <button onClick={()=>setIsPickerOpen(false)} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-200">Закрыть</button>
            </div>
            <div className="mb-3">
              <input
                value={pickerSearch}
                onChange={(e)=>setPickerSearch(e.target.value)}
                placeholder="Поиск по названию..."
                className="w-full p-3 rounded-xl bg-white/5 border border-cyan-200/20 text-cyan-100 placeholder-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto">
              {(libraryPhotos.filter(p => (p.title||'').toLowerCase().includes(pickerSearch.toLowerCase()))).map(p => {
                const active = selectedIds.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={()=>toggleSelect(p.id)}
                    className={`relative rounded-xl overflow-hidden border ${active ? 'border-cyan-400/60 ring-2 ring-cyan-400/30' : 'border-cyan-200/20'} bg-white/5`}
                  >
                    <img src={p.url} alt={p.title} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-cyan-100 bg-black/40 truncate">{p.title || 'Без названия'}</div>
                    {active && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-cyan-200/70">Выбрано: {selectedIds.size}</div>
              <div className="flex gap-2">
                <button onClick={()=>setSelectedIds(new Set())} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-200">Очистить</button>
                <button disabled={pickerLoading || selectedIds.size===0} onClick={addSelectedToAlbum} className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold disabled:opacity-50">
                  {pickerLoading ? 'Добавление...' : 'Добавить в альбом'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
