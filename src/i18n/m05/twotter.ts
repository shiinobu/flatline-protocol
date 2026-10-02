import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M05_TWOTTER_KEY = {
    GRETA_BIO: "M05.TWOTTER.GRETA.BIO",
    GRETA_POST_1: "M05.TWOTTER.GRETA.POST_1",
    GRETA_POST_2: "M05.TWOTTER.GRETA.POST_2",
    GRETA_POST_3: "M05.TWOTTER.GRETA.POST_3",
    GRETA_POST_4: "M05.TWOTTER.GRETA.POST_4",
    GARETH_BIO: "M05.TWOTTER.GARETH.BIO",
    GARETH_POST_1: "M05.TWOTTER.GARETH.POST_1",
    GARETH_POST_2: "M05.TWOTTER.GARETH.POST_2",
} as const;

Localization.registerAll({
    en: {
        [M05_TWOTTER_KEY.GRETA_BIO]: "systems admin. keeps the lights on. opinions are the hospital's problem",
        [M05_TWOTTER_KEY.GRETA_POST_1]:
            "third person this week has asked me to “just reset it” for a password they never had",
        [M05_TWOTTER_KEY.GRETA_POST_2]:
            "whoever labelled the spare monitors by weight instead of size, I hope your tea is always cold",
        [M05_TWOTTER_KEY.GRETA_POST_3]:
            "found a usb stick on my desk this morning with {{label}} written on the side in marker. anyone know what that is? it looks like one of our project codes",
        [M05_TWOTTER_KEY.GRETA_POST_4]: "they want me to sign something",
        [M05_TWOTTER_KEY.GARETH_BIO]: "IT contractor. short-term by definition",
        [M05_TWOTTER_KEY.GARETH_POST_1]:
            "last day on the hospital contract. nine months, one badge, zero regrets about the parking situation",
        [M05_TWOTTER_KEY.GARETH_POST_2]: "badge handed back, laptop wiped, inbox someone else's problem now",
    },
    zh: {
        [M05_TWOTTER_KEY.GRETA_BIO]: "系统管理员。负责让灯一直亮着。观点与医院无关",
        [M05_TWOTTER_KEY.GRETA_POST_1]: "这周第三个人来让我“直接重置一下”——而那个密码他们本来就没有过",
        [M05_TWOTTER_KEY.GRETA_POST_2]: "是谁按重量而不是按尺寸给备用显示器贴的标签，祝你的茶永远是凉的",
        [M05_TWOTTER_KEY.GRETA_POST_3]:
            "今早在桌上发现一个 U 盘，侧面用马克笔写着 {{label}}。有人知道那是什么吗？看着像我们的某个项目代号",
        [M05_TWOTTER_KEY.GRETA_POST_4]: "他们要我签个东西",
        [M05_TWOTTER_KEY.GARETH_BIO]: "IT 外包。按定义就是短期的",
        [M05_TWOTTER_KEY.GARETH_POST_1]: "医院这个合同的最后一天。九个月，一张门禁卡，对停车位毫无留恋",
        [M05_TWOTTER_KEY.GARETH_POST_2]: "卡交回去了，笔记本擦干净了，收件箱从现在起是别人的事了",
    },
});
