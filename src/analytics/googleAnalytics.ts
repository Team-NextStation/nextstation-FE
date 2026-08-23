interface PageViewInput {
  pathname: string;
  search: string;
  hash: string;
  title: string;
}

export function createPageViewEvent({
  pathname,
  search,
  hash,
  title,
}: PageViewInput) {
  return {
    page_location: `${pathname}${search}${hash}`,
    page_title: title,
  };
}

export function trackPageView(pageView: PageViewInput) {
  window.gtag?.("event", "page_view", createPageViewEvent(pageView));
}
