'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Heart, MessageCircle, Images, Music, Smile, Zap, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const,
    },
  },
};

const features = [
  {
    icon: MessageCircle,
    title: '💌 Petits mots',
    description: 'Écrivez quelque chose à l\'autre, même une seule phrase.',
  },
  {
    icon: Images,
    title: '📸 Souvenirs',
    description: 'Partagez photos et vidéos de vos plus beaux moments.',
  },
  {
    icon: Smile,
    title: '😊 Humeurs',
    description: 'Dites comment vous vous sentez sans forcément écrire.',
  },
  {
    icon: Zap,
    title: '🔥 Streak',
    description: 'Construisez une habitude quotidienne ensemble.',
  },
  {
    icon: Heart,
    title: '💌 Ouvre quand...',
    description: 'Préparez des messages secrets à découvrir plus tard.',
  },
  {
    icon: Lock,
    title: '🔒 100% Privé',
    description: 'Vos souvenirs ne sont accessibles qu\'à vous deux.',
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white dark:from-slate-950 dark:via-pink-950/20 dark:to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-pink-600">À deux</div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => router.push('/auth/login')}>
              Se connecter
            </Button>
            <Button onClick={() => router.push('/auth/signup')}>
              Créer un compte
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Notre petit monde à nous. <span className="text-pink-600">❤️</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
            Un espace privé pour partager les petits moments qui deviennent les plus beaux souvenirs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" onClick={() => router.push('/auth/signup')}>
              Créer notre espace
            </Button>
            <Button size="lg" variant="secondary" onClick={() => router.push('/auth/login')}>
              Se connecter
            </Button>
          </div>

          {/* Illustration placeholder */}
          <motion.div
            className="relative h-80 bg-gradient-to-br from-pink-200/50 to-purple-200/50 dark:from-pink-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center overflow-hidden"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-slate-600 dark:text-slate-300">Votre espace privé vous attend</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              ✨ Tout ce que vous pouvez faire
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Un espace complet pour partager votre quotidien
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700"
                  variants={item}
                >
                  <Icon className="w-12 h-12 text-pink-600 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto bg-gradient-to-br from-pink-600 to-pink-700 rounded-3xl p-12 text-center text-white"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à commencer votre histoire ?
          </h2>
          <p className="text-pink-100 mb-8 text-lg">
            Créez votre espace privé et invitez votre personne préférée à rejoindre.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push('/auth/signup')}
            className="text-pink-600 hover:text-pink-700"
          >
            Commencer maintenant
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto text-center text-slate-600 dark:text-slate-400">
          <p>À deux © 2026. Un espace privé pour construire votre histoire ensemble. ❤️</p>
        </div>
      </footer>
    </div>
  );
}
