'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import translations, { Language } from '@/lib/translations';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>('en');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('sk_lang') as Language;
            if (stored && translations[stored]) {
                setLangState(stored);
            }
        }
    }, []);

    const setLang = (l: Language) => {
        setLangState(l);
        if (typeof window !== 'undefined') {
            localStorage.setItem('sk_lang', l);
        }
    };

    const t = (key: string): string => {
        const dict = translations[lang] as any;
        return dict[key] || (translations['en'] as any)[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLang = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLang must be used within LanguageProvider');
    return ctx;
};
