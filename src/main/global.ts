import "../websites/global/cipherdesk/index.js";
import "../websites/global/rdcdesk/index.js";
import { registerBreachText } from "../components/desktop-breach.js";
import { kitBreachText } from "../i18n/global/kit.js";
import "../applications/backtrace.js";
import "../commands/flatline.js";
import "../commands/open.js";
import "../commands/sysdiag.js";
import "../commands/sysrepair.js";

registerBreachText(kitBreachText);
