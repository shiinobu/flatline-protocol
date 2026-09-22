import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M01_LISTING_KEY = {
    WINNER_DESCRIPTION: "M01.LISTING.WINNER.DESCRIPTION",
    WINNER_NOTE1: "M01.LISTING.WINNER.NOTE1",
    WINNER_NOTE2: "M01.LISTING.WINNER.NOTE2",
    WINNER_ACCESS_TYPE: "M01.LISTING.WINNER.ACCESS_TYPE",
    WINNER_HINT: "M01.LISTING.WINNER.HINT",
    WINNER_TITLE: "M01.LISTING.WINNER.TITLE",

    DECOY_DEFAULT_DESCRIPTION: "M01.LISTING.DECOY.DEFAULT_DESCRIPTION",
    DECOY_NOTE_SECTOR_REGION: "M01.LISTING.DECOY.NOTE_SECTOR_REGION",
    DECOY_NOTE_CONFIRMED: "M01.LISTING.DECOY.NOTE_CONFIRMED",
    DECOY_ACCESS_TYPE: "M01.LISTING.DECOY.ACCESS_TYPE",
    DECOY_TITLE: "M01.LISTING.DECOY.TITLE",

    CATEGORY_DESC_RETAIL: "M01.LISTING.CATEGORY_DESC.RETAIL",
    CATEGORY_DESC_ISP: "M01.LISTING.CATEGORY_DESC.ISP",
    CATEGORY_DESC_LOGISTICS: "M01.LISTING.CATEGORY_DESC.LOGISTICS",
    CATEGORY_DESC_EDU: "M01.LISTING.CATEGORY_DESC.EDU",
    CATEGORY_DESC_GOV: "M01.LISTING.CATEGORY_DESC.GOV",
    CATEGORY_DESC_FIN: "M01.LISTING.CATEGORY_DESC.FIN",
    CATEGORY_DESC_MED: "M01.LISTING.CATEGORY_DESC.MED",
    CATEGORY_DESC_TELECOM: "M01.LISTING.CATEGORY_DESC.TELECOM",
} as const;

Localization.registerAll({
    en: {
        [M01_LISTING_KEY.WINNER_DESCRIPTION]:
            "Initial access into a hospital network, sold as ransomware-ready. Buyer confirmed shortly after listing.",
        [M01_LISTING_KEY.WINNER_NOTE1]: "Healthcare sector, SEA region.",
        [M01_LISTING_KEY.WINNER_NOTE2]:
            "Initial access, hospital network. Ransomware-ready. Buyer confirmed.",
        [M01_LISTING_KEY.WINNER_ACCESS_TYPE]: "HOSPITAL NETWORK, INITIAL ACCESS",
        [M01_LISTING_KEY.WINNER_HINT]:
            "portal still runs session auth over a plain cookie — no HttpOnly flag, no rotation. against policy, nobody's fixed it yet.",
        [M01_LISTING_KEY.WINNER_TITLE]: "{{code}} — Healthcare sector, {{region}} region",

        [M01_LISTING_KEY.DECOY_DEFAULT_DESCRIPTION]: "Network access, sold as-is.",
        [M01_LISTING_KEY.DECOY_NOTE_SECTOR_REGION]: "{{category}} sector, {{region}} region.",
        [M01_LISTING_KEY.DECOY_NOTE_CONFIRMED]: "Buyer confirmed; escrow released.",
        [M01_LISTING_KEY.DECOY_ACCESS_TYPE]: "{{category}} ACCESS",
        [M01_LISTING_KEY.DECOY_TITLE]: "{{code}} — {{category}} access, {{region}} region",

        [M01_LISTING_KEY.CATEGORY_DESC_RETAIL]: "Retail chain network access.",
        [M01_LISTING_KEY.CATEGORY_DESC_ISP]: "Regional ISP infrastructure access.",
        [M01_LISTING_KEY.CATEGORY_DESC_LOGISTICS]: "Logistics company network access.",
        [M01_LISTING_KEY.CATEGORY_DESC_EDU]: "University network access.",
        [M01_LISTING_KEY.CATEGORY_DESC_GOV]: "Government / municipal network access.",
        [M01_LISTING_KEY.CATEGORY_DESC_FIN]: "Financial services network access.",
        [M01_LISTING_KEY.CATEGORY_DESC_MED]: "Healthcare network access.",
        [M01_LISTING_KEY.CATEGORY_DESC_TELECOM]: "Telecom carrier network access.",
    },
    zh: {
        [M01_LISTING_KEY.WINNER_DESCRIPTION]:
            "医院网络的初始访问权限，按可直接用于勒索软件的状态出售。挂牌后不久买家已确认。",
        [M01_LISTING_KEY.WINNER_NOTE1]: "医疗行业，东南亚地区。",
        [M01_LISTING_KEY.WINNER_NOTE2]: "初始访问权限，医院网络。可直接用于勒索软件。买家已确认。",
        [M01_LISTING_KEY.WINNER_ACCESS_TYPE]: "医院网络，初始访问",
        [M01_LISTING_KEY.WINNER_HINT]:
            "门户网站的登录会话仍然只靠一个普通cookie——没有HttpOnly标记，也不会轮换。明明不合规，却一直没人修。",
        [M01_LISTING_KEY.WINNER_TITLE]: "{{code}} — 医疗行业，{{region}}地区",

        [M01_LISTING_KEY.DECOY_DEFAULT_DESCRIPTION]: "网络访问权限，按现状出售。",
        [M01_LISTING_KEY.DECOY_NOTE_SECTOR_REGION]: "{{category}}行业，{{region}}地区。",
        [M01_LISTING_KEY.DECOY_NOTE_CONFIRMED]: "买家已确认；托管资金已释放。",
        [M01_LISTING_KEY.DECOY_ACCESS_TYPE]: "{{category}}访问权限",
        [M01_LISTING_KEY.DECOY_TITLE]: "{{code}} — {{category}}访问权限，{{region}}地区",

        [M01_LISTING_KEY.CATEGORY_DESC_RETAIL]: "零售连锁网络访问权限。",
        [M01_LISTING_KEY.CATEGORY_DESC_ISP]: "区域ISP基础设施访问权限。",
        [M01_LISTING_KEY.CATEGORY_DESC_LOGISTICS]: "物流公司网络访问权限。",
        [M01_LISTING_KEY.CATEGORY_DESC_EDU]: "大学网络访问权限。",
        [M01_LISTING_KEY.CATEGORY_DESC_GOV]: "政府/市政网络访问权限。",
        [M01_LISTING_KEY.CATEGORY_DESC_FIN]: "金融服务网络访问权限。",
        [M01_LISTING_KEY.CATEGORY_DESC_MED]: "医疗网络访问权限。",
        [M01_LISTING_KEY.CATEGORY_DESC_TELECOM]: "电信运营商网络访问权限。",
    },
});
