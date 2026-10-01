import { Theme } from "@hotbunny/hackhub-content-sdk";

const sweepCss = (marker: string): number => {
    const stale = Array.from(document.head.querySelectorAll("style")).filter((style) =>
        style.textContent?.includes(marker),
    );
    stale.forEach((style) => style.remove());
    return stale.length;
};

export const injectCss = (css: string, marker: string): string => {
    sweepCss(marker);
    return Theme.injectCSS(css);
};

export const removeCss = (id: string | null, marker: string): number => {
    if (id !== null) Theme.removeCSS(id);
    return sweepCss(marker);
};
