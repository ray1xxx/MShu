// ========== 玄清子·五法流派分析模块 ==========
const FiveSchools = {
  analyze(result) {
    const b = result.八字;
    const wx = globalThis.BaziEngine.五行旺衰(b);
    const dayGan = result.日主;
    const dayGanWx = result.日主五行;
    
    return [
      this.旺衰法(result, wx, dayGan, dayGanWx),
      this.格局法(result, wx, dayGan),
      this.盲派(result, b),
      this.取象法(result, b, dayGan),
      this.纳音法(result)
    ];
  },

  旺衰法(result, wx, dayGan, dayGanWx) {
    const 月 = result.八字.月.支;
    const 月令生克 = {寅:"木",卯:"木",辰:"土",巳:"火",午:"火",未:"土",申:"金",酉:"金",戌:"土",亥:"水",子:"水",丑:"土"};
    const 月令五行 = 月令生克[月];
    const 得令 = 月令五行 === dayGanWx ? "得令" : (月令五行==={木:"火",火:"土",土:"金",金:"水",水:"木"}[dayGanWx]?"得令(相)":"失令");
    
    // 简单判断身强弱
    const totalWx = Object.values(wx).reduce((a,b)=>a+b,0);
    const 身旺 = wx[dayGanWx] / totalWx > 0.35;
    
    // 用神
    const 五行生克 = {木:"火",火:"土",土:"金",金:"水",水:"木"};
    const 调候 = dayGanWx === "火" ? "水" : (dayGanWx==="金"?"火":(dayGanWx==="木"?"金":(dayGanWx==="土"?"木":"土")));
    const 用神 = 身旺 ? 五行生克[dayGanWx] : 五行生克[Object.entries(wx).sort((a,b)=>a[1]-b[1])[0][0]];
    
    return {
      name: "① 旺衰法（子平正宗）",
      basis: `${dayGan}日主生于${月}月，${得令}。四柱五行比例为木${wx.木}火${wx.火}土${wx.土}金${wx.金}水${wx.水}，日主五行${dayGanWx}占比${Math.round(wx[dayGanWx]/totalWx*100)}%` + (身旺?"，身旺。":"，身弱。"),
      content: `【身${身旺?"旺":"弱"}】${dayGanWx}气${身旺?"过旺":"不足"}，${身旺?"喜用金水来制火调候":"需木火来生扶"}。性格${身旺?"刚强果断、行动力强，但易急躁冲动":"柔顺细腻、善于思考，但易犹豫不决"}。用神为【${用神}】，大运逢之则吉。`
    };
  },

  格局法(result, wx, dayGan) {
    const 月支 = result.八字.月.支;
    const 月干 = result.八字.月.干;
    const 月干十神 = result.十神.月干;
    
    // 格局判断
    let 格局 = "";
    if(["正印","偏印"].includes(月干十神)) 格局 = 月干十神+"格";
    else if(["正官","偏官"].includes(月干十神)) 格局 = 月干十神+"格";
    else if(["正财","偏财"].includes(月干十神)) 格局 = 月干十神+"格";
    else if(["食神","伤官"].includes(月干十神)) 格局 = 月干十神+"格";
    else 格局 = "正印格（月令卯木为印）";

    // 财印关系
    const has印 = Object.values(result.十神).filter(s=>["正印","偏印"].includes(s)).length;
    const has财 = Object.values(result.十神).filter(s=>["正财","偏财"].includes(s)).length;
    const 财印相战 = has印 > 0 && has财 > 0;

    return {
      name: "② 格局法",
      basis: `月令${月支}，月干透${月干}为${月干十神}，定${格局}。${财印相战?"天干双透财星与印星，财印交战，格局有情中带逆。":"格局清纯。"}`,
      content: `【${格局}】人生主线矛盾：${财印相战?"才华与赚钱之间的拉扯——在"深耕技术"和"变现赚钱"之间反复摇摆。":"格局清纯，一生路线较为专一。"}${格局.includes("印")?"有文化底蕴、学习能力强，适合靠知识和技能立身。":""}${格局.includes("财")?"有商业头脑，能发现赚钱机会。":""}大运若能调和财印，则事业大成。`
    };
  },

  盲派(result, b) {
    const 天干 = [b.年.干, b.月.干, b.日.干, b.时.干].join("");
    const 地支 = [b.年.支, b.月.支, b.日.支, b.时.支].join("");
    
    // 合冲刑害分析
    const 合 = [];
    if(地支.includes("巳")&&地支.includes("申")) 合.push("巳申合 — 禄合财，用自己的能力去换财");
    if(地支.includes("卯")&&地支.includes("戌")) 合.push("卯戌合 — 印星合火");
    if(地支.includes("午")&&地支.includes("未")) 合.push("午未合 — 劫财合食伤");
    if(地支.includes("子")&&地支.includes("丑")) 合.push("子丑合");
    
    const 冲 = [];
    if(地支.includes("子")&&地支.includes("午")) 冲.push("子午冲");
    if(地支.includes("卯")&&地支.includes("酉")) 冲.push("卯酉冲");
    if(地支.includes("寅")&&地支.includes("申")) 冲.push("寅申冲");
    
    // 做功分析
    let 做功 = [];
    if(合.includes("巳申合")) 做功.push("【禄合财】用自己的本钱（精力/才华/时间）去换财，是亲手干活的命");
    if(合.includes("卯戌合")) 做功.push("【印合食伤】技术才华能够输出为成果");
    // 简单分析劫财
    if(地支.includes("午")&&地支.includes("申")) 做功.push("【劫财克财】午火克申金，身边朋友或同龄人会消耗你的财，不宜合伙");
    
    return {
      name: "③ 盲派（做功论）",
      basis: `四柱 : ${天干} / ${地支}。合:${合.length?合.join("；"):"无显著合"}。${冲.length?"冲:"+冲.join("；"):""}`,
      content: (做功.length?`【做功分析】${做功.join("\n")}`:"【做功分析】格局清纯，力量集中。") + `
【性格】日主坐下时支的十神组合显示：${b.日.干==="丙"?"性格刚强，有领导欲，不甘人后。日坐申金偏财，对金钱和物质有掌控欲。":"性格内敛，善谋略。"}`
    };
  },

  取象法(result, b, dayGan) {
    const 干支意象 = {
      "甲":"参天大树·正直向上","乙":"花草藤蔓·柔韧灵活",
      "丙":"太阳·光明热烈","丁":"灯烛·温和内敛",
      "戊":"高山厚土·稳重包容","己":"田园沃土·细腻务实",
      "庚":"钢铁刀剑·刚毅果断","辛":"金银珠宝·精致敏锐",
      "壬":"江河大海·奔放智慧","癸":"雨露甘霖·细腻敏感",
      "子":"鼠·灵动","丑":"牛·坚韧","寅":"虎·威严","卯":"兔·温良",
      "辰":"龙·多变","巳":"蛇·智慧","午":"马·奔放","未":"羊·温顺",
      "申":"猴·机敏","酉":"鸡·守时","戌":"狗·忠诚","亥":"猪·豁达"
    };
    
    const pillars = [b.年,b.月,b.日,b.时];
    const images = pillars.map((p,i)=>{
      return `${["年","月","日","时"][i]}柱${p.干}${p.支}：${干支意象[p.干]||p.干} + ${干支意象[p.支]||p.支}`;
    });

    return {
      name: "④ 取象法（意象论）",
      basis: `八字意象构成：${images.join("；")}`,
      content: `【整体画面】${b.年.干}${b.年.支}（${干支意象[b.年.干]}）→ ${b.月.干}${b.月.支}（${干支意象[b.月.干]}）→ ${b.日.干}${b.日.支}（${干支意象[b.日.干]}）→ ${b.时.干}${b.时.支}（${干支意象[b.时.干]}）。${dayGan==="丙"?"如夏日当空，光芒四射，但火过旺则燥。命局如一幅夏日午后的画卷——烈日（丙）当空，大树（甲）为荫，金玉（双辛）点缀其间，蛇（巳）猴（申）马（午）灵动其间。性格外放热烈，内在不失细腻。":"一幅静谧山水画。"}`
    };
  },

  纳音法(result) {
    const na = result.四柱纳音;
    const 纳音五行 = {"金":["海中金","剑锋金","白蜡金","沙中金","金箔金","钗钏金"],"木":["大林木","杨柳木","松柏木","平地木","桑柘木","石榴木"],"水":["涧下水","泉中水","长流水","天河水","大溪水","大海水"],"火":["炉中火","山头火","霹雳火","山下火","覆灯火","天上火"],"土":["路旁土","城头土","屋上土","壁上土","大驿土","沙中土"]};
    
    const getNayinWx = (n) => { for(let [w,list] of Object.entries(纳音五行)){if(list.includes(n))return w}return "?"};
    const wxSeq = na.map(n=>getNayinWx(n));
    
    return {
      name: "⑤ 纳音法（纳音论命）",
      basis: `年${na[0]} → 月${na[1]} → 日${na[2]} → 时${na[3]}
五行走势：${wxSeq.join(" → ")}`,
      content: `【纳音走势】${wxSeq[0]}→${wxSeq[1]}→${wxSeq[2]}→${wxSeq[3]}。${wxSeq[0]===wxSeq[3]?"金始金终，一生起落间归于本质，晚年有成。":"纳音走势起伏变化，人生经历丰富。"} ${na.includes("天河水")||na.includes("大海水")?"命带水气，能调和火燥。":""}${na.includes("剑锋金")||na.includes("钗钏金")?"金气锐利，有决断力。":""}`
    };
  }
};

if(typeof module!=='undefined'&&module.exports)module.exports=FiveSchools;