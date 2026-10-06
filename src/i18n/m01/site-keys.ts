import { M01_BW_KEY } from "./blackwire.js";
import { M01_ESCROW_KEY } from "./escrow.js";
import { M01_FG_KEY } from "./frostgate.js";
import { M01_LV_KEY } from "./ledgervault.js";
import { M01_LISTING_KEY } from "./listing-template.js";
import { M01_OA_KEY } from "./obsidian.js";
import { M01_SITE_KEY } from "./site-shared.js";

export const M01_ALL_SITE_KEYS: readonly string[] = [
    ...Object.values(M01_SITE_KEY),
    ...Object.values(M01_BW_KEY),
    ...Object.values(M01_LISTING_KEY),
    ...Object.values(M01_FG_KEY),
    ...Object.values(M01_OA_KEY),
    ...Object.values(M01_ESCROW_KEY),
    ...Object.values(M01_LV_KEY),
];
