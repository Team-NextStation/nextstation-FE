import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import copyToClipboard from "./clipboard";

export const isShareSupported = () =>
  Capacitor.isNativePlatform() || typeof navigator.share === "function";

export const share = async (
  data: ShareData,
): Promise<"shared" | "copiedToClipboard" | "cancelled" | "failed"> => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.message === "Share canceled") {
        return "cancelled";
      }
      return "failed";
    }
  }

  if (isShareSupported()) {
    try {
      await navigator.share(data);
      return "shared";
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        return "cancelled";
      }
      return "failed";
    }
  }

  const clipboardText = data.text ?? data.url;

  if (clipboardText) {
    const result = await copyToClipboard(clipboardText);

    if (result) {
      return "copiedToClipboard";
    }
  }

  return "failed";
};

export default share;
