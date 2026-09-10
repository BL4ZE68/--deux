'use client';

import { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { MessageCircle, Image, Video, Mic, Smile, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, content: string, file?: File) => Promise<void> | void;
}

export function AddMemoryModal({ isOpen, onClose, onSubmit }: AddMemoryModalProps) {
  const [step, setStep] = useState<'type' | 'content'>('type');
  const [selectedType, setSelectedType] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const types = [
    { id: 'word', label: '💌 Petit mot', description: 'Écrivez quelque chose' },
    { id: 'photo', label: '📸 Photo', description: 'Partagez une photo' },
    { id: 'video', label: '🎥 Vidéo', description: 'Partagez une vidéo' },
    { id: 'audio', label: '🎙️ Audio', description: 'Enregistrez une note' },
    { id: 'mood', label: '😊 Humeur', description: 'Exprimez vos sentiments' },
  ];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setStep('content');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !file) return;
    setSubmitting(true);
    try {
      await onSubmit(selectedType, content, file);
      setStep('type');
      setSelectedType('');
      setContent('');
      setFile(undefined);
      setPreviewUrl(null);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Ajouter un souvenir
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {step === 'type' ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {types.map((type) => (
                    <motion.button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-pink-600 dark:hover:border-pink-600 transition-colors text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {type.label}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {type.description}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(selectedType === 'word' || selectedType === 'photo' || selectedType === 'video' || selectedType === 'audio') && (
                    <textarea
                      className="w-full h-28 px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder={selectedType === 'word' ? 'Écrivez votre message...' : 'Ajoutez une légende (optionnel)...'}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  )}

                  {(selectedType === 'photo' || selectedType === 'video' || selectedType === 'audio') && (
                    <div className="space-y-4">
                      {previewUrl && (
                        <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 max-h-48 flex items-center justify-center">
                          {selectedType === 'photo' && (
                            <img src={previewUrl} alt="Preview" className="max-h-48 object-contain" />
                          )}
                          {selectedType === 'video' && (
                            <video src={previewUrl} className="max-h-48" controls />
                          )}
                          {selectedType === 'audio' && (
                            <audio src={previewUrl} controls className="w-full p-4" />
                          )}
                          <button
                            onClick={() => {
                              setFile(undefined);
                              setPreviewUrl(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept={selectedType === 'photo' ? 'image/*' : selectedType === 'video' ? 'video/*' : 'audio/*'}
                        onChange={handleFileChange}
                        className="w-full rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm dark:border-slate-700"
                      />
                    </div>
                  )}

                  {selectedType === 'mood' && (
                    <div className="grid grid-cols-4 gap-3">
                      {['in-love', 'happy', 'peaceful', 'nostalgic', 'sad', 'tired', 'excited'].map(
                        (mood) => (
                          <button
                            key={mood}
                            onClick={() => setContent(mood)}
                            className={`py-3 rounded-lg text-2xl transition-all ${
                              content === mood
                                ? 'bg-pink-600 scale-110'
                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                          >
                            {mood === 'in-love' && '🥰'}
                            {mood === 'happy' && '😊'}
                            {mood === 'peaceful' && '😌'}
                            {mood === 'nostalgic' && '🥹'}
                            {mood === 'sad' && '😢'}
                            {mood === 'tired' && '😴'}
                            {mood === 'excited' && '🤩'}
                          </button>
                        )
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setStep('type');
                        setContent('');
                      }}
                    >
                      Retour
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => void handleSubmit()}
                      disabled={submitting || (!content.trim() && !file)}
                    >
                      {submitting ? 'Envoi…' : 'Partager ❤️'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
