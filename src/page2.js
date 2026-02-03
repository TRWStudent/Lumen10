import { supabase } from './supabase.js';
import { en } from './en.js';
import { de } from './de.js';

const translations = {
  en,
  de
};

let currentLanguage = localStorage.getItem('language') || 'en';

function getTranslation(key) {
  const keys = key.split('.');
  let value = translations[currentLanguage];

  for (const k of keys) {
    value = value[k];
    if (!value) return key;
  }

  return value;
}

function translatePage() {
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    const translation = getTranslation(key);

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else {
      element.innerHTML = translation;
    }
  });

  const languageSwitcher = document.getElementById('lang-toggle-btn');
  if (languageSwitcher) {
    languageSwitcher.textContent = currentLanguage === 'en' ? 'Deutsch' : 'English';
  }
}

function switchLanguage(newLanguage) {
  currentLanguage = newLanguage;
  localStorage.setItem('language', newLanguage);
  translatePage();
}

async function loadInsightsVideo() {
  try {
    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl('2026-01-30T13-17-39_cinematic_aerial_watermarked.mp4');

    const videoSource = document.getElementById('insightsVideoSource');
    const videoElement = videoSource.parentElement;

    if (data && data.publicUrl) {
      videoSource.src = data.publicUrl;
      videoElement.load();
    }
  } catch (error) {
    console.error('Error loading video:', error);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  translatePage();

  const languageSwitcher = document.getElementById('lang-toggle-btn');
  if (languageSwitcher) {
    languageSwitcher.addEventListener('click', function() {
      const newLanguage = currentLanguage === 'en' ? 'de' : 'en';
      switchLanguage(newLanguage);
    });
  }
});

loadInsightsVideo();
