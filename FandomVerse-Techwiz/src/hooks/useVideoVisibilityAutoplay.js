import { useEffect } from 'react';

/**
 * Tự động play video nền khi nó cuộn vào vùng nhìn thấy, và tự động pause khi
 * cuộn ra khỏi màn hình hoặc khi rời trang (unmount) — tránh video chạy ngầm
 * tốn tài nguyên, giúp trang mượt hơn.
 *
 * @param {React.RefObject<HTMLVideoElement>} videoRef
 * @param {*} remountKey - truyền vào giá trị đổi mỗi khi video bị remount
 *   (vd: src của video khi dùng kèm prop `key`) để hook gắn lại observer đúng node mới.
 */
export function useVideoVisibilityAutoplay(videoRef, remountKey) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const applyVisibility = (isIntersecting) => {
      if (isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    // Áp dụng trạng thái đúng ngay lập tức thay vì chờ callback bất đồng bộ đầu
    // tiên của IntersectionObserver — quan trọng vì React StrictMode (dev) chạy
    // effect này 2 lần (mount → cleanup → mount), và cleanup sẽ pause video.
    const rect = video.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    applyVisibility(rect.bottom > 0 && rect.top < viewportHeight);

    const observer = new IntersectionObserver(
      ([entry]) => applyVisibility(entry.isIntersecting),
      { threshold: 0.15 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef, remountKey]);
}
