import i18n from 'i18next';
import resources from './locales/index.js';
import app from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  const { ru } = resources;
  const i18nextInstance = i18n.createInstance();
  i18nextInstance
    .init({
      lng: 'ru',
      debug: true,
      resources: {
        ru,
      },
    })
    .then(() => {
      app(i18nextInstance);
    })
    .catch((error) => {
      console.log(`Failed to initialize app: ${error}`);
    });
});
