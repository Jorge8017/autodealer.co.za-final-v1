import ReactGA from 'react-ga4';

ReactGA.initialize('G-RE5T93ZLEW');

export const trackPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

export const trackEvent = (category, action, label) => {
  ReactGA.event({
    category,
    action,
    label
  });
};