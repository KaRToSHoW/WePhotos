import React, { useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";
import AlbumSelect from "./AlbumSelect";

export default function UploadForm({ user, albums = [], onUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [albumId, setAlbumId] = useState(albums[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      setFile(dropped);
    }
  }

  function onSelectFile(e) {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith("image/")) setFile(f);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return setError("Выберите файл");

    setLoading(true);
    setError("");

    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Загружаем в бакет "photos"
    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    // Генерируем публичный URL
    const {
      data: { publicUrl },
      error: urlError,
    } = supabase.storage.from("photos").getPublicUrl(filePath);

    if (urlError || !publicUrl) {
      setError(urlError?.message || "Не удалось получить URL файла");
      setLoading(false);
      return;
    }

    // Сохраняем запись в таблице "photos"
    // Пытаемся сохранить с описанием, если колонки нет — fallback без описания
    let dbError = null;
    const baseRow = {
      title,
      album_id: albumId || null,
      path: filePath,
      url: publicUrl,
      user_id: user.id,
    };
    let resp = await supabase.from("photos").insert([{ ...baseRow, description }]);
    dbError = resp.error;
    if (dbError && /description/i.test(dbError.message)) {
      resp = await supabase.from("photos").insert([baseRow]);
      dbError = resp.error;
    }

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    // Сброс формы
    setFile(null);
    setTitle("");
    setDescription("");
    setAlbumId(albums[0]?.id || "");
    setLoading(false);
    onUploaded?.();
  }

  return (
    <form
      onSubmit={handleUpload}
      className="flex flex-col gap-2 bg-[#111633]/50 p-4 rounded-xl"
    >
      {/* Зона загрузки */}
      <div
        onDragOver={(e)=>{e.preventDefault(); setIsDragOver(true)}}
        onDragLeave={()=>setIsDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border ${isDragOver ? 'border-cyan-400/60 bg-cyan-500/5' : 'border-cyan-200/20 bg-white/5'} p-4 transition-all`}
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-cyan-200/20 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="text-cyan-100 font-medium">Перетащите изображение сюда</div>
            <div className="text-sm text-cyan-200/70">или выберите файл с устройства</div>
            <div className="mt-2 flex items-center gap-2">
              <label className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-200/20 text-cyan-100 hover:from-cyan-500/30 hover:to-blue-500/30 cursor-pointer transition-all">
                Выбрать файл
                <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
              </label>
              {file && (
                <button type="button" onClick={()=>setFile(null)} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-200 border border-cyan-200/10">
                  Удалить
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <input
        type="text"
        placeholder="Название фото"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 rounded-md bg-transparent border border-cyan-200/20 placeholder-cyan-400 text-cyan-100"
      />
      <textarea
        placeholder="Описание фото"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-2 rounded-md bg-transparent border border-cyan-200/20 placeholder-cyan-400 text-cyan-100 resize-none h-20"
      />
      <AlbumSelect
        albums={albums}
        value={albumId}
        onChange={setAlbumId}
        placeholder="Выберите альбом"
        className="w-full"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-md bg-gradient-to-r from-neonCyan to-neonBlue text-deepBlue font-semibold hover:scale-105 transition-all"
      >
        {loading ? "Загрузка..." : "Загрузить"}
      </button>
      {error && <div className="text-rose-400 text-sm">{error}</div>}
    </form>
  );
}
