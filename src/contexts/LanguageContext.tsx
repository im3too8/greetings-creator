
import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { translations } from "@/utils/translations";

type Language = "en" | "ar";
type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Try to get the saved language preference or default to English
  const getSavedLanguage = (): Language => {
    try {
      const savedLanguage = localStorage.getItem("language") as Language;
      return savedLanguage || "en";
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      return "en";
    }
  };
  
  const [language, setLanguageState] = useState<Language>(getSavedLanguage());
  
  // Set the document direction based on language
  const dir = language === "ar" ? "rtl" : "ltr" as const; // Use 'as const' to narrow the type
  
  // Update document attributes when language changes
  const setLanguage = useCallback((lang: Language) => {
    try {
      setLanguageState(lang);
      localStorage.setItem("language", lang);
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    } catch (e) {
      console.error("Error setting language:", e);
    }
  }, []);
  
  // Set initial document attributes
  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", dir);
  }, [language, dir]);
  
  // Translation function
  const t = useCallback((key: TranslationKey): string => {
    if (!translations[language] || !translations[language][key]) {
      // Fallback to English if the key doesn't exist in the current language
      console.warn(`Translation key "${key}" not found in ${language}, falling back to English`);
      return translations.en[key] || key;
    }
    return translations[language][key];
  }, [language]);
  
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    dir
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
