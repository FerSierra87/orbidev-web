const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const consentStorageKey = 'orbidev_analytics_consent';

export const isAnalyticsConfigured = Boolean(measurementId);

export const getStoredAnalyticsConsent = () => {
  if (!isAnalyticsConfigured) return null;

  const storedConsent = window.localStorage.getItem(consentStorageKey);
  return storedConsent === 'granted' || storedConsent === 'denied'
    ? storedConsent
    : null;
};

const initializeDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
};

export const loadGoogleAnalytics = () => {
  if (!isAnalyticsConfigured) return;

  initializeDataLayer();

  if (!document.querySelector(`script[data-orbidev-ga="${measurementId}"]`)) {
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.dataset.orbidevGa = measurementId;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false });
  }

  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
};

export const saveAnalyticsConsent = (consent) => {
  if (!isAnalyticsConfigured) return;

  window.localStorage.setItem(consentStorageKey, consent);

  if (consent === 'granted') {
    loadGoogleAnalytics();
    return;
  }

  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
};

export const trackPageView = (path, title) => {
  if (!isAnalyticsConfigured || getStoredAnalyticsConsent() !== 'granted') return;

  loadGoogleAnalytics();
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
};
