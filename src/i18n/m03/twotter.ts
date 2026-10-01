import { Localization } from "@hotbunny/hackhub-content-sdk";

export const M03_TWOTTER_KEY = {
    REYES_BIO: "M03.TWOTTER.REYES.BIO",
    REYES_POST_1: "M03.TWOTTER.REYES.POST_1",
    REYES_POST_2: "M03.TWOTTER.REYES.POST_2",
    REYES_POST_3: "M03.TWOTTER.REYES.POST_3",
    REYES_POST_4: "M03.TWOTTER.REYES.POST_4",
    REYES_POST_5: "M03.TWOTTER.REYES.POST_5",
    REYES_POST_6: "M03.TWOTTER.REYES.POST_6",
    REYES_POST_7: "M03.TWOTTER.REYES.POST_7",
    OKAFOR_BIO: "M03.TWOTTER.OKAFOR.BIO",
    OKAFOR_POST_1: "M03.TWOTTER.OKAFOR.POST_1",
    OKAFOR_POST_2: "M03.TWOTTER.OKAFOR.POST_2",
    OKAFOR_POST_3: "M03.TWOTTER.OKAFOR.POST_3",
    OKAFOR_POST_4: "M03.TWOTTER.OKAFOR.POST_4",
    OKAFOR_POST_5: "M03.TWOTTER.OKAFOR.POST_5",
} as const;

Localization.registerAll({
    en: {
        [M03_TWOTTER_KEY.REYES_BIO]:
            "Finance analyst. Numbers all day, home by six (usually). Reyes household, est. a very long time ago.",
        [M03_TWOTTER_KEY.REYES_POST_1]:
            "ugh, IT still makes us build every internal login the same dumb way -- the company's short name, the year the policy came in, and a '!' on the end. one word, capitalized. 'so secure.'",
        [M03_TWOTTER_KEY.REYES_POST_2]:
            "no i will not put my work login on a sticky note. i keep it in my head like a NORMAL person. (the personal shares are a different story, don't @ me)",
        [M03_TWOTTER_KEY.REYES_POST_3]:
            "Reyes family movie night. same four names on every password i've ever made for myself, same four people on the couch. worth it.",
        [M03_TWOTTER_KEY.REYES_POST_4]:
            "new quarter, new 'reconciliation' spreadsheet nobody explains to me. i just tie the numbers and try not to think about the consulting-fee line.",
        [M03_TWOTTER_KEY.REYES_POST_5]:
            "asked my manager where the parent company actually files. got 'you don't need to worry about the holding structure.' cool cool cool.",
        [M03_TWOTTER_KEY.REYES_POST_6]:
            "some weeks import/export feels like a lot of paperwork for not a lot of imports. or exports. probably nothing.",
        [M03_TWOTTER_KEY.REYES_POST_7]: "note to self: stop tweeting about work. starting tomorrow. definitely tomorrow.",
        [M03_TWOTTER_KEY.OKAFOR_BIO]:
            "Operations & facilities @ Skynet Import-Export. If it's got a plug, I've got the key.",
        [M03_TWOTTER_KEY.OKAFOR_POST_1]:
            "people ask who runs this building. i run this building. badge system, server room, the lot. IT just signs the forms i tell them to.",
        [M03_TWOTTER_KEY.OKAFOR_POST_2]:
            "reminder to visitors: guest wifi is still {{wifi}}, one word. been meaning to rotate it for years. it's fine. probably fine.",
        [M03_TWOTTER_KEY.OKAFOR_POST_3]:
            "spent the afternoon 'supervising' the finance floor recabling. by supervising i mean i held the ladder and had opinions.",
        [M03_TWOTTER_KEY.OKAFOR_POST_4]:
            "if you have access to everything you have responsibility for nothing. that's a leadership quote. i said it. put it on a mug.",
        [M03_TWOTTER_KEY.OKAFOR_POST_5]:
            "no i can't get you into the finance systems, that's a different team, i just keep the lights on. but i COULD if i wanted. probably.",
    },
    zh: {
        [M03_TWOTTER_KEY.REYES_BIO]: "财务分析师。整天跟数字打交道，（通常）六点到家。Reyes 一家，很久很久以前就成立了。",
        [M03_TWOTTER_KEY.REYES_POST_1]:
            "唉，IT 还是逼我们用同一种蠢办法设置每一个内部登录——公司简称、政策生效的年份，末尾加个“!”。一个单词，首字母大写。“真安全啊。”",
        [M03_TWOTTER_KEY.REYES_POST_2]:
            "不，我不会把工作登录写在便利贴上。我像个正常人一样记在脑子里。（私人共享那边是另一回事，别@我）",
        [M03_TWOTTER_KEY.REYES_POST_3]:
            "Reyes 一家的电影之夜。我给自己设的每个密码都是同样那四个名字，沙发上也是同样那四个人。值得。",
        [M03_TWOTTER_KEY.REYES_POST_4]:
            "新的季度，新的“对账”表格，没人跟我解释。我只管把账对平，尽量不去想咨询费那一行。",
        [M03_TWOTTER_KEY.REYES_POST_5]:
            "问了经理母公司到底在哪儿备案。得到的回答是“你不用操心控股结构。”好的好的好的。",
        [M03_TWOTTER_KEY.REYES_POST_6]:
            "有些周，进出口感觉像是一大堆文书，却没有多少进口。或者出口。大概没什么。",
        [M03_TWOTTER_KEY.REYES_POST_7]: "给自己的提醒：别再发工作的事了。从明天开始。绝对是明天。",
        [M03_TWOTTER_KEY.OKAFOR_BIO]: "Skynet Import-Export 运营与设施。只要有插头，我就有钥匙。",
        [M03_TWOTTER_KEY.OKAFOR_POST_1]:
            "总有人问这栋楼是谁在管。我在管这栋楼。门禁系统、机房，全都归我。IT 只是在我叫他们签的表上签字。",
        [M03_TWOTTER_KEY.OKAFOR_POST_2]:
            "提醒各位访客：访客 wifi 密码还是 {{wifi}}，一个单词。多年来一直想换。没事的。大概没事。",
        [M03_TWOTTER_KEY.OKAFOR_POST_3]:
            "下午“监督”了财务楼层的重新布线。所谓监督，就是我扶着梯子，还发表了不少意见。",
        [M03_TWOTTER_KEY.OKAFOR_POST_4]:
            "如果你什么都能碰，你就什么都不用负责。这是一句领导力名言。我说的。印在马克杯上吧。",
        [M03_TWOTTER_KEY.OKAFOR_POST_5]:
            "不，我没法带你进财务系统，那是另一个团队的事，我只负责保持灯亮着。不过我要是想，我是能进的。大概吧。",
    },
});
