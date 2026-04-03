'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Send, 
  User as UserIcon, 
  Loader2, 
  ChevronLeft, 
  MoreVertical, 
  Phone, 
  Info,
  CheckCheck,
  Plus,
  Smile,
  Image as ImageIcon,
  MessageCircle,
  X
} from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  other_user: any;
  last_message: string;
  last_message_time: string;
  unread: number;
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const listingIdParam = searchParams.get('listingId');

  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationSearch, setConversationSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [activeListingId] = useState<string | null>(listingIdParam);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return router.push('/auth/login');
        setUser(currentUser);
        const loadedConversations = await fetchConversations(currentUser.id);

        if (targetUserId && targetUserId !== currentUser.id) {
          let directConversation = loadedConversations.find((conv) => conv.id === targetUserId);
          if (!directConversation) {
            const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
            if (error) throw error;
            directConversation = {
              id: targetUserId,
              other_user: profile,
              last_message: '',
              last_message_time: new Date().toISOString(),
              unread: 0,
            };
          }
          await handleSelectConversation(directConversation, currentUser.id);
        }
      } catch (err: any) {
        setConnectionError("Échec de la connexion au serveur de messagerie. Veuillez vérifier votre connexion.");
        console.error("Messaging init error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router, targetUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`messages-${user.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
      const msg = payload.new as any;
      if (msg.sender_id === user.id || msg.receiver_id === user.id) {
        await fetchConversations(user.id);
        if (selectedConversation && (msg.sender_id === selectedConversation.id || msg.receiver_id === selectedConversation.id)) {
          await fetchMessages(selectedConversation.id, user.id);
        }
      }
    }).subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setConnectionError("La connexion en temps réel a été interrompue.");
      }
    });
    return () => { supabase.removeChannel(channel); };
  }, [user, selectedConversation]);

  const fetchConversations = async (userId: string) => {
    const { data, error } = await supabase.from('messages').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order('created_at', { ascending: false });
    if (error) throw error;
    const convMap = new Map<string, Conversation>();
    data?.forEach((msg) => {
      const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (otherId && !convMap.has(otherId)) {
        convMap.set(otherId, {
          id: otherId,
          other_user: null,
          last_message: msg.content,
          last_message_time: msg.created_at,
          unread: msg.receiver_id === userId && !msg.is_read ? 1 : 0,
        });
      }
    });
    const result = await Promise.all(Array.from(convMap.values()).map(async (conv) => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', conv.id).single();
      return { ...conv, other_user: profile };
    }));
    setConversations(result);
    return result;
  };

  const fetchMessages = async (conversationId: string, userId: string) => {
    const { data, error } = await supabase.from('messages').select('*').or(`and(sender_id.eq.${userId},receiver_id.eq.${conversationId}),and(sender_id.eq.${conversationId},receiver_id.eq.${userId})`).order('created_at', { ascending: true });
    if (error) throw error;
    setMessages(data || []);
    await supabase.from('messages').update({ is_read: true }).eq('receiver_id', userId).eq('sender_id', conversationId);
  };

  const handleSelectConversation = async (conv: Conversation, userIdParam?: string) => {
    const activeUserId = userIdParam || user?.id;
    if (activeUserId) {
      setSelectedConversation(conv);
      await fetchMessages(conv.id, activeUserId);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedConversation.id,
      listing_id: activeListingId || null,
      content: newMessage,
    });
    if (!error) {
      setNewMessage('');
      await fetchMessages(selectedConversation.id, user.id);
      await fetchConversations(user.id);
    } else {
      setConnectionError("Impossible d'envoyer le message. Réessayez.");
    }
  };

  const filteredConversations = useMemo(() => {
    const q = conversationSearch.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(conv => (conv.other_user?.full_name || '').toLowerCase().includes(q) || (conv.other_user?.username || '').toLowerCase().includes(q));
  }, [conversations, conversationSearch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-gray-400 font-black italic tracking-widest text-[10px] uppercase">Raccordement au serveur...</p>
      </div>
    );
  }

  if (connectionError && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-10 h-10 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase mb-2">Erreur de Connexion</h2>
          <p className="text-gray-500 font-bold max-w-xs">{connectionError}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">RÉESSAYER</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto h-[750px] flex flex-col">
        
        {/* Page Header */}
        <div className="mb-8 flex items-end justify-between px-2">
            <div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">Messagerie <span className="text-primary italic">.</span></h1>
              <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-4">DISCUTEZ EN TEMPS RÉEL AVEC LA COMMUNAUTÉ</p>
            </div>
        </div>

        {/* Messaging Container */}
        <div className="flex-1 glass rounded-[3.5rem] border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden flex flex-col md:flex-row relative">
           
           {/* Sidebar: Conversations */}
           <div className={cn(
             "w-full md:w-[380px] border-r border-gray-100 flex flex-col bg-white/50",
             selectedConversation ? "hidden md:flex" : "flex"
           )}>
              <div className="p-6 border-b border-gray-100">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={conversationSearch}
                    onChange={(e) => setConversationSearch(e.target.value)}
                    placeholder="Chercher une discussion..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-xs font-bold focus:outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                 {filteredConversations.length === 0 ? (
                   <div className="py-20 text-center">
                      <MessageCircle className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Aucune discussion</p>
                   </div>
                 ) : (
                   filteredConversations.map((conv) => (
                     <button
                       key={conv.id}
                       onClick={() => handleSelectConversation(conv)}
                       className={cn(
                         "w-full p-4 flex items-center gap-4 rounded-3xl transition-all group",
                         selectedConversation?.id === conv.id 
                          ? "bg-primary text-white shadow-xl shadow-primary/20" 
                          : "hover:bg-white text-gray-500"
                       )}
                     >
                       <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-sm relative">
                         {conv.other_user?.avatar_url ? (
                           <img src={conv.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full bg-gray-100 flex items-center justify-center"><UserIcon className="w-6 h-6 text-gray-300" /></div>
                         )}
                         {conv.unread > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />}
                       </div>
                       <div className="flex-1 text-left overflow-hidden">
                         <div className="flex justify-between items-center mb-0.5">
                            <p className={cn("font-black tracking-tight line-clamp-1", selectedConversation?.id === conv.id ? "text-white" : "text-gray-900")}>
                               {conv.other_user?.full_name || 'Membre'}
                            </p>
                            <span className={cn("text-[8px] font-bold uppercase", selectedConversation?.id === conv.id ? "text-white/60" : "text-gray-400")}>
                               {new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                         <p className={cn("text-xs font-medium truncate", selectedConversation?.id === conv.id ? "text-white/80" : "text-gray-400")}>
                            {conv.last_message || 'Nouvelle discussion'}
                         </p>
                       </div>
                     </button>
                   ))
                 )}
              </div>
           </div>

           {/* Main Chat Area */}
           <div className={cn(
             "flex-1 flex flex-col bg-white/30 backdrop-blur-sm",
             !selectedConversation ? "hidden md:flex items-center justify-center text-center p-12" : "flex"
           )}>
              {!selectedConversation ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                   <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/10">
                      <MessageCircle className="w-10 h-10 text-primary/20" />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-gray-900 tracking-tighter italic">VOTRE MESSAGERIE</h3>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">SÉLECTIONNEZ UNE DISCUSSION POUR COMMENCER</p>
                   </div>
                </motion.div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                     <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                           {selectedConversation.other_user?.avatar_url ? (
                             <img src={selectedConversation.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full bg-gray-50 flex items-center justify-center"><UserIcon className="w-5 h-5 text-gray-200" /></div>
                           )}
                        </div>
                        <div>
                           <p className="font-black text-gray-900 tracking-tight leading-none mb-1">{selectedConversation.other_user?.full_name || 'Membre'}</p>
                           <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">En ligne</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button className="p-3 hover:bg-primary/5 rounded-2xl text-gray-400 hover:text-primary transition-all"><Phone className="w-4 h-4" /></button>
                        <button className="p-3 hover:bg-primary/5 rounded-2xl text-gray-400 hover:text-primary transition-all"><Info className="w-4 h-4" /></button>
                        <button className="p-3 hover:bg-primary/5 rounded-2xl text-gray-400 hover:text-primary transition-all"><MoreVertical className="w-4 h-4" /></button>
                     </div>
                  </div>

                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                    {messages.map((msg, i) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <motion.div 
                          key={msg.id}
                          initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.2 }}
                          className={cn("flex", isMe ? "justify-end" : "justify-start")}
                        >
                          <div className={cn(
                            "max-w-[80%] flex flex-col",
                            isMe ? "items-end" : "items-start"
                          )}>
                             <div className={cn(
                                "px-6 py-4 rounded-[1.8rem] shadow-sm",
                                isMe 
                                  ? "bg-primary text-white rounded-tr-sm" 
                                  : "glass text-gray-900 rounded-tl-sm border-gray-100"
                             )}>
                               <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                             </div>
                             <div className="mt-2 px-2 flex items-center gap-2">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMe && <CheckCheck className="w-3 h-3 text-primary" />}
                             </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Area */}
                  <div className="p-6 bg-white/50 border-t border-gray-100">
                     <div className="glass p-3 rounded-[2.5rem] border-primary/10 flex items-center gap-2">
                        <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"><Plus className="w-5 h-5" /></button>
                        <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"><ImageIcon className="w-5 h-5" /></button>
                        
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Écrire votre message..."
                          className="flex-1 bg-transparent border-none focus:ring-0 px-2 text-sm font-bold text-gray-900 placeholder:text-gray-300"
                        />

                        <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"><Smile className="w-5 h-5" /></button>
                        
                        <button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-100"
                        >
                          <Send className="w-5 h-5 translate-x-0.5" />
                        </button>
                     </div>
                  </div>
                </>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
