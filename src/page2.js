function loadInsightsVideo() {
  const videoSource = document.getElementById('insightsVideoSource');
  const videoElement = videoSource.parentElement;

  if (videoSource && videoElement) {
    videoSource.src = 'https://ppgwkuxotjeadkwzulju.supabase.co/storage/v1/object/public/videos/2026-01-30T13-17-39_cinematic_aerial_watermarked.mp4';
    videoElement.load();
  }
}

document.addEventListener('DOMContentLoaded', loadInsightsVideo);
