import { App, RegisterApp, type AppSize } from "@hotbunny/hackhub-content-sdk";

import BACKTRACE_HTML from "./backtrace.html";

const BACKTRACE_DEFAULT_SIZE: AppSize = { width: 1220, height: 800 };
const BACKTRACE_MIN_SIZE: AppSize = { width: 1200, height: 780 };

@RegisterApp
export class BacktraceApp extends App {
    AppName = "backtrace";
    Title = "BACKTRACE";
    Icon = "";
    HTML = BACKTRACE_HTML;
    DefaultSize = BACKTRACE_DEFAULT_SIZE;
    override MinSize = BACKTRACE_MIN_SIZE;
    override Unlocked = true;
    override Store = {
        title: "BACKTRACE",
        ratings: 0,
        description: "GHOSTWIRE's case file: mission reports, recovered evidence and the investigation caseboard.",
    };
}
