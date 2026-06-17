import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'te' | 'ta' | 'hi';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.menu': 'Menu',
    'nav.orders': 'My Orders',
    'nav.profile': 'Profile',
    'nav.cart': 'Cart',
    'home.hero': 'Authentic Regional Flavors',
    'home.subtitle': 'Fresh, traditional recipes delivered to your door',
    'home.recommended': 'Recommended For You',
    'home.specials': "Today's Specials",
    'home.categories': 'Food Categories',
    'food.addCart': 'Add to Cart',
    'food.byWeight': 'Order by Weight',
    'food.byPersons': 'Order by Persons',
    'food.veg': 'Veg',
    'food.nonVeg': 'Non-Veg',
    'cart.empty': 'Your cart is empty',
    'cart.checkout': 'Proceed to Checkout',
    'order.track': 'Track Order',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
  },
  te: {
    'nav.home': 'హోమ్',
    'nav.menu': 'మెను',
    'nav.orders': 'నా ఆర్డర్లు',
    'nav.profile': 'ప్రొఫైల్',
    'nav.cart': 'కార్ట్',
    'home.hero': 'ప్రాంతీయ సంప్రదాయ వంటకాలు',
    'home.subtitle': 'తాజా, సంప్రదాయ వంటకాలు మీ ద్వారం వరకు',
    'home.recommended': 'మీకు సిఫార్సు చేయబడినవి',
    'home.specials': 'ఈరోజు స్పెషల్స్',
    'home.categories': 'ఆహార వర్గాలు',
    'food.addCart': 'కార్ట్‌కు జోడించు',
    'food.byWeight': 'బరువు ద్వారా ఆర్డర్',
    'food.byPersons': 'వ్యక్తుల ద్వారా ఆర్డర్',
    'food.veg': 'శాఖాహారం',
    'food.nonVeg': 'మాంసాహారం',
    'cart.empty': 'మీ కార్ట్ ఖాళీగా ఉంది',
    'cart.checkout': 'చెకౌట్‌కు వెళ్ళు',
    'order.track': 'ఆర్డర్ ట్రాక్',
    'auth.login': 'లాగిన్',
    'auth.register': 'నమోదు',
    'auth.logout': 'లాగ్అవుట్',
  },
  ta: {
    'nav.home': 'முகப்பு',
    'nav.menu': 'மெனு',
    'nav.orders': 'என் ஆர்டர்கள்',
    'nav.profile': 'சுயவிவரம்',
    'nav.cart': 'கார்ட்',
    'home.hero': 'பூர்வீக பிராந்திய உணவுகள்',
    'home.subtitle': 'புதிய, பாரம்பரிய சமையல் உங்கள் வீட்டுக்கு',
    'home.recommended': 'உங்களுக்கான பரிந்துரைகள்',
    'home.specials': 'இன்றைய சிறப்புகள்',
    'home.categories': 'உணவு வகைகள்',
    'food.addCart': 'கார்டில் சேர்',
    'food.byWeight': 'எடை அடிப்படையில்',
    'food.byPersons': 'நபர்கள் அடிப்படையில்',
    'food.veg': 'சைவம்',
    'food.nonVeg': 'அசைவம்',
    'cart.empty': 'உங்கள் கார்ட் காலியாக உள்ளது',
    'cart.checkout': 'செக்அவுட்',
    'order.track': 'ஆர்டர் கண்காணிப்பு',
    'auth.login': 'உள்நுழை',
    'auth.register': 'பதிவு',
    'auth.logout': 'வெளியேறு',
  },
  hi: {
    'nav.home': 'होम',
    'nav.menu': 'मेनू',
    'nav.orders': 'मेरे ऑर्डर',
    'nav.profile': 'प्रोफाइल',
    'nav.cart': 'कार्ट',
    'home.hero': 'प्रामाणिक क्षेत्रीय स्वाद',
    'home.subtitle': 'ताजा, पारंपरिक रेसिपी आपके दरवाजे तक',
    'home.recommended': 'आपके लिए अनुशंसित',
    'home.specials': 'आज के विशेष',
    'home.categories': 'खाद्य श्रेणियाँ',
    'food.addCart': 'कार्ट में जोड़ें',
    'food.byWeight': 'वजन से ऑर्डर',
    'food.byPersons': 'व्यक्तियों से ऑर्डर',
    'food.veg': 'शाकाहारी',
    'food.nonVeg': 'मांसाहारी',
    'cart.empty': 'आपका कार्ट खाली है',
    'cart.checkout': 'चेकआउट',
    'order.track': 'ऑर्डर ट्रैक',
    'auth.login': 'लॉगिन',
    'auth.register': 'रजिस्टर',
    'auth.logout': 'लॉगआउट',
  },
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('th_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('th_lang') as Language) || 'en';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('th_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('th_lang', lang);
  };

  const t = (key: string) => translations[language][key] || translations.en[key] || key;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
