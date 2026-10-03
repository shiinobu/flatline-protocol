import { App, RegisterApp, type AppSize } from "@hotbunny/hackhub-content-sdk";

import BACKTRACE_HTML from "./backtrace.html";
import { BACKTRACE_FONT_CSS } from "./backtrace-fonts.js";

const BACKTRACE_DEFAULT_SIZE: AppSize = { width: 1220, height: 800 };
const BACKTRACE_MIN_SIZE: AppSize = { width: 1200, height: 780 };
const BACKTRACE_FONT_SLOT = "<style data-slot=\"fonts\"></style>";
const BACKTRACE_DOCUMENT = BACKTRACE_HTML.replace(BACKTRACE_FONT_SLOT, () => `<style>${BACKTRACE_FONT_CSS}</style>`);

@RegisterApp
export class BacktraceApp extends App {
    AppName = "backtrace";
    Title = "BACKTRACE";
    Icon = "./assets/global/backtrace-icon.png";
    HTML = BACKTRACE_DOCUMENT;
    DefaultSize = BACKTRACE_DEFAULT_SIZE;
    override MinSize = BACKTRACE_MIN_SIZE;
    override Unlocked = true;
    override Store = {
        title: "BACKTRACE",
        ratings: 0,
        description: "GHOSTWIRE's case file: mission reports, recovered evidence and the investigation caseboard.",
    };
}
