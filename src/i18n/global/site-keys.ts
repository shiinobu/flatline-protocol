import { M01_ALL_SITE_KEYS } from "../m01/site-keys.js";
import { M02_ALL_SITE_KEYS } from "../m02/site-keys.js";
import { M03_ALL_SITE_KEYS } from "../m03/site-keys.js";
import { M06_ALL_SITE_KEYS } from "../m06/site-keys.js";

export const ALL_SITE_KEYS: readonly string[] = [
    ...M01_ALL_SITE_KEYS,
    ...M02_ALL_SITE_KEYS,
    ...M03_ALL_SITE_KEYS,
    ...M06_ALL_SITE_KEYS,
];
