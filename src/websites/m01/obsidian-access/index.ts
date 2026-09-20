import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import { M01_OBSIDIAN_DOMAIN } from "../../../content/m01.js";

import adminPage from "./admin.html";
import eduPageApac6641 from "./edu-apac-6641.html";
import eduPageEu9915 from "./edu-eu-9915.html";
import finPageNa3387 from "./fin-na-3387.html";
import govPageApac1120 from "./gov-apac-1120.html";
import govPageEu7793 from "./gov-eu-7793.html";
import homePage from "./home.html";
import ispPageApac4420 from "./isp-apac-4420.html";
import ispPageNa2207 from "./isp-na-2207.html";
import logPageNa8802 from "./log-na-8802.html";
import retailPageEu4471 from "./retail-eu-4471.html";
import retailPageNa5528 from "./retail-na-5528.html";
import vendorPortalPage from "./vendor-portal.html";

@RegisterWebsite
export class ObsidianAccessWebsite extends Website {
    SiteName = "Obsidian Access";
    Host = M01_OBSIDIAN_DOMAIN;
    Icon = "";

    Pages: WebsitePageDefinition[] = [
        { path: "/", title: "Obsidian Access", html: homePage, description: "Verified network access, mirror listings." },
        {
            path: "/isp-na-2207/",
            title: "Obsidian Access — ISP-NA-2207",
            html: ispPageNa2207,
            description: "Regional ISP, NA region.",
        },
        {
            path: "/edu-apac-6641/",
            title: "Obsidian Access — EDU-APAC-6641",
            html: eduPageApac6641,
            description: "University network, APAC region.",
        },
        {
            path: "/retail-na-5528/",
            title: "Obsidian Access — RETAIL-NA-5528",
            html: retailPageNa5528,
            description: "Retail chain, NA region.",
        },
        {
            path: "/gov-eu-7793/",
            title: "Obsidian Access — GOV-EU-7793",
            html: govPageEu7793,
            description: "Government network, EU region.",
        },
        {
            path: "/retail-eu-4471/",
            title: "Obsidian Access — RETAIL-EU-4471",
            html: retailPageEu4471,
            description: "No longer listed.",
        },
        {
            path: "/gov-apac-1120/",
            title: "Obsidian Access — GOV-APAC-1120",
            html: govPageApac1120,
            description: "No longer listed.",
        },
        {
            path: "/log-na-8802/",
            title: "Obsidian Access — LOG-NA-8802",
            html: logPageNa8802,
            description: "No longer listed.",
        },
        {
            path: "/fin-na-3387/",
            title: "Obsidian Access — FIN-NA-3387",
            html: finPageNa3387,
            description: "No longer listed.",
        },
        {
            path: "/edu-eu-9915/",
            title: "Obsidian Access — EDU-EU-9915",
            html: eduPageEu9915,
            description: "No longer listed.",
        },
        {
            path: "/isp-apac-4420/",
            title: "Obsidian Access — ISP-APAC-4420",
            html: ispPageApac4420,
            description: "No longer listed.",
        },
        {
            path: "/admin/",
            title: "Obsidian Access — Admin",
            html: adminPage,
            description: "Restricted.",
        },
        {
            path: "/vendor-portal/",
            title: "Obsidian Access — Vendor Portal",
            html: vendorPortalPage,
            description: "Reseller access.",
        },
    ];
}
