function loadInsightsVideo() {
  const videoSource = document.getElementById('insightsVideoSource');
  const videoElement = videoSource.parentElement;

  if (videoSource && videoElement) {
    videoSource.src = '/videos/insights-video.mp4';
    videoElement.load();
  }
}

document.addEventListener('DOMContentLoaded', loadInsightsVideo);
