/**
 * Viewport utilities that account for the 30% zoom (0.7 scale) applied to the page
 */

const ZOOM_SCALE = 0.7

/**
 * Get the effective viewport width accounting for zoom
 * Since the page is zoomed to 70%, we need to divide by the scale factor
 */
export function getEffectiveViewportWidth(): number {
  return window.innerWidth / ZOOM_SCALE
}

/**
 * Get the effective viewport height accounting for zoom
 */
export function getEffectiveViewportHeight(): number {
  return window.innerHeight / ZOOM_SCALE
}

/**
 * Adjust a coordinate/value for the zoom scale
 */
export function adjustForZoom(value: number): number {
  return value / ZOOM_SCALE
}

/**
 * Get viewport dimensions as an object
 */
export function getEffectiveViewport(): { width: number; height: number } {
  return {
    width: getEffectiveViewportWidth(),
    height: getEffectiveViewportHeight(),
  }
}
