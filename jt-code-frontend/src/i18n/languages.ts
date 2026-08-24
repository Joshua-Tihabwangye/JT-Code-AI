export interface LanguageOption {
  code: string;
  englishName: string;
  nativeName: string;
  rtl?: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', englishName: 'English', nativeName: 'English' },
  { code: 'zh', englishName: 'Chinese (Mandarin)', nativeName: '中文' },
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'es', englishName: 'Spanish', nativeName: 'Español' },
  { code: 'fr', englishName: 'French', nativeName: 'Français' },
  { code: 'ar', englishName: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'bn', englishName: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pt', englishName: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', englishName: 'Russian', nativeName: 'Русский' },
  { code: 'ur', englishName: 'Urdu', nativeName: 'اردو', rtl: true },
  { code: 'id', englishName: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'de', englishName: 'German', nativeName: 'Deutsch' },
  { code: 'ja', englishName: 'Japanese', nativeName: '日本語' },
  { code: 'sw', englishName: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'mr', englishName: 'Marathi', nativeName: 'मराठी' },
  { code: 'te', englishName: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'tr', englishName: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ta', englishName: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ko', englishName: 'Korean', nativeName: '한국어' },
  { code: 'it', englishName: 'Italian', nativeName: 'Italiano' },
];

export const RTL_LANGUAGES = LANGUAGES.filter((l) => l.rtl).map((l) => l.code);

export function getLanguage(code: string): LanguageOption {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]!;
}

export function isRtl(code: string): boolean {
  return RTL_LANGUAGES.includes(code);
}
