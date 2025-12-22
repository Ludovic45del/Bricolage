import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';

interface EmailEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientEmail: string;
    initialSubject: string;
    initialBody: string;
    onSend: (subject: string, body: string) => void;
}

export const EmailEditorModal: React.FC<EmailEditorModalProps> = ({
    isOpen,
    onClose,
    recipientEmail,
    initialSubject,
    initialBody,
    onSend
}) => {
    const [subject, setSubject] = useState(initialSubject);
    const [body, setBody] = useState(initialBody);
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    useEffect(() => {
        if (isOpen) {
            setSubject(initialSubject);
            setBody(initialBody);
            setStatus('idle');
        }
    }, [isOpen, initialSubject, initialBody]);

    const handleSend = async () => {
        setStatus('sending');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('sent');
        // Simulated success delay before closing
        setTimeout(() => {
            onSend(subject, body);
            onClose();
        }, 1000);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Éditeur de Message"
            size="2xl"
        >
            <div className="space-y-8">
                <div className="flex items-center space-x-4 p-5 glass-card bg-white/5 border-white/10">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-xl">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Destinataire</p>
                        <p className="text-sm font-bold text-white tracking-tight">{recipientEmail}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Sujet du Message</label>
                        <input
                            type="text"
                            className="block w-full rounded-2xl glass-input p-4 text-sm transition-all focus:ring-0"
                            placeholder="Entrez le sujet..."
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            disabled={status !== 'idle'}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contenu</label>
                        <textarea
                            className="block w-full rounded-2xl glass-input p-4 text-sm transition-all focus:ring-0 min-h-[300px] resize-none custom-scrollbar"
                            placeholder="Rédigez votre message ici..."
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            disabled={status !== 'idle'}
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={status === 'sending'}
                        className="text-sm font-bold text-gray-500 hover:text-white transition-colors"
                    >
                        Annuler
                    </button>
                    <Button
                        variant="primary"
                        onClick={handleSend}
                        disabled={status !== 'idle'}
                        className="px-10 py-5 rounded-[24px] shadow-[0_15px_40px_-5px_rgba(139,92,246,0.3)] min-w-[180px] transition-all hover:scale-105 active:scale-95"
                    >
                        {status === 'idle' && (
                            <>
                                <Send className="w-4 h-4 mr-2" /> Envoyer le Message
                            </>
                        )}
                        {status === 'sending' && (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi en cours...
                            </>
                        )}
                        {status === 'sent' && (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Message Envoyé !
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
