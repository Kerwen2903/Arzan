const NextI18Next = require('next-i18next').default;
const path = require('path');

module.exports = new NextI18Next({
  defaultLanguage: 'tk',
  otherLanguages: ['ru', 'en'],
  localePath: path.resolve('./static/locales'),
});
