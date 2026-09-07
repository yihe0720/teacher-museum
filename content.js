// 所有展签与原图集中在这里；没有任何外部媒体依赖。
export const museum = {
 title:'致您 · 私人博物馆',dedication:'教师节，献给何老师',
 prologue:{title:'致您',text:'风华，才识，温意，可爱。\n\n这里收藏的，是我眼中的您。',signature:''},
 epilogue:{title:'教师节快乐，何老师。',text:'这座馆没有想讲这些年发生过什么，又或者变成立体版的学院官网教师主页。\n\n只是想趁教师节，很认真地告诉您：\n\n您身上有很多很多值得被喜欢的地方。\n\n教师节快乐，何老师。',after:'希望您一直被很多很多喜欢包围着。'},
 rooms:[
 {id:0,name:'序厅',title:'致您',english:'POUR VOUS',color:'#d8c9b2',width:11,depth:12,height:5.8,entry:'这里收藏的，是我眼中的您。'},
 {id:1,name:'第一厅',title:'风华',english:'ALLURE',color:'#cbbb9f',width:14,depth:17,height:7.1,entry:''},
 {id:2,name:'第二厅',title:'才识',english:'ESPRIT',color:'#798278',width:12,depth:15,height:5.7,entry:'第一厅很容易让人分心。\n\n走到这里，还是应该认真一点。\n\n真正让我愿意继续听您说话的，当然不只是那些照片。'},
 {id:3,name:'第三厅',title:'温意',english:'DOUCEUR',color:'#ba9f86',width:10,depth:13,height:4.8,entry:'有些好，其实不太适合写成很大的词。\n\n它们通常只是顺手发生：一杯咖啡，一瓶水，一支笔，或者几句提醒。\n\n单独看都很小。放在一起，却构成了一位温柔亲和的老师。'},
 {id:4,name:'第四厅',title:'可爱',english:'JOIE',color:'#667565',width:14,depth:17,height:5.6,entry:'走到这里，已经不太需要认真证明什么了。\n\n会唱歌，喜欢足球，还有一些说不上来为什么，但就是很招人喜欢的东西。\n\n所以还是单独留了一厅。'},
 {id:5,name:'终厅',title:'给您的话',english:'ÉPILOGUE',color:'#c7b69b',width:7.5,depth:10,height:4.8,entry:''}],
 exhibits:[
 {id:'lectern',room:1,title:'讲台',kind:'portrait',src:'classroom.jpg',date:'2022 · 10',text:'2022年10月的某节政治经济学课。\n\n考古才发现，您之前比现在帅那么多……\n\n之前一直以为您就是现在这么帅来着，现在的帅气程度已经是天花板了，看照片才发现以前帅的程度更高。\n\n那个时候您都没有一点点肚子……'},
 {id:'journey',room:1,title:'远行',kind:'portrait',src:'dalian.jpg',date:'2024 · 10',text:'2024年10月，您去大连开会时留下的一张照片。\n\n后来还被大连财经学院的老师夸帅。\n\n看来关于这件事，我大概不是唯一一个有偏见的人。'},
 {id:'hosting',room:1,title:'主持',kind:'portrait',src:'hosting.jpg',date:'2025 · 12',text:'这是我第一次参加的那个论坛，您在前面主持。\n\n我第一次要汇报论文，其实有点紧张。\n\n看见您就觉得很安心。\n\n以及，我一直觉得您站在主持台前的时候特别好看。'},
 {id:'drawer',room:1,title:'一份民间记录',kind:'drawer',src:'unofficial-record.jpg',date:'一份民间记录',text:'某届本科生在期末求捞捞的时候留下的一句真心夸赞。'},
 {id:'lesson',room:2,title:'政经课',kind:'classroom',src:'classroom.jpg',date:'2022年10月，留下来的一张课堂照片。',text:'政治经济学，我已经听了很多很多遍。\n\n有时候明明知道下一部分大概要讲什么，还是会觉得坐在那里听您讲是一件很自然的事情。\n\n真正让我一直愿意听下去的，好像也早就不只是某一个知识点了。\n\n您讲政治经济学的时候，总有一种很特别的、属于您自己的理解方式。'},
 {id:'listen',room:2,title:'该听什么',kind:'archive',src:'conference-notes.jpg',date:'2026 · 07 · 12',quotes:['思考一下，什么是中国之问、世界之问、人民之问、时代之问','张宇讲的特别好。包括治学精神。'],text:'第一次自己在外面听会，其实很容易不知道应该把注意力放在哪里。\n\n您会告诉我，哪个老师讲得特别好，哪里值得认真听，什么东西回去以后还可以再想。\n\n后来慢慢觉得，知道很多当然很难，但知道什么值得注意，好像也是一种很难得的能力。'},
 {id:'coffee',room:3,title:'一杯咖啡',kind:'object',src:'coffee.jpg',date:'2026 · 01',text:'2026年1月。\n\n我去学院南路校区找您听MBA课程时，您给我的咖啡。'},
 {id:'water',room:3,title:'一瓶水',kind:'object',src:'water-bottle.jpg',date:'2026 · 07 · 12',text:'2026.7.12\n\n这是那次您带我去找我想见的老师的时候，给我顺的水。\n\n水瓶我一直没舍得扔。\n\n现在还放在我家书架上。'},
 {id:'pen',room:3,title:'一支笔',kind:'object',src:'conference-pen.jpg',date:'2026 · 07 · 12',text:'2026.7.12\n\n这是那次会议结束时候您给我的笔。\n\n您说前一天开会拿的。\n\n后来我才想起来：\n\n前一天也是星期六，本该也是一个休息的日子。'},
 {id:'calm',room:3,title:'安心',kind:'projection',date:'',text:'我第一次在外面听会，其实很紧张！\n\n但是您的提醒让我从不安变得平静。'},
 {id:'happy',room:3,title:'大家怎么这么开心呀',kind:'aside',src:'graduation-2025.jpg',extra:'graduation-2026.jpg',date:'2025 / 2026',text:'2025。\n\n2026。\n\n回头看照片的时候，只觉得：\n\n大家怎么这么开心呀。'},
 {id:'spring',room:4,title:'春风十里',kind:'music',src:'spring-breeze.jpg',date:'2023 · 毕业晚会',text:'2023年毕业晚会。\n\n您唱《春风十里》。\n\n那个时候我还只有手机来录像。\n\n所以留下来的画面并不算特别清楚。\n\n但是没关系，我记得就够清楚了。'},
 {id:'sunny',room:4,title:'晴天',kind:'music',src:'sunny-day.jpg',date:'2026 · 毕业晚会',text:'2026年毕业晚会。\n\n这一次，我的设备已经从手机更新成相机了。\n\n您唱的歌也从《春风十里》变成了《晴天》。\n\n三年过去，至少这一次，终于可以把您拍得清楚一点了。'},
 {id:'postcard',room:4,title:'晴天墙',kind:'aside',src:'gulangyu.jpg',date:'2025 · 10 · 鼓浪屿',text:'之前早就隐约有印象，哪里好像有一面晴天墙。\n\n去厦门以前并不知道就是这里。\n\n到了鼓浪屿以后才发现：\n\n竟然真的就在这里。'},
 {id:'empty',room:4,title:'这里没有照片',kind:'empty',date:'',text:'这里没有照片。\n\n其实我并不知道您踢足球的时候是什么样子。\n\n但总觉得一定会很厉害。\n\n我猜您大概是前锋，或者中场。\n\n因为老师总会在一个可以直接决定比赛胜负的位置。'},
 {id:'ballon',room:4,title:'金球奖',kind:'trophy',date:'',text:'老师可是拿过金球奖的！\n\n鉴于我还是喜欢把足球成就和智慧成就同时考虑，\n\n在我心里老师比cris还要棒一点。。'},
 {id:'night',room:4,title:'不期而遇的一首《晴天》',kind:'aside',src:'xian-night.jpg',date:'2026 · 07 · 西安',text:'那天我在赶工。\n\n晚上因为不想点外卖，才出来吃了顿饭。\n\n西安永宁门附近有好多歌手。\n\n随意听了好几处，都没有您唱得好听。\n\n快走到地铁站附近，仅仅听到前奏，就知道是什么歌了。\n\n即使在赶时间，也想停下来听完不期而遇的一首《晴天》。\n\n唱得真好呀，但是哪怕原唱也没有您唱得好了。'}]
};
export const asset = name => './assets/' + name;
