import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import {
    M05_CAREERS_DOMAIN,
    M05_CHANGE_ID,
    M05_CHANGE_PATTERN,
    M05_GATEWAY_DOMAIN,
    M05_HOSPITAL_HOME_DOMAIN,
    M05_NEWS_DOMAIN,
    M05_PATIENT_DOMAIN,
    M05_POLICY_ID,
    M05_POLICY_PATTERN,
    M05_SEARCH_PATH,
    M05_STATUS_DOMAIN,
    M05_TEAM_PATH,
    M05_WEBMAIL_DOMAIN,
} from "../../../content/m05/network.js";
import { isM05TeamOpen } from "../../../context/m05/progress.js";
import { toolIcon } from "../../global/tool-page.js";
import { gateMissionPages, notFoundMetadata, requireHttps } from "../../global/page-guards.js";
import {
    renderCareers,
    renderChange,
    renderGateway,
    renderHome,
    renderNews,
    renderPatient,
    renderPolicy,
    renderStatus,
    renderTeam,
    renderWebmail,
} from "./render.js";
import { webmailVerdict } from "./webmail.js";

const HOSPITAL_ICON = toolIcon(
    '<rect width="64" height="64" rx="14" fill="#e7f2ef"/>' +
        '<path d="M10 54C8 28 24 10 56 8c2 30-14 48-42 46z" fill="#35c68c"/>' +
        '<path d="M16 48c8-16 18-24 34-32" fill="none" stroke="#06231b" stroke-width="4" stroke-linecap="round"/>',
);

interface PageSpec {
    readonly path: string;
    readonly title: string;
    readonly description: string;
    readonly seo?: boolean;
    readonly open?: () => boolean;
    readonly match?: (context: PageContext) => boolean;
    readonly render: () => string;
}

const page = (spec: PageSpec): DynamicWebsitePageDefinition => ({
    path: spec.path,
    seo: spec.seo,
    metadata: (context: PageContext): PageMetadata => {
        if (context.searchStr === undefined) {
            const insecure = requireHttps(context);
            if (insecure) return insecure;
        }

        if (spec.open && !spec.open()) return notFoundMetadata();
        if (spec.match && !spec.match(context)) return notFoundMetadata();

        return { title: spec.title, description: spec.description, html: spec.render() };
    },
});

const withSearchAlias = (spec: PageSpec): DynamicWebsitePageDefinition[] => [
    page(spec),
    page({ ...spec, path: M05_SEARCH_PATH, seo: false }),
];

@RegisterWebsite
export class PacificCareHomeWebsite extends Website {
    SiteName = "PacificCare Health";
    Host = M05_HOSPITAL_HOME_DOMAIN;
    Icon = HOSPITAL_ICON;

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m05", [
        ...withSearchAlias({
            path: "/",
            title: "PacificCare Health",
            description: "Regional hospital network, SEA.",
            seo: true,
            render: renderHome,
        }),
        page({
            path: M05_TEAM_PATH,
            title: "Information Technology — team",
            description: "IT team and staff remote access.",
            open: isM05TeamOpen,
            render: renderTeam,
        }),
        page({
            path: M05_CHANGE_PATTERN,
            title: `IT Change Record — ${M05_CHANGE_ID}`,
            description: "Staff access and role transition record.",
            open: isM05TeamOpen,
            match: (context) => context.params.id === M05_CHANGE_ID,
            render: renderChange,
        }),
        page({
            path: M05_POLICY_PATTERN,
            title: `${M05_POLICY_ID} — Remote Access and Legacy Accounts`,
            description: "Remote access policy for staff and legacy accounts.",
            open: isM05TeamOpen,
            match: (context) => context.params.id === M05_POLICY_ID,
            render: renderPolicy,
        }),
    ]);
}

@RegisterWebsite
export class PacificCareNewsWebsite extends Website {
    SiteName = "PacificCare Newsroom";
    Host = M05_NEWS_DOMAIN;
    Icon = HOSPITAL_ICON;

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m05", [
        ...withSearchAlias({
            path: "/",
            title: "PacificCare Newsroom",
            description: "Official statements from PacificCare Health.",
            seo: true,
            render: renderNews,
        }),
    ]);
}

@RegisterWebsite
export class PacificCareCareersWebsite extends Website {
    SiteName = "PacificCare Careers";
    Host = M05_CAREERS_DOMAIN;
    Icon = HOSPITAL_ICON;

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m05", [
        ...withSearchAlias({
            path: "/",
            title: "PacificCare Careers",
            description: "Open positions at PacificCare Health.",
            seo: true,
            render: renderCareers,
        }),
    ]);
}

@RegisterWebsite
export class PacificCareStatusWebsite extends Website {
    SiteName = "PacificCare Service Status";
    Host = M05_STATUS_DOMAIN;
    Icon = HOSPITAL_ICON;

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m05", [
        ...withSearchAlias({
            path: "/",
            title: "PacificCare Service Status",
            description: "Current status and incident history.",
            seo: true,
            render: renderStatus,
        }),
    ]);
}

@RegisterWebsite
export class PacificCarePatientWebsite extends Website {
    SiteName = "PacificCare Patient Portal";
    Host = M05_PATIENT_DOMAIN;
    Icon = HOSPITAL_ICON;

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m05", [
        ...withSearchAlias({
            path: "/",
            title: "PacificCare Patient Portal",
            description: "Appointments, results and billing.",
            seo: true,
            render: renderPatient,
        }),
    ]);
}

@RegisterWebsite
export class PacificCareWebmailWebsite extends Website {
    SiteName = "PacificCare Webmail";
    Host = M05_WEBMAIL_DOMAIN;
    Icon = HOSPITAL_ICON;

    Exports = {
        flatlineMailLogin: (user: string, password: string): string => webmailVerdict(user, password),
    };

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m05", [
        page({
            path: "/",
            title: "PacificCare Webmail",
            description: "Staff mailbox sign-in.",
            render: renderWebmail,
        }),
    ]);
}

@RegisterWebsite
export class PacificCareGatewayWebsite extends Website {
    SiteName = "PacificCare Vendor Gateway";
    Host = M05_GATEWAY_DOMAIN;
    Icon = HOSPITAL_ICON;

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m05", [
        page({
            path: "/",
            title: "PacificCare Vendor Remote Support Gateway",
            description: "Vendor remote support gateway.",
            render: renderGateway,
        }),
    ]);
}
