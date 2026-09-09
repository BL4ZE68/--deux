'use client';

import { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { MessageCircle, Image, Video, Mic, Smile, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, content: string) => void;
}

export function AddMemoryModal({ isOpen, onClose, onSubmit }: AddMemoryModalProps) {
  const [step, setStep] = useState<'type' | 'content'>('type');
  const [selectedType, setSelectedType] = useState('');
  const [content, setContent] = useState('');

  const types = [
    { id: 'word', label: '💌 Petit mot', description: 'Écrivez quelque chose' },
    { id: 'photo', label: '📸 Photo', description: 'Partagez une photo' },
    { id: 'video', label: '🎥 Vidéo', description: 'Partagez une vidéo' },
    { id: 'audio', label: '🎙️ Audio', description: 'Enregistrez une note' },
    { id: 'mood', label: '😊 Humeur', description: 'Exprimez vos sentiments' },
  ];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    if (typeId !== 'photo' && typeId !== 'video' && typeId !== 'audio') {
      setStep('content');
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedType, content);
    setStep('type');
    setSelectedType('');
    setContent('');
    onClose();
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
                  {selectedType === 'word' && (
                    <textarea
                      autoFocus
                      className="w-full h-40 px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Écrivez votre message..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
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
                      onClick={handleSubmit}
                      disabled={!content.trim()}
                    >
                      Partager ❤️
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
