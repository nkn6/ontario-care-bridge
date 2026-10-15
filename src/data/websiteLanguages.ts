export const websiteLanguages = [
  { code: 'en', nativeName: 'English', englishName: 'English', translationAvailable: true, direction: 'ltr', locale: 'en-CA' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', translationAvailable: true, direction: 'ltr', locale: 'fr-CA' },
  { code: 'zh-Hans', nativeName: '中文', englishName: 'Chinese (Simplified)', translationAvailable: false, direction: 'ltr', locale: 'zh-CN' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', translationAvailable: false, direction: 'ltr', locale: 'pa-IN' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', translationAvailable: false, direction: 'rtl', locale: 'ar' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', translationAvailable: false, direction: 'ltr', locale: 'es' },
  { code: 'tl', nativeName: 'Tagalog', englishName: 'Filipino', translationAvailable: false, direction: 'ltr', locale: 'fil-PH' },
  { code: 'ur', nativeName: 'اُردُو', englishName: 'Urdu', translationAvailable: false, direction: 'rtl', locale: 'ur' },
  { code: 'fa', nativeName: 'فارسی', englishName: 'Persian (Farsi)', translationAvailable: false, direction: 'rtl', locale: 'fa' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', translationAvailable: false, direction: 'ltr', locale: 'ta-IN' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', translationAvailable: false, direction: 'ltr', locale: 'bn' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', translationAvailable: false, direction: 'ltr', locale: 'pt' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', translationAvailable: false, direction: 'ltr', locale: 'ko' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', translationAvailable: false, direction: 'ltr', locale: 'ru' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', translationAvailable: false, direction: 'ltr', locale: 'it' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', translationAvailable: false, direction: 'ltr', locale: 'te-IN' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', translationAvailable: false, direction: 'ltr', locale: 'gu-IN' },
  { code: 'pl', nativeName: 'Polski', englishName: 'Polish', translationAvailable: false, direction: 'ltr', locale: 'pl' },
  { code: 'uk', nativeName: 'Українська', englishName: 'Ukrainian', translationAvailable: false, direction: 'ltr', locale: 'uk' },
] as const;

export type WebsiteLanguageCode = (typeof websiteLanguages)[number]['code'];
