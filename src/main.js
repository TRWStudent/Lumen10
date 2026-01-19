import { supabase } from './supabase.js';

const VIDEO_FILE_NAME = 'Lumenvideo.mp4';

async function loadVideoFromSupabase() {
  try {
    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(VIDEO_FILE_NAME);

    const videoSource = document.getElementById('heroVideoSource');
    const videoElement = videoSource.parentElement;

    if (data && data.publicUrl) {
      videoSource.src = data.publicUrl;
      videoElement.load();
    }
  } catch (error) {
    console.error('Error loading video:', error);
  }
}

loadVideoFromSupabase();
