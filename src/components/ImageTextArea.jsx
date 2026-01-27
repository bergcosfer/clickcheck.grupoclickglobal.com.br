import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ImagePlus, X, Loader2 } from 'lucide-react'

export default function ImageTextArea({ 
  value = '', 
  onChange, 
  images = [], 
  onImagesChange,
  placeholder = 'Digite aqui...',
  rows = 3,
  className = ''
}) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  // Converter imagem para base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Processar arquivo de imagem
  const processImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return null
    }
    
    // Checar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande! Máximo 5MB.')
      return null
    }
    
    const base64 = await imageToBase64(file)
    return {
      id: Date.now() + Math.random(),
      name: file.name,
      data: base64,
      size: file.size
    }
  }

  // Handler para paste (Ctrl+V)
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        setUploading(true)
        try {
          const file = item.getAsFile()
          const imageData = await processImage(file)
          if (imageData) {
            onImagesChange?.([...images, imageData])
          }
        } catch (err) {
          console.error('Erro ao processar imagem:', err)
        } finally {
          setUploading(false)
        }
        return
      }
    }
  }

  // Handler para drag & drop
  const handleDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return
    
    setUploading(true)
    try {
      const newImages = []
      for (const file of files) {
        const imageData = await processImage(file)
        if (imageData) newImages.push(imageData)
      }
      if (newImages.length > 0) {
        onImagesChange?.([...images, ...newImages])
      }
    } catch (err) {
      console.error('Erro ao processar imagens:', err)
    } finally {
      setUploading(false)
    }
  }

  // Handler para upload via botão
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    setUploading(true)
    try {
      const newImages = []
      for (const file of files) {
        const imageData = await processImage(file)
        if (imageData) newImages.push(imageData)
      }
      if (newImages.length > 0) {
        onImagesChange?.([...images, ...newImages])
      }
    } catch (err) {
      console.error('Erro ao processar imagens:', err)
    } finally {
      setUploading(false)
      e.target.value = '' // Reset input
    }
  }

  // Remover imagem
  const removeImage = (imageId) => {
    onImagesChange?.(images.filter(img => img.id !== imageId))
  }

  return (
    <div className="space-y-3">
      {/* Textarea com drop zone */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all",
          dragOver ? "border-emerald-500 bg-emerald-50" : "border-slate-200",
          className
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onPaste={handlePaste}
          rows={rows}
          className="w-full px-4 py-3 rounded-xl border-0 focus:ring-0 outline-none transition-all resize-none bg-transparent"
          placeholder={placeholder}
        />
        
        {/* Overlay de drag */}
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-50/80 rounded-xl">
            <div className="text-center">
              <ImagePlus className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-emerald-700 font-medium">Solte a imagem aqui</p>
            </div>
          </div>
        )}
        
        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        )}
      </div>
      
      {/* Dica e botão de upload */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>💡 Cole imagens (Ctrl+V) ou arraste para o campo</span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <ImagePlus className="w-4 h-4" />
          Adicionar imagem
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      
      {/* Preview das imagens */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.data}
                alt={img.name}
                className="w-24 h-24 object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
