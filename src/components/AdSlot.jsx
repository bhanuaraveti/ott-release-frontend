import { useEffect, useRef } from 'react';

const AD_CLIENT = 'ca-pub-7542313413948660';

const SLOT_IDS = {
  'home-mid': '5019691291',
  'movie-detail': '3706609624',
  'platform-top': '2058486034',
  'platform-bottom': '7669905363',
  'blog-post': '9357544092',
};

const SLOT_MIN_HEIGHTS = {
  'home-mid': 280,
  'movie-detail': 280,
  'platform-top': 250,
  'platform-bottom': 250,
  'blog-post': 280,
};

export default function AdSlot({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  style,
}) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    if (typeof window === 'undefined') return;
    const node = insRef.current;
    if (!node) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // AdSense script not yet loaded or blocked; harmless in dev/prerender.
    }
  }, []);

  const adSlotId = SLOT_IDS[slot];
  if (!adSlotId) {
    // Don't render a malformed <ins> — AdSense errors on missing/invalid slot.
    return null;
  }

  const minHeight = SLOT_MIN_HEIGHTS[slot] || 250;
  const insStyle = style || { display: 'block', minHeight: `${minHeight}px` };

  return (
    <div
      className={`ad-slot my-6 text-center ${className}`}
      data-ad-placement={slot}
      style={{ minHeight: `${minHeight}px` }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={insStyle}
        data-ad-client={AD_CLIENT}
        data-ad-slot={adSlotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
