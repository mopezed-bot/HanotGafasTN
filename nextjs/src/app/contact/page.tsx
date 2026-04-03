'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Facebook, 
  Instagram, 
  Twitter, 
  MessageCircle, 
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <section className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8"
          >
             <Sparkles className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Support & Contact . À votre écoute</span>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-8">
            Parlons de votre <br/>
            <span className="text-primary italic">Projet .</span>
          </h1>
          <p className="text-xl text-gray-500 font-bold max-w-2xl mx-auto leading-relaxed italic">
            "Une question sur HannaShop ? Notre équipe basée à Gafsa est là pour vous aider."
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Contact Info Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6">
               <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                 Coordonnées <span className="text-primary italic">Locales .</span>
               </h2>
               <div className="w-20 h-1.5 bg-primary rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               {[
                 { icon: MapPin, title: "Siège Social", content: "Avenue Habib Bourguiba, Moulares, Gafsa, Tunisie", color: "text-amber-600" },
                 { icon: Phone, title: "Téléphone", content: "+216 76 000 000\n+216 12 345 678", color: "text-emerald-600" },
                 { icon: Mail, title: "Email Support", content: "support@HannaShop.tn\ncontact@HannaShop.tn", color: "text-blue-600" },
                 { icon: Clock, title: "Heures d'Ouverture", content: "Lun - Sam: 09:00 - 19:00\nDimanche: Fermé", color: "text-primary" }
               ].map((item, i) => (
                 <div key={i} className="glass p-8 rounded-[2.5rem] border-primary/5 hover:border-primary/20 transition-all group">
                    <div className={cn("w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:scale-110 transition-transform", item.color)}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3">{item.title}</h3>
                    <p className="text-gray-500 font-bold text-sm whitespace-pre-line leading-relaxed italic">{item.content}</p>
                 </div>
               ))}
            </div>

            {/* Social Links */}
            <div className="pt-8 border-t border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Suivez-nous sur les réseaux</p>
               <div className="flex gap-4">
                  {[Facebook, Instagram, Twitter, MessageCircle].map((Icon, i) => (
                    <button key={i} className="w-14 h-14 glass rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                       <Icon className="w-6 h-6" />
                    </button>
                  ))}
               </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="relative rounded-[3rem] overflow-hidden h-72 glass border-primary/5 p-4">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13146.40263309564!2d8.261899144865187!3d34.20141675127027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12ef65e9d9e6e5e5%3A0x2f3a4c5a4c5a4c5a!2sMoular%C3%A8s!5e0!3m2!1sen!2stn!4v1234567890"
                width="100%"
                height="100%"
                className="rounded-[2.5rem] filter grayscale hover:grayscale-0 transition-all duration-700"
                style={{ border: 0 }}
                loading="lazy"
              ></iframe>
            </div>
          </motion.div>

          {/* Contact Form Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-10 md:p-16 rounded-[4rem] border-primary/10 shadow-2xl shadow-primary/5 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
             
             <div className="relative z-10">
               <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tighter">Envoyez un <span className="text-primary italic">Message .</span></h2>
               
               <AnimatePresence mode="wait">
                 {isSubmitted ? (
                   <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20"
                   >
                     <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                       <Check className="w-12 h-12 text-emerald-600" />
                     </div>
                     <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter">Message Envoyé !</h3>
                     <p className="text-gray-500 font-bold italic mb-10 leading-relaxed">
                       Dans une région riche en talent et en opportunités, nous avons créé un pont numérique sécurisé. Que vous soyez un artisan local, une boutique établie, ou un particulier souhaitant donner une seconde vie à ses objets, HannaShop est votre espace.
                     </p>
                     <Button onClick={() => setIsSubmitted(false)} variant="glass" className="rounded-2xl px-10">NOUVEAU MESSAGE</Button>
                   </motion.div>
                 ) : (
                   <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom Complet</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                            placeholder="Votre nom"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                            placeholder="votre@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Téléphone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                            placeholder="+216 -- --- ---"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sujet</label>
                          <select
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                            className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Choisir un sujet</option>
                            <option value="order">Ma Commande</option>
                            <option value="product">Question Produit</option>
                            <option value="listing">Vendre sur HannaShop</option>
                            <option value="other">Autre</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          rows={6}
                          className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-[2rem] p-6 text-sm font-bold focus:outline-none transition-all resize-none"
                          placeholder="Comment pouvons-nous vous aider ?"
                        ></textarea>
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full h-20 rounded-[2.5rem] text-xl group shadow-2xl shadow-primary/30 font-black italic tracking-wider"
                        >
                          ENVOYER LE MESSAGE
                          <Send className="ml-3 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                      </div>
                   </form>
                 )}
               </AnimatePresence>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
