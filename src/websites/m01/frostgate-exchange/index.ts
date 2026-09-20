import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import { M01_DECOY_DOMAIN } from "../../../content/m01.js";

import adminPage from "./admin.html";
import eduPageNa7710 from "./edu-na-7710.html";
import finPageApac2244 from "./fin-apac-2244.html";
import govPageApac9042 from "./gov-apac-9042.html";
import homePage from "./home.html";
import isPageEu3302 from "./isp-eu-3302.html";
import isPageNa7734 from "./isp-na-7734.html";
import logisticsPageApac2261 from "./logistics-apac-2261.html";
import logisticsPageEu1183 from "./logistics-eu-1183.html";
import retailPageApac3390 from "./retail-apac-3390.html";
import retailPageNa6650 from "./retail-na-6650.html";
import telecomPageEu5518 from "./telecom-eu-5518.html";
import vendorPortalPage from "./vendor-portal.html";

@RegisterWebsite
export class FrostgateExchangeWebsite extends Website {
    SiteName = "Frostgate Exchange";
    Host = M01_DECOY_DOMAIN;
    Icon = "";

    Pages: WebsitePageDefinition[] = [
        {
            path: "/",
            title: "Frostgate Exchange",
            html: homePage,
            description: "Verified network access, sold as-is.",
        },
        {
            path: "/telecom-eu-5518/",
            title: "Frostgate Exchange — TELECOM-EU-5518",
            html: telecomPageEu5518,
            description: "Telecom carrier, EU region.",
        },
        {
            path: "/retail-apac-3390/",
            title: "Frostgate Exchange — RETAIL-APAC-3390",
            html: retailPageApac3390,
            description: "Retail chain, APAC region.",
        },
        {
            path: "/isp-na-7734/",
            title: "Frostgate Exchange — ISP-NA-7734",
            html: isPageNa7734,
            description: "Regional ISP, NA region.",
        },
        {
            path: "/logistics-apac-2261/",
            title: "Frostgate Exchange — LOGISTICS-APAC-2261",
            html: logisticsPageApac2261,
            description: "Logistics company, APAC region.",
        },
        {
            path: "/isp-eu-3302/",
            title: "Frostgate Exchange — ISP-EU-3302",
            html: isPageEu3302,
            description: "No longer listed.",
        },
        {
            path: "/edu-na-7710/",
            title: "Frostgate Exchange — EDU-NA-7710",
            html: eduPageNa7710,
            description: "No longer listed.",
        },
        {
            path: "/fin-apac-2244/",
            title: "Frostgate Exchange — FIN-APAC-2244",
            html: finPageApac2244,
            description: "No longer listed.",
        },
        {
            path: "/retail-na-6650/",
            title: "Frostgate Exchange — RETAIL-NA-6650",
            html: retailPageNa6650,
            description: "No longer listed.",
        },
        {
            path: "/logistics-eu-1183/",
            title: "Frostgate Exchange — LOGISTICS-EU-1183",
            html: logisticsPageEu1183,
            description: "No longer listed.",
        },
        {
            path: "/gov-apac-9042/",
            title: "Frostgate Exchange — GOV-APAC-9042",
            html: govPageApac9042,
            description: "No longer listed.",
        },
        {
            path: "/admin/",
            title: "Frostgate Exchange — Admin",
            html: adminPage,
            description: "Restricted.",
        },
        {
            path: "/vendor-portal/",
            title: "Frostgate Exchange — Vendor Portal",
            html: vendorPortalPage,
            description: "Reseller access.",
        },
    ];
}
