import { M05_HS_KEY } from "./hospital.js";
import { M05_SITE_KEY } from "./site.js";

export const M05_ALL_SITE_KEYS: readonly string[] = [...Object.values(M05_SITE_KEY), ...Object.values(M05_HS_KEY)];
