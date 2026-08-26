import { getBaseUrl } from './client';

export const mediaApi = {
  /**
   * Generates the direct URL for a dynamic SVG avatar.
   *
   * @param {string} seed - Seed string (e.g. username, email, ID)
   * @param {Object} options
   * @param {number} [options.size=128] - Dimensions in pixels
   * @param {boolean} [options.rounded=true] - Circle (true) or Squircle (false)
   * @returns {string} Fully-qualified SVG URL
   */
  getAvatarUrl: (seed = 'user', { size = 128, rounded = true } = {}) => {
    const cleanSeed = encodeURIComponent(String(seed || 'user').trim());
    const params = new URLSearchParams();
    if (size && size !== 128) params.set('size', String(size));
    if (rounded === false || rounded === 'false') params.set('rounded', 'false');
    const qs = params.toString();
    return `${getBaseUrl()}/avatars/${cleanSeed}${qs ? `?${qs}` : ''}`;
  },

  /**
   * Fetches the raw SVG string for an avatar.
   */
  getAvatarSvg: async (seed, options = {}) => {
    const url = mediaApi.getAvatarUrl(seed, options);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load avatar SVG (HTTP ${res.status})`);
    return res.text();
  },

  /**
   * Generates the direct URL for a dynamic landscape/cover thumbnail SVG.
   *
   * @param {string} seed - Seed string (e.g. post-slug, topic)
   * @param {Object} options
   * @param {number} [options.width=600] - Width in px
   * @param {number} [options.height=400] - Height in px
   * @param {string} [options.text=''] - Custom title override
   * @param {string} [options.description=''] - Subtitle / description line override
   * @returns {string} Fully-qualified SVG URL
   */
  getThumbnailUrl: (seed = 'post', { width = 600, height = 400, text = '', description = '', desc = '' } = {}) => {
    const cleanSeed = encodeURIComponent(String(seed || 'post').trim());
    const params = new URLSearchParams();
    if (width && width !== 600) params.set('width', String(width));
    if (height && height !== 400) params.set('height', String(height));
    if (text && text.trim()) params.set('text', text.trim());
    const finalDesc = (description || desc || '').trim();
    if (finalDesc) params.set('description', finalDesc);
    const qs = params.toString();
    return `${getBaseUrl()}/thumbnails/${cleanSeed}${qs ? `?${qs}` : ''}`;
  },

  /**
   * Fetches the raw SVG string for a thumbnail.
   */
  getThumbnailSvg: async (seed, options = {}) => {
    const url = mediaApi.getThumbnailUrl(seed, options);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load thumbnail SVG (HTTP ${res.status})`);
    return res.text();
  },

  /**
   * Helper to trigger a browser file download of the SVG
   */
  downloadSvg: async (url, filename = 'image.svg') => {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  },
};
