import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/analytics/googleAnalytics";

export default function GoogleAnalyticsTracker() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    trackPageView({
      pathname,
      search,
      hash,
      title: document.title,
    });
  }, [hash, pathname, search]);

  return null;
}
