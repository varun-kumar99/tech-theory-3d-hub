import React, { useEffect } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  layoutKey?: string;
  style?: React.CSSProperties;
  className?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ 
  slot, 
  format = 'auto', 
  layoutKey, 
  style = {}, 
  className = "" 
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  // If we are in development (localhost), we might want to show a placeholder
  // because AdSense doesn't work on localhost without specific setup.
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return (
    <div className={`ad-container w-full overflow-hidden ${className}`}>
      {isDev && (
        <div className="bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center p-4 mb-4 text-xs text-gray-500 uppercase tracking-widest min-h-[100px]">
          AdSpace (Slot: {slot})
        </div>
      )}
      <ins className="adsbygoogle"
           style={{ display: 'block', ...style }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual Publisher ID
           data-ad-slot={slot}
           data-ad-format={format}
           data-full-width-responsive="true"
           {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
      />
    </div>
  );
};

export default AdUnit;
