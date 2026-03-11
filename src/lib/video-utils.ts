// Extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Extract Facebook video/reel embed URL
export function extractFacebookEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
  }
  return null;
}

// Get YouTube thumbnail from video ID
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Determine embed type and return embed URL
export function getVideoEmbedUrl(video: { video_url?: string | null; external_url?: string | null; video_type?: string | null }): { type: 'youtube' | 'facebook' | 'vimeo' | 'upload' | 'none'; embedUrl: string | null; thumbnailUrl?: string } {
  const url = video.external_url || video.video_url || '';

  const ytId = extractYouTubeId(url);
  if (ytId) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytId}?rel=0`, thumbnailUrl: getYouTubeThumbnail(ytId) };
  }

  const fbEmbed = extractFacebookEmbedUrl(url);
  if (fbEmbed) {
    return { type: 'facebook', embedUrl: fbEmbed };
  }

  if (url.includes('vimeo.com')) {
    const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    if (vimeoId) return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoId}` };
  }

  if (video.video_url) {
    return { type: 'upload', embedUrl: video.video_url };
  }

  return { type: 'none', embedUrl: null };
}
