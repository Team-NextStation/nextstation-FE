/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface Window {
  dataLayer: IArguments[];
  gtag?: (...args: unknown[]) => void;
}
