import ReactGA from 'react-ga4';

export const initGA = (measurementId: string) => {
    ReactGA.initialize(measurementId);
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};

export const trackTabClick = (tabName: string) => {
    ReactGA.event({
        category: 'TopContainer',
        action: 'select_tab',
        label: tabName,
    });
};
