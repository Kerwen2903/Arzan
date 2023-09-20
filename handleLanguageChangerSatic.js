const handleLanguageChangerStatic = () => {
  const storedLanguage = getCookie('language') || 'tk';

  switch (storedLanguage) {
    case 'ru':
      setContent(ru);
      break;
    case 'en':
      setContent(en);
      break;
    default:
      setContent(tk);
  }
};
