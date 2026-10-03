import { Localization } from "@hotbunny/hackhub-content-sdk";

export const BACKTRACE_I18N_KEY = {
    M1_SUMMARY: "BACKTRACE.M1.SUMMARY",
    M1_FINDING_1: "BACKTRACE.M1.FINDING.1",
    M1_FINDING_2: "BACKTRACE.M1.FINDING.2",
    M1_FINDING_3: "BACKTRACE.M1.FINDING.3",
    M1_FINDING_4: "BACKTRACE.M1.FINDING.4",
    M1_FINDING_5: "BACKTRACE.M1.FINDING.5",
    M2_SUMMARY: "BACKTRACE.M2.SUMMARY",
    M2_FINDING_1: "BACKTRACE.M2.FINDING.1",
    M2_FINDING_2: "BACKTRACE.M2.FINDING.2",
    M2_FINDING_3: "BACKTRACE.M2.FINDING.3",
    M2_FINDING_4: "BACKTRACE.M2.FINDING.4",
    M2_FINDING_5: "BACKTRACE.M2.FINDING.5",
    M2_FINDING_6: "BACKTRACE.M2.FINDING.6",
    M2_FINDING_7: "BACKTRACE.M2.FINDING.7",
    M2_FINDING_8: "BACKTRACE.M2.FINDING.8",
    M2_FINDING_9: "BACKTRACE.M2.FINDING.9",
    M3_SUMMARY: "BACKTRACE.M3.SUMMARY",
    M3_FINDING_1: "BACKTRACE.M3.FINDING.1",
    M3_FINDING_2: "BACKTRACE.M3.FINDING.2",
    M3_FINDING_3: "BACKTRACE.M3.FINDING.3",
    M3_FINDING_4: "BACKTRACE.M3.FINDING.4",
    M3_FINDING_5: "BACKTRACE.M3.FINDING.5",
    M3_FINDING_6: "BACKTRACE.M3.FINDING.6",
    M3_FINDING_7: "BACKTRACE.M3.FINDING.7",
    M3_FINDING_8: "BACKTRACE.M3.FINDING.8",
    M4_SUMMARY: "BACKTRACE.M4.SUMMARY",
    M4_FINDING_1: "BACKTRACE.M4.FINDING.1",
    M4_FINDING_2: "BACKTRACE.M4.FINDING.2",
    M4_FINDING_3: "BACKTRACE.M4.FINDING.3",
    M4_FINDING_4: "BACKTRACE.M4.FINDING.4",
    M4_FINDING_5: "BACKTRACE.M4.FINDING.5",
    M4_FINDING_6: "BACKTRACE.M4.FINDING.6",
    M4_FINDING_7: "BACKTRACE.M4.FINDING.7",
    M5_SUMMARY: "BACKTRACE.M5.SUMMARY",
    M5_FINDING_1: "BACKTRACE.M5.FINDING.1",
    M5_FINDING_2: "BACKTRACE.M5.FINDING.2",
    M5_FINDING_3: "BACKTRACE.M5.FINDING.3",
    M5_FINDING_4: "BACKTRACE.M5.FINDING.4",
    M5_FINDING_5: "BACKTRACE.M5.FINDING.5",
    M5_FINDING_6: "BACKTRACE.M5.FINDING.6",
    M5_FINDING_7: "BACKTRACE.M5.FINDING.7",
    M5_FINDING_8: "BACKTRACE.M5.FINDING.8",
    M6_SUMMARY: "BACKTRACE.M6.SUMMARY",
    M6_FINDING_1: "BACKTRACE.M6.FINDING.1",
    M6_FINDING_2: "BACKTRACE.M6.FINDING.2",
    M6_FINDING_3: "BACKTRACE.M6.FINDING.3",
    M6_FINDING_4: "BACKTRACE.M6.FINDING.4",
    M6_FINDING_5: "BACKTRACE.M6.FINDING.5",
    M6_FINDING_6: "BACKTRACE.M6.FINDING.6",
    M6_FINDING_7: "BACKTRACE.M6.FINDING.7",
    M6_FINDING_8: "BACKTRACE.M6.FINDING.8",
    M7_SUMMARY: "BACKTRACE.M7.SUMMARY",
    M7_FINDING_1: "BACKTRACE.M7.FINDING.1",
    M7_FINDING_2: "BACKTRACE.M7.FINDING.2",
    M7_FINDING_3: "BACKTRACE.M7.FINDING.3",
    M7_FINDING_4: "BACKTRACE.M7.FINDING.4",
    M7_FINDING_5: "BACKTRACE.M7.FINDING.5",
    M7_FINDING_6: "BACKTRACE.M7.FINDING.6",
    M7_FINDING_7: "BACKTRACE.M7.FINDING.7",
    M7_FINDING_8: "BACKTRACE.M7.FINDING.8",
    STORY: "BACKTRACE.STORY",
} as const;

Localization.registerAll({
    zh: {
        [BACKTRACE_I18N_KEY.M1_SUMMARY]: "初步追踪从交易痕迹中剥离出了一个中间人身份。被恢复的记录同时暴露了一个买家标识，为案件内部建立起第一条可用的关联。",
        [BACKTRACE_I18N_KEY.M1_FINDING_1]:
            "已确认中间人账号为 <span class=\"code\" data-fact=\"m1.broker\">—</span>，在挂牌 <span class=\"code\" data-fact=\"m1.listing\">—</span> 下出售访问权限。",
        [BACKTRACE_I18N_KEY.M1_FINDING_2]:
            "买家标识 <span class=\"code\" data-fact=\"m1.buyer\">—</span> 与中间人的痕迹直接相连：同一个别名出现在中间人后台账本的每一行。",
        [BACKTRACE_I18N_KEY.M1_FINDING_3]:
            "中间人在 <span class=\"code\" data-fact=\"m1.vault\">—</span> 保存着一座私人档案库，其中的项目文件夹可以追溯到 2020 年。",
        [BACKTRACE_I18N_KEY.M1_FINDING_4]:
            "案件号已确认：<span class=\"code\" data-fact=\"m1.caseId\">—</span>，归在项目 <span class=\"code\" data-fact=\"m1.project\">—</span> 名下，并署名 BLACKLEDGER。",
        [BACKTRACE_I18N_KEY.M1_FINDING_5]: "这不是孤立的一条挂牌：同一个买家别名出现在记录在案的多起过往事件中。",
        [BACKTRACE_I18N_KEY.M2_SUMMARY]: "更深一层的追踪把买家标识与一层空壳公司联系起来，把调查从账号层面的线索延伸到了组织层面的关系。",
        [BACKTRACE_I18N_KEY.M2_FINDING_1]:
            "<span class=\"code\" data-fact=\"m2.buyer,m1.buyer\">—</span> 与 <span data-fact=\"m2.shellCompany\">—</span> 有关联，后者是这批赎金付款的指定受益方。",
        [BACKTRACE_I18N_KEY.M2_FINDING_2]: "这家公司在交易链条中似乎充当了一层空壳。",
        [BACKTRACE_I18N_KEY.M2_FINDING_3]: "直接关联回案件 <span class=\"code\" data-fact=\"m2.caseId\">—</span>——第二层关系就此暴露。",
        [BACKTRACE_I18N_KEY.M2_FINDING_4]: "工具包开发者已追查到 <span class=\"code\" data-fact=\"m2.developer\">—</span>。",
        [BACKTRACE_I18N_KEY.M2_FINDING_5]:
            "本案对应一笔 <span class=\"code\" data-fact=\"m2.ransom\">—</span> 的付款，结算于 <span class=\"code\" data-fact=\"m2.settled\">—</span>；这种模式并非孤例（<span class=\"code\" data-fact=\"m2.victims\">—</span>）。",
        [BACKTRACE_I18N_KEY.M2_FINDING_6]:
            "面板会从每一笔成交中记下自己的分成：批次 <span class=\"code\" data-fact=\"m2.batchRef\">—</span> 上为 <span class=\"code\" data-fact=\"m2.panelShare\">—</span>。",
        [BACKTRACE_I18N_KEY.M2_FINDING_7]:
            "部署日志把开发者和这次攻击联系在一起：<span class=\"code\" data-fact=\"m2.deployLog\">—</span> 在医院系统被锁定的那天被推送上线，而付款文件则送到了他家里的工作站。",
        [BACKTRACE_I18N_KEY.M2_FINDING_8]:
            "同步脚本泄露了家庭网关 <span class=\"code\" data-fact=\"m2.homeLead\">—</span>，并承认它后面的 NAS 仍在使用出厂默认登录。",
        [BACKTRACE_I18N_KEY.M2_FINDING_9]:
            "家庭防火墙 <span class=\"code\" data-fact=\"m2.firewall\">—</span> 用开发服务器的管理员密码就能打开——同一个操作员，同一个密码——而它后面的工作站 <span class=\"code\" data-fact=\"m2.workstation\">—</span>，正是付款文件的落点。",
        [BACKTRACE_I18N_KEY.M3_SUMMARY]:
            "顺着空壳公司自己的账本追踪赎金，看清了它的去向：固定的拆分比例，当天早上就付出，最后停在一个名义持有人的名字上——而财务网络里的一条隧道，指向它背后的那个地址。",
        [BACKTRACE_I18N_KEY.M3_FINDING_1]:
            "<span class=\"code\" data-fact=\"m3.gross\">—</span> 的赎金（批次 <span class=\"code\" data-fact=\"m3.batchRef\">—</span>，案件 <span class=\"code\" data-fact=\"m3.caseId\">—</span>）于 <span class=\"code\" data-fact=\"m3.settled\">—</span> 到达 <span data-fact=\"m3.shellCompany\">—</span>，并在当天早上就转了出去。",
        [BACKTRACE_I18N_KEY.M3_FINDING_2]:
            "它按固定比例拆分：<span class=\"code\" data-fact=\"m3.toParent\">—</span> 付给 <span data-fact=\"m3.parentEntity\">—</span>，<span class=\"code\" data-fact=\"m3.toPanel\">—</span> 作为咨询费付给工具包面板，<span class=\"code\" data-fact=\"m3.toBroker\">—</span> 作为佣金付给中间人，<span class=\"code\" data-fact=\"m3.retained\">—</span> 由空壳公司留存。",
        [BACKTRACE_I18N_KEY.M3_FINDING_3]:
            "同样的拆分在账本上的全部 <span class=\"code\" data-fact=\"m3.batchCount\">—</span> 个批次里重复出现：共入账 <span class=\"code\" data-fact=\"m3.allBatches\">—</span>，其中 <span class=\"code\" data-fact=\"m3.allToParent\">—</span> 付给 <span data-fact=\"m3.parentEntity\">—</span>。",
        [BACKTRACE_I18N_KEY.M3_FINDING_4]:
            "“Nominees”只是一个名字，不是实际运营的公司：钱停在了 <span data-fact=\"m3.parentEntity\">—</span>。",
        [BACKTRACE_I18N_KEY.M3_FINDING_5]:
            "财务网关 <span class=\"code\" data-fact=\"m3.gateway\">—</span> 在每一个付款批次之后，都会向 <span class=\"code\" data-fact=\"m3.architectVpn\">—</span> 建立一条隧道——不是客户，也不是供应商。",
        [BACKTRACE_I18N_KEY.M3_FINDING_6]:
            "它的站点到站点配置对端指向 <span class=\"code\" data-fact=\"m3.peerGateway\">—</span>，标签为 <span class=\"code\" data-fact=\"m3.vpnPeer\">—</span>，所有者记为 <span data-fact=\"m3.peerOwner\">—</span>：钱的去向和隧道的另一端，出自同一只手。",
        [BACKTRACE_I18N_KEY.M3_FINDING_7]:
            "突破口是人：员工门户 <span class=\"code\" data-fact=\"m3.portal\">—</span> 败给了一份公开贴出来的密码配方，而财务分析师 <span class=\"code\" data-fact=\"m3.accomplice\">—</span> 照样把账对平了。",
        [BACKTRACE_I18N_KEY.M3_FINDING_8]: "未解之处：仍有一个真实的人拥有这家名义公司，而且不在任何一份备案上。隧道另一端的那个地址，就是那个人答话的地方。",
        [BACKTRACE_I18N_KEY.M4_SUMMARY]:
            "财务网络上一条被敞开的转发规则被审计过，而读了那份审计的人，顺着它反扑了回来。被标记为 <span class=\"code\" data-fact=\"m4.hunter\">—</span> 的操作员直接对这台机器下手：先是防火墙上的一个会话，然后是桌面本身——被拿走，而不是被清空。他们进来时用的会话，经过两个中继，回溯到一台负责调度这些活儿的主机，其登记的名字与赎金早已指向的那个端点相同。",
        [BACKTRACE_I18N_KEY.M4_FINDING_1]:
            "防火墙日志点出了唯一一个行为像操作员、而不像扫描器的来源：<span class=\"code\" data-fact=\"m4.probe\">—</span>，在 443 端口被放行，持有 uid 0，并按固定间隔发送信标。",
        [BACKTRACE_I18N_KEY.M4_FINDING_2]: "无法将他们切断，而且他们拿走的是桌面，不是余额：<span data-fact=\"m4.breach\">—</span>。",
        [BACKTRACE_I18N_KEY.M4_FINDING_3]:
            "事故日志把这个会话追溯到中继 1，<span class=\"code\" data-fact=\"m4.relay1\">—</span>，是通过它自己的路由器面板进入的。",
        [BACKTRACE_I18N_KEY.M4_FINDING_4]:
            "中继 1 的外连日志里有五条会话，其中恰好只有一条与入侵发生的那一分钟吻合：中继 2，<span class=\"code\" data-fact=\"m4.relay2\">—</span>。其余几条，包括一台已注销的机器，都对不上。",
        [BACKTRACE_I18N_KEY.M4_FINDING_5]:
            "中继 2 上存着一份操作员档案，点名了调度主机 <span class=\"code\" data-fact=\"m4.control\">—</span> 和标记 <span class=\"code\" data-fact=\"m4.hunter\">—</span>。",
        [BACKTRACE_I18N_KEY.M4_FINDING_6]:
            "那台主机登记在 <span data-fact=\"m4.origin\">—</span> 名下——与 <span class=\"code\" data-fact=\"m4.architectVpn\">—</span> 是同一个注册人，而那正是付款早已指向的端点。",
        [BACKTRACE_I18N_KEY.M4_FINDING_7]: "同一份档案里还有一张简短的目标清单：一名仍被盯着的财务分析师，一桩已结束的医院任务，以及只写着“next: 正在准备”的一行。",
        [BACKTRACE_I18N_KEY.M5_SUMMARY]:
            "在 <span class=\"code\" data-fact=\"m5.caseId\">—</span> 名下付了款的那家医院，用“指认一扇门和一个该为此负责的人”来给自己的事件结案。可医院自己为这项决定留下的档案却说了别的：被使用的账号是 <span data-fact=\"m5.greta\">—</span>，她的工作邮箱躺在一份流传的泄露数据里，密码至今仍在使用；而最终结论所依据的那个存储介质，接入的是一台从来都不是她的机器。付款的决定，是在勒索通知到达 <span class=\"code\" data-fact=\"m5.gap\">—</span> 之后作出的——那时这一切都还不可能被查清。",
        [BACKTRACE_I18N_KEY.M5_FINDING_1]:
            "同一个公开团队页面的两份带日期快照对不上：<span data-fact=\"m5.dismissed\">—</span>。后一份里少了两个名字：一位是合同在其自身标明的日期到期的外包，另一位的离开则没有任何到期日可言。",
        [BACKTRACE_I18N_KEY.M5_FINDING_2]: "被移除的人是 <span data-fact=\"m5.greta\">—</span>——页面上唯一一个对临床档案库拥有长期访问权限的角色。",
        [BACKTRACE_I18N_KEY.M5_FINDING_3]: "她的工作邮箱出现在一个供应商门户被收录的泄露数据里，以弱哈希形式存储，而这个密码此后一直没有更换。要找到这条记录，并不需要任何入侵。",
        [BACKTRACE_I18N_KEY.M5_FINDING_4]:
            "临床档案库印证了这次使用：<span data-fact=\"m5.archive\">—</span>。记录显示的是一个状态正常的账号，而不是一扇被撬开的门。",
        [BACKTRACE_I18N_KEY.M5_FINDING_5]:
            "她被要求为一个她以书面形式提出异议的结论签字：<span data-fact=\"m5.statement\">—</span>。在它之前的那份草稿写的是另一个原因，而那份草稿并不是最终备案的版本。",
        [BACKTRACE_I18N_KEY.M5_FINDING_6]:
            "决定早已作出：<span data-fact=\"m5.decisionMemo\">—</span>，经由 <span data-fact=\"m5.negotiator\">—</span> 谈妥，并由 <span data-fact=\"m5.decider\">—</span> 批准。从勒索通知到付款之间的间隔是 <span class=\"code\" data-fact=\"m5.gap\">—</span>。",
        [BACKTRACE_I18N_KEY.M5_FINDING_7]:
            "备案结论所依据的原因并不落在她身上：<span data-fact=\"m5.usbTicket\">—</span>，涉及的资产在登记册里归服务台，时间在事件窗口开启的三天之前。",
        [BACKTRACE_I18N_KEY.M5_FINDING_8]:
            "照这样定性，这笔损失就可以理赔：<span data-fact=\"m5.insurer\">—</span> 按过失结案，而点名一名员工，比认定医院自身有责要便宜。",
        [BACKTRACE_I18N_KEY.M6_SUMMARY]:
            "赎金指向的那家公司，不过是一个里面放着一个签名的文件柜。公开登记册保存着它收到过的每一个版本，而这些版本互相矛盾：其中一份备案里写明的所有人，在下一份备案提交时已经被清算；接手的那家公司，在两天之后才成立。顺着持股往上查，终点是一家保险人。顺着地址往旁边查，终点是和付款所走过的那条隧道相同的注册人。两边都坐着同一个男人：<span data-fact=\"m6.architect\">—</span>。",
        [BACKTRACE_I18N_KEY.M6_FINDING_1]: "这个实体本身就是一家名义公司，仅此而已：<span data-fact=\"m6.nominees\">—</span>。",
        [BACKTRACE_I18N_KEY.M6_FINDING_2]:
            "为它提交的所有备案，都出自同一位代理人 <span data-fact=\"m6.registeredAgent\">—</span>，而其所依据的指示，登记册并不记录。",
        [BACKTRACE_I18N_KEY.M6_FINDING_3]: "它的董事是职业董事：<span data-fact=\"m6.front\">—</span>。这项任命是真的，任命背后的利益却不属于他。",
        [BACKTRACE_I18N_KEY.M6_FINDING_4]:
            "这两份所有权备案不可能同时为真：<span data-fact=\"m6.ownershipChange\">—</span>。后一份备案隐去了所有人而没有写明，而接手的那家公司自己申报了这笔持股。",
        [BACKTRACE_I18N_KEY.M6_FINDING_5]:
            "那家接手的公司 <span data-fact=\"m6.holdings\">—</span> 成立于 <span class=\"code\" data-fact=\"m6.incorporated\">—</span>——在前一位所有人解散的两天之后——它的股东是一家保险人：<span data-fact=\"m6.insurer\">—</span>。",
        [BACKTRACE_I18N_KEY.M6_FINDING_6]:
            "该保险人自己的域名登记在 <span class=\"code\" data-fact=\"m6.registrant\">—</span> 名下，与 <span class=\"code\" data-fact=\"m6.peerGateway\">—</span> 是同一个注册人，而那正是电汇早已指向的端点。",
        [BACKTRACE_I18N_KEY.M6_FINDING_7]:
            "这两者由同一个运营者提供服务：<span data-fact=\"m6.infra\">—</span>。同一张证书意味着同一把私钥，那是一个人，不是巧合。",
        [BACKTRACE_I18N_KEY.M6_FINDING_8]:
            "登记册最终交出的名字是 <span data-fact=\"m6.architect\">—</span>——此人主持过决定保险人赔付多少的委员会，也在持有那笔款项所入账户的公司董事会里任职。",
        [BACKTRACE_I18N_KEY.M7_SUMMARY]:
            "付款最终都指向钱早已流向的那个端点背后的一台机器。它自己的节点表里，仍然列着那两台多年前就被注销的机器，而其中真正被遗忘的那一台，仍保存着索引主机前面那个过滤器的凭据。过滤器后面，<span class=\"code\" data-fact=\"m7.c2\">—</span> 只存着一个文件：辛迪加结清过的每一笔账，以及那一行——医院自己的损失原因，被安排到了一名与此毫无关系的系统管理员头上。",
        [BACKTRACE_I18N_KEY.M7_FINDING_1]:
            "索引主机自己的控制台公布了它的资产清单：<span data-fact=\"m7.nodes\">—</span>。其中一台仍在用当前的服务横幅应答，而一台多年前就被注销的机器不会这样。",
        [BACKTRACE_I18N_KEY.M7_FINDING_2]:
            "那台被遗忘的中继仍保存着一份明文配置备份，里面有边缘过滤器唯一有效的账户 <span class=\"code\" data-fact=\"m7.credential\">—</span>。",
        [BACKTRACE_I18N_KEY.M7_FINDING_3]:
            "那个账户打开了边缘过滤器，也打开了索引主机的远程端口：<span class=\"code\" data-fact=\"m7.firewall\">—</span>。",
        [BACKTRACE_I18N_KEY.M7_FINDING_4]: "在 <span class=\"code\" data-fact=\"m7.c2\">—</span> 上的一个会话，触及了整条链所指向的那个文件。",
        [BACKTRACE_I18N_KEY.M7_FINDING_5]:
            "总账本索引记录着 <span class=\"code\" data-fact=\"m7.manifest\">—</span>，合计 <span class=\"code\" data-fact=\"m7.allBatches\">—</span>，其中 <span class=\"code\" data-fact=\"m7.allToParent\">—</span> 流向了 <span data-fact=\"m7.parentEntity\">—</span>。",
        [BACKTRACE_I18N_KEY.M7_FINDING_6]:
            "医院的那一条记录（<span class=\"code\" data-fact=\"m7.caseId\">—</span>）被归类为 <span class=\"code\" data-fact=\"m7.evidence\">—</span>，由医院自己的风险官参与编制，并在付款三天后获保险人批准。",
        [BACKTRACE_I18N_KEY.M7_FINDING_7]: "备份是整个带走的，而不是打开来看：<span class=\"code\" data-fact=\"m7.ledger\">—</span>。",
        [BACKTRACE_I18N_KEY.M7_FINDING_8]:
            "设计师是 <span data-fact=\"m7.architect\">—</span>，他给自己安排好的那些损失定了价，并把它们记成了一条平线。",
        [BACKTRACE_I18N_KEY.STORY]:
            "八个月前，我的手足进了手术室。本该只是一台例行手术。手术进行到一半，医院的系统被锁定了——勒索软件，投放得又干净又迅速。不管是谁干的，他们都清楚自己在做什么。医院付了钱，才让系统重新上线。我的手足再也没能走出那间手术室。官方调查进行了三周，然后就这么停了。没有人解释为什么。我不再等一个解释，转而开始追踪那些钱。我不是警察。我不是记者。我没有委托人，没有警徽，也没有期限。我只有一个名字——BLACKLEDGER——在查出它背后的每一个名字之前，我不会停下。",
    },
});
