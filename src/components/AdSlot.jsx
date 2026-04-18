import { useEffect, useRef } from 'react';

const AD_CLIENT = 'ca-pub-7542313413948660';

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

  return (
    <div className={`ad-slot my-6 text-center ${className}`} data-ad-placement={slot || 'unknown'}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot || 'TODO-slot-id'}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
