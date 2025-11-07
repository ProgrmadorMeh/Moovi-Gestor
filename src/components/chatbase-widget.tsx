// src/components/chatbase-widget.tsx
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    chatbase: any;
  }
}

export function ChatbaseWidget() {
  const [isIdentified, setIsIdentified] = useState(false);

  useEffect(() => {
    const identifyUser = async () => {
      try {
        const response = await fetch('/api/chatbase');
        if (response.ok) {
          const { token } = await response.json();
          if (token && window.chatbase) {
            window.chatbase('identify', { token });
            setIsIdentified(true);
          }
        }
      } catch (error) {
        console.error('Failed to identify user with Chatbase:', error);
      }
    };
    
    // We only try to identify if the chatbase script is loaded and we haven't identified the user yet.
    if (window.chatbase && typeof window.chatbase === 'function' && !isIdentified) {
      identifyUser();
    }
  }, [isIdentified]); // Depend on isIdentified to prevent re-running after success

  return (
    <Script id="chatbase-loader" strategy="afterInteractive">
      {`
        (function(){
          if (!window.chatbase || window.chatbase("getState") !== "initialized") {
            window.chatbase = function(...args) {
              if (!window.chatbase.q) {
                window.chatbase.q = [];
              }
              window.chatbase.q.push(args);
            };
            window.chatbase = new Proxy(window.chatbase, {
              get(target, prop) {
                if (prop === "q") {
                  return target.q;
                }
                return (...args) => target(prop, ...args);
              }
            });
          }
          const onLoad = function() {
            const script = document.createElement("script");
            script.src = "https://www.chatbase.co/embed.min.js";
            script.id = "ZLg4A0IP5_x4ekRalVuh1";
            script.defer = true;
            script.domain = "www.chatbase.co";
            document.body.appendChild(script);
          };
          if (document.readyState === "complete") {
            onLoad();
          } else {
            window.addEventListener("load", onLoad);
          }
        })();
      `}
    </Script>
  );
}
