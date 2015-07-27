var G_username = '李逍遥';
var M_WIDTH = 10;
var M_HEIGHT = 8;
var TIMEPERROUND = 300;
// 游戏状态标记
var tipping = false, dialoging = false, fighting = false;
var bid = 0; //商店目前的选项
var G_s = 0; //人物配图参数

// UI各元素初始化
var G_window = BuildGameWindow();
var G_status = BuildGameStuats();
var G_map = BuildGameMap();

//杂项
var savedata = {'maps' : 0, 'figure' : 0, 'dialog' : 0};//档

var m_Figure = {
	'blood' : 100, 'attack' : 5, 'armor' : 1, 'agility' : 5, 'dodge' : 0, 'crit' : 0, 'gold' : 0, 'exp' : 0, 'redkey' : 0, 'bluekey' : 0, 'greenkey' : 0, x : 1, y : 3, d : 0,
	'pushwater' : true, 'move' : true, nowFloor : 0
};

//游戏测试用初始状态
/*m_Figure = {
    'blood' : 100000, 'attack' : 200000, 'armor' : 200000, 'agility' : 5000, 'dodge' : 0, 'crit' : 0, 'gold' : 0, 'exp' : 0, 'redkey' : 1, 'bluekey' : 0, 'greenkey' : 1, x : 1, y : 3, d : 0,
    'pushwater' : true, 'move' : true, nowFloor : 0
};*/

var STORY_IN_FLOOR3 = 6, PUSHWATER = 8;

// 游戏数据
// 游戏剧情
/*
	当主角人物到达相应地点并下达移动指令时触发剧情。
	数组中记录了对应剧情的触发地点。
	地图设计需保证剧情顺序执行。
	每次触发剧情规定必须所有剧情通过了才能继续行动。
*/
var story = {
	'nowStory' : 0,
	'data' : [//dialog会被顺序输出
		{'z' : 0, 'x' : 1, 'y' : 3, 'number' : 2, 'now' : 0, 'data' : [G_username + '：我这是在哪里？', G_username + '：我好像还能通过上下左右键移动...先看看附近有什么吧...']},
		{'z' : 0, 'x' : 6, 'y' : 7, 'number' : 2, 'now' : 0, 'data' : [G_username + '：什么嘛，好麻烦...', G_username + '：幸好我也是练过的！']},
		{'z' : 0, 'x' : 7, 'y' : 7, 'number' : 1, 'now' : 0, 'data' : [G_username + '：这绿门应该是过不去了，我也没有钥匙...']},
		{'z' : 1, 'x' : 0, 'y' : 0, 'number' : 1, 'now' : 0, 'data' : [G_username + '：河对面的妹子好漂亮呀，不行，我要追过去～']},
		{'z' : 1, 'x' : 5, 'y' : 7, 'number' : 1, 'now' : 0, 'data' : [G_username + '：要进入找妹子就必须找到红钥匙呀，先找找红钥匙吧！']},
		{'z' : 2, 'x' : 0, 'y' : 0, 'number' : 3, 'now' : 0, 'data' : [G_username + '：啊，这里是哪里！', G_username + '：妹子去哪里了?', G_username + '：搞什么！！！']},
		{'z' : 2, 'x' : 0, 'y' : 1, 'number' : 1, 'now' : 0, 'data' : [G_username + '：什么味道，莫非这就是传说中的迷魂香？啊！头晕！眼花！']},
		{'z' : 6, 'x' : 6, 'y' : 3, 'number' : 7, 'now' : 0, 'data' : ['巫月殿主：此乃巫月神殿，凡人不得擅闯！', G_username + '：可是我没地方去了啊，大神您好心收留我吧。', '巫月殿主：凡人会玷污殿内灵珠，你快走吧！', G_username + '：重要的事情请说三遍！', '巫月殿主：。。。', G_username + '：所以我可以取珠么？', '巫月殿主：那便出手吧！']},
		{'z' : 6, 'x' : 8, 'y' : 3, 'number' : 1, 'now' : 0, 'data' : [G_username + '：具体怎么引呀，用门外的水试试好了。']},	
		{'z' : 1, 'x' : 4, 'y' : 0, 'number' : 4, 'now' : 0, 'data' : [G_username + '：跟我想的一样嘛，妹子就在眼前了，哇哈哈哈。大个让开！', '大魔王：什么让开，本尊名叫大魔王，是如花的男朋友。', '如花：对，奴家是大魔王的女朋友～我只崇拜强者，你要是能打赢他，我就跟你走！', G_username + '：这有何难，我上了！']},
		{'z' : -1, 'x' : 0, 'y' : 0, 'number' : 100, 'now' : 0, 'data' : []}
	]
};

// 验证目前位置是否为当前剧情触发点
story.check = function (){
	//end
	if (story.data[story.nowStory].number == story.data[story.nowStory].now) {
		if (story.nowStory == STORY_IN_FLOOR3)
			rebuildUI();
		dialoging = false;
	}
	//try to start
	if (m_Figure.x == story.data[story.nowStory + 1].x && m_Figure.y == story.data[story.nowStory + 1].y && m_Figure.nowFloor == story.data[story.nowStory + 1].z)
		story.nowStory += 1;
	
	if (story.data[story.nowStory].number == story.data[story.nowStory].now) return;
	story.data[story.nowStory].now += 1;
	dialoging = true;		
	newDialog(story.data[story.nowStory].data[story.data[story.nowStory].now - 1]);
	return true;
};

// 游戏提示
/*
	每次主角人物经过相应地点且地图中对应地点也有提示书对应的item时触发。
	数组中记录了对应提示的触发地点。
*/
var tips = {
	'number' : 13,
	'data' : [
		{'z' : 0, 'x' : 1, 'y' : 4, 'content' : '本大爷乃知识之书，碰上我，我会告诉你做人的道理！看完了，还不快快按任意键让本大爷休息!'},
		{'z' : 0, 'x' : 1, 'y' : 5, 'content' : '本大爷现在教你通关神技，你只需轻轻一点S，就能在你脑子里面复刻出现在的世界。你可以随时按L将脑海里面的世界返回现实！这就是著名的S/L神功！你说给力不给力呀？'},
		{'z' : 0, 'x' : 1, 'y' : 6, 'content' : '你只需打败大魔王就可以回到原来的世界去了。在你面前有三种钥匙，每种钥匙只能打开对应颜色的门，你拿去试一下吧！'},
		{'z' : 0, 'x' : 6, 'y' : 7, 'content' : '在这个世界里面充满着各种妖怪，他们不会主动攻击你，但也不会让你进入它们的地盘，如果你要通过，就只好击败他们咯。'},
		{'z' : 3, 'x' : 1, 'y' : 1, 'content' : '老夫掐指一算，今日会有一个战五渣路过此地，特来教育其提升能力的法门。按B键召唤云来商店即可将经验和金钱换成相应的能力。上下选择，回车购买，再次按B即可离开。'},
		{'z' : 0, 'x' : 8, 'y' : 1, 'content' : '这个法阵是传送阵，可以安全地把你送到一个固定的地方，你可以放心地走过去。'},
		{'z' : 0, 'x' : 5, 'y' : 1, 'content' : '听说把水引到沙漠里面，沙漠里会长出草地。'},
		{'z' : 3, 'x' : 9, 'y' : 2, 'content' : '前方乃躲避之书，教导你躲避此处怪物攻击的方法，能增加你的躲避率。'},
		{'z' : 3, 'x' : 6, 'y' : 2, 'content' : '前方乃暴击之书，教导你攻击此处怪物要害的方法，能增加你的双倍暴击率。'},
		{'z' : 4, 'x' : 5, 'y' : 6, 'content' : '想要通过这个迷阵，你就要问一下小怪物们了。当然，除了我面前这个。'},
		{'z' : 6, 'x' : 8, 'y' : 3, 'content' : '此乃上古灵珠——水灵珠，拥有水灵珠的灵力，你便有引水之力！'},
		{'z' : 6, 'x' : 1, 'y' : 0, 'content' : '花钱需谨慎！'},
		{'z' : 0, 'x' : 0, 'y' : 0, 'content' : '传闻两则：此处有幻术！水浇到传送阵上会使得传送阵变得不稳定。'}
	]
};

// 怪物属性
// 经过粗略的手动调整，保证存在通关方法
var Monsters = [
{'blood' : 400, 'attack' : 17, 'armor' : 10, 'agility' : 25, 'dodge' : 0, 'crit' : 0.4, 'exp' : 80, 'gold' : 200},
{'blood' : 200, 'attack' : 8, 'armor' : 4, 'agility' : 4, 'dodge' : 0.1, 'crit' : 0, 'exp' : 25, 'gold' : 80},
{'blood' : 500, 'attack' : 50, 'armor' : 13, 'agility' : 1, 'dodge' : 0, 'crit' : 0, 'exp' : 50, 'gold' : 120},
{'blood' : 50, 'attack' : 3, 'armor' : 0, 'agility' : 5, 'dodge' : 0, 'crit' : 0, 'exp' : 35, 'gold' : 50},
{'blood' : 50, 'attack' : 3, 'armor' : 0, 'agility' : 5, 'dodge' : 0, 'crit' : 0, 'exp' : 10, 'gold' : 50},
{'blood' : 1500, 'attack' : 50, 'armor' : 50, 'agility' : 50, 'dodge' : 0, 'crit' : 0, 'exp' : 50, 'gold' : 30000},
{'blood' : 500, 'attack' : 500, 'armor' : 15, 'agility' : 30, 'dodge' : 0.6, 'crit' : 0, 'exp' : 300, 'gold' : 100},
{'blood' : 1000, 'attack' : 65, 'armor' : 25, 'agility' : 50, 'dodge' : 0.5, 'crit' : 0.5, 'exp' : 200, 'gold' : 200},
{'blood' : 10000, 'attack' : 1500, 'armor' : 400, 'agility' : 50, 'dodge' : 0, 'crit' : 0, 'exp' : 10, 'gold' : 40000},
{'blood' : 1000, 'attack' : 60, 'armor' : 20, 'agility' : 20, 'dodge' : 0.35, 'crit' : 0, 'exp' : 120, 'gold' : 300},

{'blood' : 20000, 'attack' : 300, 'armor' : 250, 'agility' : 360, 'dodge' : 0.15, 'crit' : 0.15, 'exp' : 3000, 'gold' : 500},
{'blood' : 5000, 'attack' : 400, 'armor' : 300, 'agility' : 1000, 'dodge' : 0, 'crit' : 0.8, 'exp' : 500, 'gold' : 30000},
{'blood' : 120000, 'attack' : 101000, 'armor' : 95000, 'agility' : 1200, 'dodge' : 0.4, 'crit' : 0.4, 'exp' : -1, 'gold' : 0},
{'blood' : 50, 'attack' : 3, 'armor' : 0, 'agility' : 5, 'dodge' : 0, 'crit' : 0, 'exp' : 10, 'gold' : 50}
];

// 地图信息
// 传送门
/*
	每个传送阵相当于地图中强制运动的单向边
	数组中储存了所有传送阵的起始点和目标点
*/
var portals = {
	'number' : 23,
	'data' : [
		{'z' : 0, 'x' : 9, 'y' : 0, 'nz' : 1, 'nx' : 0, 'ny' : 0},
		{'z' : 1, 'x' : 0, 'y' : 0, 'nz' : 0, 'nx' : 9, 'ny' : 0},
		{'z' : 1, 'x' : 5, 'y' : 0, 'nz' : 2, 'nx' : 0, 'ny' : 0},
		{'z' : 2, 'x' : 9, 'y' : 0, 'nz' : 6, 'nx' : 0, 'ny' : 0},
		{'z' : 3, 'x' : 9, 'y' : 7, 'nz' : 4, 'nx' : 2, 'ny' : 1},
		{'z' : 4, 'x' : 7, 'y' : 0, 'nz' : 4, 'nx' : 2, 'ny' : 5},
		{'z' : 4, 'x' : 1, 'y' : 1, 'nz' : 4, 'nx' : 7, 'ny' : 1},
		{'z' : 4, 'x' : 3, 'y' : 1, 'nz' : 4, 'nx' : 4, 'ny' : 2},
		{'z' : 4, 'x' : 6, 'y' : 1, 'nz' : 4, 'nx' : 4, 'ny' : 2},
		{'z' : 4, 'x' : 2, 'y' : 2, 'nz' : 1, 'nx' : 0, 'ny' : 7},
		{'z' : 4, 'x' : 5, 'y' : 2, 'nz' : 4, 'nx' : 5, 'ny' : 7},
		{'z' : 4, 'x' : 7, 'y' : 2, 'nz' : 4, 'nx' : 5, 'ny' : 7},
		{'z' : 4, 'x' : 4, 'y' : 3, 'nz' : 4, 'nx' : 2, 'ny' : 1},
		{'z' : 4, 'x' : 2, 'y' : 4, 'nz' : 4, 'nx' : 7, 'ny' : 1},
		{'z' : 4, 'x' : 7, 'y' : 4, 'nz' : 5, 'nx' : 5, 'ny' : 3},//exit
		{'z' : 4, 'x' : 1, 'y' : 5, 'nz' : 4, 'nx' : 2, 'ny' : 1},
		{'z' : 4, 'x' : 3, 'y' : 5, 'nz' : 4, 'nx' : 7, 'ny' : 5},
		{'z' : 4, 'x' : 6, 'y' : 5, 'nz' : 4, 'nx' : 4, 'ny' : 2},
		{'z' : 4, 'x' : 7, 'y' : 6, 'nz' : 4, 'nx' : 7, 'ny' : 1},
		{'z' : 4, 'x' : 6, 'y' : 7, 'nz' : 4, 'nx' : 2, 'ny' : 1},
		{'z' : 5, 'x' : 1, 'y' : 0, 'nz' : 1, 'nx' : 0, 'ny' : 7},
		{'z' : 6, 'x' : 7, 'y' : 5, 'nz' : 1, 'nx' : 0, 'ny' : 7},
		{'z' : 1, 'x' : 9, 'y' : 0, 'nz' : 3, 'nx' : 0, 'ny' : 0}
	]
};

/* 
	7层的地图信息，每个坐标点对应的当前地图中的物品ID
	为方便地图绘画，地图数组为横向地图，与展示一致
	逻辑判断为纵向地图
	地图元素ID声明：
	与img的命名对应
	0：road 1：block 2：water 3：desert
	101～114：14种怪物 
	1001～1003：三种门
	2000～2010：11种ITEM
	地图UI绘制时ID对应方式相同
*/
var ID_MONSTERFROM = 101;
var Maps = [
	[
		[2003,3,3,0,0,0,0,2,0,2007],
		[3,3,3,0,0,2003,2,2,2003,0],
		[3,3,3,0,0,0,2,104,1,0],
		[1,0,1,0,0,0,2,104,1,0],
		[0,2003,1,2001,2,2,2,104,1,0],
		[0,2003,1,2000,1003,1003,0,104,1,0],
		[1,2003,1,1,1,1,1,1001,1,0],
		[2008,2009,2010,1003,1001,1002,2003,104,0,0]
	],
	[
		[2007,2,114,113,0,2007,1,109,1,2007],
		[0,1,1,1,1,106,1,0,1,0],
		[0,1,112,112,1,106,1,0,1,0],
		[0,1,0,0,1,106,1,109,1,0],
		[0,1,112,112,1,106,1,0,1,0],
		[2009,1,0,0,1001,0,1001,109,1,0],
		[1002,1,1,1,1,1003,1,1,1,0],
		[0,0,0,0,0,0,0,0,0,0]
	],
    [
        [0,1,0,0,0,1,0,107,1,2007],
        [0,1,0,1,0,107,0,1,0,0],
        [0,0,0,0,1,0,1,0,0,1],
        [0,1,1,1,0,0,1,0,1,0],
        [0,1,107,0,0,0,1,0,1,0],
        [0,0,1,0,1,0,0,0,1,0],
        [0,0,0,1,0,0,1,1,0,0],
        [0,1,0,0,0,0,0,107,0,1]
    ],
    [
        [0,1,1,1,1,1,1,1,1,1],
        [0,2003,1,1,1,1,2002,1,1,2004],
        [0,1,1,1,1,1,2003,103,0,2003],
        [0,1,1,1,1,0,102,103,0,103],
        [0,1,1,1,1,102,1,1,1,1],
        [0,1,1,1,1,0,1,1,1,1],
        [0,1,1,1,1,102,1,1,1,1],
        [0,104,104,104,0,0,0,0,0,2007]
    ],
    [
        [1,1,101,1,1,1,1,2007,1,1],
        [1,2007,0,2007,1,1,2007,0,101,1],
        [1,1,2007,1,0,2007,1,2007,1,1],
        [1,1,1,1,2007,1,1,1,1,1],
        [1,1,2007,1,1,1,1,2007,1,1],
        [1,2007,0,2007,1,1,2007,0,101,1],
        [1,1,101,1,1,2003,1,2007,1,1],
        [1,1,1,1,101,0,2007,1,1,1]
    ],
    [
        [1,2007,1,1,1,1,1,1,1,1],
        [1,2010,1,0,0,110,0,2004,1,1],
        [1,0,1,0,1,1,1,0,1,1],
        [1,110,1,110,1,0,1,110,1,1],
        [1,0,1,0,0,0,1,0,1,1],
        [1,0,1,1,1,1,1,0,1,1],
        [1,2002,0,0,110,0,0,0,1,1],
        [1,1,1,1,1,1,1,1,1,1]
    ],
	[
        [0,2003,1,1,1,1,1,2,2,1],
        [0,0,0,106,106,2,2,2,2,1],
        [1,0,2,2,2,0,0,1,1,1],
        [1,0,2,2,2,0,0,111,2003,1],
        [1,0,0,2,2,0,0,1,1,1],
        [1,2,0,2,2,0,2,2007,2,2],
        [1,2,0,0,0,0,106,2,2,2],
        [1,1,1,1,1,1,106,2,2,2]
    ]
];

var showing_map = clone(Maps[m_Figure.nowFloor]);//目前UI中展示的界面

//拷贝对象
function clone(obj){
	var o;
	switch(typeof obj){
	case 'undefined': break;
	case 'string'   : o = obj + '';break;
	case 'number'   : o = obj - 0;break;
	case 'boolean'  : o = obj;break;
	case 'object'   :
		if(obj === null){
			o = null;
		}else{
			if(obj instanceof Array){
				o = [];
				for(var i = 0, len = obj.length; i < len; i++){
					o.push(clone(obj[i]));
				}
			}else{
				o = {};
				for(var k in obj){
					o[k] = clone(obj[k]);
				}
			}
		}
		break;
	default:		
		o = obj;break;
	}
	return o;	
}

// 存档
function save(){
	savedata.maps = clone(Maps);
	savedata.figure = clone(m_Figure);
	savedata.dialog = clone(story);
}

// 读档
function load(){
	Maps = clone(savedata.maps);
	m_Figure = clone(savedata.figure);
	story = clone(savedata.dialog);
	startmusic('backmusic','mp3','true');
	story.check();
	rebuildUI();
}

// 游戏开始

function Game_Start(){
	addnewGameover();
	PaintStatus();
	PaintMap();
	PaintFigure(m_Figure.x, m_Figure.y, 0);
	UpdateStatus();
	startmusic('backmusic','mp3','true');
	save();
	story.check();
	document.addEventListener('keydown',Move);
}

function addstartui() {
    G_window.hide();

    var d = $("<div align='center'></div>");
    var img = $('<img>');
    img.attr({'src':'img/logo.png','id':'logo'});
    d.append(img);

    var s = $("<div align='center'></div>");
    var img2 = $('<img>');
    img2.attr({'src':'img/startgame.png','id':'startgame'});
    s.append(img2);

    var press = $("<div align='center'></div>");
    var img3 = $('<img>');
    img3.attr({'src':'img/press.png','id':'press'});
    press.append(img3);

    $('body').append(d);
    $('body').append(s);
    $('body').append(press);

    document.addEventListener('keydown',anykeydownstart);
}

function anykeydownstart(){
    $('#logo').fadeOut(2000);
    $('#startgame').fadeOut(2000);
    $('#press').fadeOut(2000);
    var tstart = setTimeout(function(){
        G_window.fadeIn(2000);
    },2000);
    var tstart2 = setTimeout(function(){
        Game_Start();
    },2400);
    document.removeEventListener('keydown',anykeydownstart);
}

// 游戏开始前开始搭UI
addstartui();

// UI 区

function BuildGameWindow(){
	var d = $('<div></div>');
	d.attr('id','G_window');
	$('body').append(d);
	return d;
}

function BuildGameStuats(){
	var d = $('<div></div>');
	d.attr('id','G_status');
	$('#G_window').append(d);
	return d;
}

function BuildGameMap(){
	var d = $('<div></div>');
	d.attr('id','G_map');
	$('#G_window').append(d);
	return d;
}

function PaintStatus(){
	G_status.empty();
	PaintHead();
	PaintData();
	showing_Figure = clone(m_Figure);
}

function PaintHead(){
	var head = $('<div>头像：</div>');
	var headpic = $('<img>');
	headpic.attr({'src':'img/head.png','width':'50px','height':'50px'});
	head.append(headpic);
	head.attr({'id':'S_head','class':'S_block'});
	var name = $('<div>姓名：' + G_username + '</div>');
	name.attr({'id':'S_name','class':'S_block'});
	G_status.append(head);
	G_status.append(name);
}

function PaintData(){
	var blood = get_Cdiv('blood', '血量');
	var attack = get_Cdiv('attack', '攻击');
	var armor = get_Cdiv('armor', '防御');
	var agility  =  get_Cdiv('agility', '敏捷');
	var dodge =  get_Cdiv('dodge', '闪避');
	var recover =  get_Cdiv('crit', '暴击');
	var gold = get_Cdiv('gold','金币');
	var exp = get_Cdiv('exp','经验');
	var redkey = get_keydiv('redkey');
	var bluekey = get_keydiv('bluekey');
	var greenkey = get_keydiv('greenkey');
}

function get_Cdiv(id, name){
	var d = $('<div>'+ name + ':' + m_Figure[id] + '</div>');
	d.attr({'id':'CS_' + id,'class':'CS_block'});
	G_status.append(d);
	return d;
}

function get_keydiv(name){
	var keyfile;
	switch (name){
		case 'redkey':
			keyfile = 2010;
		break;
		case 'bluekey':
			keyfile = 2009;
		break;
		case 'greenkey':
			keyfile = 2008;
		break;
	}
	var d = $('<div></div>');
	var img = $('<img>');
	var p = $('<span>');
	img.attr({'src':'img/item/' + keyfile +'.png','width':'28px','height':'25px'});
	p.attr({'id': 'CSKEY_'+name});
	p.text('X' + m_Figure[name]);
	d.append(img);
	d.append(p);
	d.attr({'id':'CS_' + name,'class':'Ckey_block', 'align':'center', 'height': '25px'});
	G_status.append(d);
	return d;
}

function PaintMap(){
	
	// clean map
	$('.map').remove();
	//..paint map.
	for(var i=0;i<M_WIDTH;i++)	
		for(var j=0;j<M_HEIGHT;j++)
			PaintMapIJ(i,j);
}

function PaintMapIJ(i,j){
	$('.MI_'+i+'_'+j).remove();
	var tmp = Maps[m_Figure.nowFloor][j][i];
	if (story.nowStory >= STORY_IN_FLOOR3 && m_Figure.nowFloor == 2 && tmp == 1)
		tmp = 0;
	if (m_Figure.nowFloor == 0 && j == 0 && tmp == 0 && i > 5)
		tmp = 1;
	switch (tmp){
		case 0:
			DrawRoad(i,j);
		break;
		case 1:
			DrawBlock(i,j);
		break;
		case 2:
			DrawWater(i,j);
		break;
		case 3:
			DrawDesert(i,j);
		break;
		default:
			DrawRoad(i,j);
			if (tmp < 1000){
				PaintMonster(i,j,tmp);
			}else
				if (tmp < 1100){
					PaintDoor(i,j,tmp);
				}else{
					PaintItem(i,j,tmp);
				}
		break;
	}
	showing_map[j][i] = clone(Maps[m_Figure.nowFloor][j][i]);
}

function PaintItem(x,y,t){
	//paint..
	var d = $('<div></div>');
	var img = $('<img>');
	img.attr({'src':'img/item/' + t + '.png','width':'50px','height':'50px'});
	d.attr({'class':'item map' + ' MI_'+x+'_'+y});
	var lx = 50 * x;
	var ly = 50 * y;
	d.css('left',lx);
	d.css('top',ly);
	d.append(img);
	$('#G_map').append(d);
}

function PaintDoor(x,y,t){
	var d = $('<div></div>');
	var img = $('<img>');
	img.attr({'src':'img/door/' + t + '.jpg','width':'50px','height':'50px'});
	d.attr({'class':'door map' + ' MI_'+x+'_'+y});
	var lx = 50 * x;
	var ly = 50 * y;
	d.css('left',lx);
	d.css('top',ly);
	d.append(img);
	$('#G_map').append(d);
}

function PaintMonster(x,y,t){
	//paint guai
	var d = $('<div></div>');
	var img = $('<img>');
	img.attr({'src':'img/monster/' + t + '.png','width':'50px','height':'55px'});
	img.css('size', 'contain');
	d.attr({'class':'monster map' + ' MI_'+x+'_'+y});
	var lx = 50 * x;
	var ly = 50 * y - 5;
	d.css('left',lx);
	d.css('top',ly);
	d.append(img);
	$('#G_map').append(d);
}

function PaintFigure(x,y,d){
	$('#figure').remove();
	//paint ren
	var f = $('<div></div>');
	var img = $('<img>');
	img.attr({'src':'img/' + d + G_s +  '.png','width':'40px','height':'65px'});
	f.attr({'id':'figure', 'class':'figure map' + ' MI_'+x+'_'+y});
	var lx = 50 * x;
	var ly = 50 * y -25;
	f.css('left',lx);
	f.css('top',ly);
	f.append(img);
	$('#G_map').append(f);
}

function DrawBlock(i,j){
	var d = $('<div></div>');
	d.attr({'class':'block' + ' MI_'+i+'_'+j});
	var lx = 50 * i ;
	var ly = 50 * j ;
	d.css('left',lx);
	d.css('top',ly);
	$('#G_map').append(d);
}

function DrawWater(i,j){
	var d = $('<div></div>');
	d.attr({'class':'water' + ' MI_'+i+'_'+j});
	var lx = 50 * i ;
	var ly = 50 * j ;
	d.css('left',lx);
	d.css('top',ly);
	$('#G_map').append(d);
}

function DrawDesert(i,j){
	var d = $('<div></div>');
	d.attr({'class':'desert' + ' MI_'+i+'_'+j});
	var lx = 50 * i ;
	var ly = 50 * j ;
	d.css('left',lx);
	d.css('top',ly);
	$('#G_map').append(d);
}

function DrawRoad(i,j){
	var d = $('<div></div>');
	d.attr({'class':'road' + ' MI_'+i+'_'+j});
	var lx = 50 * i ;
	var ly = 50 * j ;
	d.css('left',lx);
	d.css('top',ly);
	$('#G_map').append(d);
}

function changefightUi(){
    $('#CML_blood').text('血量：' + target.blood);
    $('#CMR_blood').text('血量：' + m_Figure.blood);
}

function newTip(word){
	tipping = true;
	var dialog = $('<div></div>');
    var d = $('<div>' + word + '</div>');
    d.css({'width':'350px'});
    dialog.append(d);
	dialog.attr({'class':'tip', 'id':'tip'});
	$('body').append(dialog);
	m_Figure.move = false;
	return dialog;
}

function newDialog(word){
	var dialog = $('<div>' + word + '</div>');
	dialog.attr({'class':'dialog', 'id':'dialog'});
    $('body').append(dialog);
	return dialog;
}

function addnewGameover(){
	var gameover = $('<div></div>');
	gameover.attr({'id':'gameover'});
	var img = $('<img>');
	img.attr({'src':'img/gameover.jpg','width':'100%','height':'100%'});
	gameover.append(img);
	gameover.hide();
	$('body').append(gameover);
	return gameover;
}

function addfightUi(mon_id){
	var d = $('<div></div>');
	d.attr({'id':'fightUi'});
	var ld = $('<div></div>');
	ld.attr('class','fd');
	var mon_img = $('<img>');
	mon_img.attr({'src':'img/monster/' + mon_id + '.png','width':'70px','height':'70px'});
	ld.append(mon_img);
	
	var m_blood = get_Mondiv('L', 'blood', '血量', Monsters[mon_id - ID_MONSTERFROM].blood);
	var m_attack = get_Mondiv('L', 'attack', '攻击', Monsters[mon_id - ID_MONSTERFROM].attack);
	var m_armor = get_Mondiv('L', 'armor', '防御', Monsters[mon_id - ID_MONSTERFROM].armor);
	var m_agility  =  get_Mondiv('L', 'agility', '敏捷', Monsters[mon_id - ID_MONSTERFROM].agility);
	var m_dodge =  get_Mondiv('L', 'dodge', '闪避', Monsters[mon_id - ID_MONSTERFROM].dodge);
	var m_crit = get_Mondiv('L', 'crit', '暴击', Monsters[mon_id - ID_MONSTERFROM].crit);

	ld.append(m_blood);
	ld.append(m_attack);
	ld.append(m_armor);
	ld.append(m_agility);
	ld.append(m_dodge);
	ld.append(m_crit);
	d.append(ld);

	var md = $('<div></div>');
	md.attr('class','fd');
	var img = $('<img>');
	img.attr({'src':'img/vs.png'});
	md.append('<br/><br/><br/><br/>');
	md.append(img);
	d.append(md);

	var rd = $('<div></div>');
	rd.attr('class','fd');
	var f = $('<img>');
	f.attr({'src':'img/0.png','width':'50px','height':'70px'});
	rd.append(f);

	var f_blood = get_Mondiv('R', 'blood', '血量', m_Figure.blood);
	var f_attack = get_Mondiv('R', 'attack', '攻击', m_Figure.attack);
	var f_armor = get_Mondiv('R', 'armor', '防御', m_Figure.armor);
	var f_agility  =  get_Mondiv('R', 'agility', '敏捷', m_Figure.agility);
	var f_dodge =  get_Mondiv('R', 'dodge', '闪避', m_Figure.dodge);
	var f_crit = get_Mondiv('R', 'crit', '暴击', m_Figure.crit);

	rd.append(f_blood);
	rd.append(f_attack);
	rd.append(f_armor);
	rd.append(f_agility);
	rd.append(f_dodge);
	rd.append(f_crit);

	d.append(rd);

	$('body').append(d);
}

function get_Mondiv(LorF, id, name, value)
{
	var d = $('<div>'+ name + '：' + value + '</div>');
	d.attr({'id':'CM' + LorF + '_' + id,'class':'Mon_block'});
	return d;
}

function removefightUi(){
	$('#fightUi').remove();
}

function addshop(){
	var shop = $('<div></div>');
	shop.attr({'class':'shop', 'id' : 'mb_shop'});

    var ld = $("<div align='center'></div>");
    ld.attr({'class':'shopdiv'});
    var md = $("<div align='center'></div>");
    md.attr({'class':'shopdiv'});
    var rd = $("<div align='center'></div>");
    rd.attr({'class':'shopdiv'});

	var addhp = addshopdiv('100g加500血',0);
	var addattack = addshopdiv('100g加5攻',1);
	var addarmor = addshopdiv('100g加5防',2);
	var addagility = addshopdiv('100g加5敏捷',3);
    var addrkey = addshopdiv('10wg买一把红钥匙',4);
    var addbkey = addshopdiv('10wg买一把蓝钥匙',5);
    var addgkey = addshopdiv('10wg买一把绿钥匙',6);

    var eaddattack = addshopdiv('100exp加5攻',7);
    var eaddarmor = addshopdiv('100exp加5防',8);
    var eaddagility = addshopdiv('100exp加5敏捷',9);

	ld.append(addhp);
	ld.append(addattack);
	ld.append(addarmor);
	ld.append(addagility);

    md.append(addrkey);
    md.append(addbkey);
    md.append(addgkey);

    rd.append(eaddattack);
    rd.append(eaddarmor);
    rd.append(eaddagility);

    shop.append(ld);
    shop.append(md);
    shop.append(rd);

	$('body').append(shop);
	highlight(bid);
	return shop;
}

function addshopdiv(word,id){
	var d = $('<div>' + word + '</div>');
	d.attr({'id':'shop_' + id,'class':'shop_block'});
	return d;
}

function highlight(id){
	$('#shop_' + id).css('border','2px solid white');
}

function delight(id){
	$('#shop_' + id).css('border','0px');
}

// 战斗中对战信息的弹出
function posFightingInfo(string,pos){
    var x;
    if (pos == 'L')
        x = 450;
    else
        x = 850;
    var y = 250;
    var d = $('<div>'+string+'</div>');
    d.attr({'id':'tanchu'});
    d.css('left',x +'px');
    d.css('top',y+'px');

    var timer2 = setInterval(function(){
        if (y > 200){
            y -= 3;
            d.css('top',y+'px');
        }else{
            window.clearInterval(timer2);
            d.remove();
        }
    },50);
    $('body').append(d);
}

// 移动时判断各类事件的发生，判定优先顺序详细看代码
var dx = [-1,0,1,0], dy = [0,-1,0,1];
function Move(evt){
	if (dialoging){
		dialoging = false;
		m_Figure.move = true;
		$('#dialog').remove();
		story.check();
		return;
	}else{
		story.check();
		if (dialoging){
			m_Figure.move = true;
			return;
		}
	}
	
	if (tipping){
		tipping = false;
		m_Figure.move = true;
		$('#tip').remove();
		return;
	}
	
	if(fighting) {
		if (evt.keyCode == 76){
			target.exp = 0;
			target.gold = 0;
			target.blood = -1;
			load();
			alert('脑子突然转的好快');
		}
        m_Figure.move = true;
        return ;
    }
	if (!m_Figure.move) return;
	m_Figure.move = false;
	
	if (m_Figure.blood <= 0){
		if (evt.keyCode == 76){
			newTip('脑子突然转的好快');
			$('#gameover').fadeOut(100);
			m_Figure.move = true;
			load();
		}else
		if (evt.keyCode != 116)
			newTip('请按F5重新开始游戏...');
		return;
	}
	
	var locationChange = true;
	if (evt.keyCode == 83){
		save();
		alert('一阵暖流涌向了脑海');
	}else
	if (evt.keyCode == 76){
		load();
		alert('脑子突然转的好快');
	}else
	if(evt.keyCode == 39){
		m_Figure.d = 2;
		if(Validate(m_Figure.x+1,m_Figure.y))
			m_Figure.x++;
		else
			locationChange = false;
        G_s = 1 - G_s;
	}else 
	if(evt.keyCode == 38){
		m_Figure.d = 1;
		if(Validate(m_Figure.x,m_Figure.y-1))
			m_Figure.y--;
		else
			locationChange = false;
        G_s = 1 - G_s;
	}else 
	if(evt.keyCode == 37){
		m_Figure.d = 0;
		if(Validate(m_Figure.x-1,m_Figure.y))
			m_Figure.x--;
		else
			locationChange = false;
        G_s = 1 - G_s;
	}else 
	if(evt.keyCode == 40){
		m_Figure.d = 3;
		if(Validate(m_Figure.x,m_Figure.y+1))
			m_Figure.y++;
		else
			locationChange = false;
        G_s = 1 - G_s;
	}else 
	if(evt.keyCode == 66){
		addshop();
		document.removeEventListener('keydown',Move);
		document.addEventListener('keydown',itemupdown);
		m_Figure.move = true;
		return;
	}
	
	if (!locationChange){
		UpdateUI();
		m_Figure.move = true;
		return;
	}
	document.removeEventListener('keydown',Move);
/*
	若玩家移动了则开始事件判断
*/
	// fight
	if (Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] < 1000 && Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] >= 100){
		fighting = true;
        addfightUi(Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x]);
        Fight(Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] - ID_MONSTERFROM);
	}
	
	// push water
	if (Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] == 2){
		if (Maps[m_Figure.nowFloor][m_Figure.y + dy[m_Figure.d]][m_Figure.x + dx[m_Figure.d]] == 3){
			Maps[m_Figure.nowFloor][m_Figure.y + dy[m_Figure.d]][m_Figure.x + dx[m_Figure.d]] = 0;
		}else{
			if (Maps[m_Figure.nowFloor][m_Figure.y + dy[m_Figure.d]][m_Figure.x + dx[m_Figure.d]] == 0)
				Maps[m_Figure.nowFloor][m_Figure.y + dy[m_Figure.d]][m_Figure.x + dx[m_Figure.d]] = 2;
			else{
				portals.data[0].nx = 5; portals.data[0].ny = 0;
			}
		}
		Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
	}
		
	// get item  ID描述详见地图中注释
	if (Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] >= 2000){
		switch (Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x]){
			case 2000:
				Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
				m_Figure.attack += 100000;
				startmusic('success0','wav','false');
			break;
			case 2001:
				Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
				m_Figure.armor += 100000;
				startmusic('success1','wav','false');
			break;
			case 2002:
				Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
				m_Figure.crit += 0.15;
				startmusic('success2','wav','false');
			break;
			case 2004:
				Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
				m_Figure.dodge += 0.15;
				 startmusic('success3','wav','false');
			break;
			case 2003:
				//get tip
				for (var i = 0;i < tips.number;i++)
					if (tips.data[i].z == m_Figure.nowFloor && tips.data[i].x == m_Figure.x && tips.data[i].y == m_Figure.y)
						newTip(tips.data[i].content);
			break;
			case 2008:
				Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
				m_Figure.greenkey += 1;
				startmusic('success4','wav','false');
			break;
			case 2009:
				Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
				m_Figure.bluekey += 1;
				startmusic('success5','wav','false');
			break;
			case 2010:
				Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
				m_Figure.redkey += 1;
				startmusic('success6','wav','false');
			break;
			default:
				
			break;
		}
	}
	
	// arrive door
	if(Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] < 2000 && Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] >= 1000){
		switch (Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x]){
			case 1001:
				Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
				m_Figure.greenkey -= 1;
				startmusic('opengreen','wav','false');
			break;
			case 1002:
				Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
				m_Figure.bluekey -= 1;
				startmusic('openblue','mp3','false');
			break;
			case 1003:
				Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
				m_Figure.redkey -= 1;
				startmusic('openred','wav','false');
			break;
			default:
				
			break;
		}
	}
	
	//arrive portal
	if (Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] == 2007){
		// find the portal
		for (var t = 0;t < portals.number;t++){
			if (portals.data[t].x == m_Figure.x && portals.data[t].z == m_Figure.nowFloor && portals.data[t].y == m_Figure.y){
				m_Figure.nowFloor = portals.data[t].nz;
				m_Figure.x = portals.data[t].nx;
				m_Figure.y = portals.data[t].ny;
				rebuildUI();
				break;
			}
		}
	}
	
	UpdateUI();
	document.addEventListener('keydown',Move);
	m_Figure.move = true;
}

// 判定当前移动指令是否合法
function Validate(x,y){
	if(x >= M_WIDTH || x < 0)
		return 0;
	if(y >= M_HEIGHT || y < 0)
		return 0;
	// i can push water
	if(Maps[m_Figure.nowFloor][y][x] == 2 && story.nowStory >= PUSHWATER) {
		var xx = x + dx[m_Figure.d], yy = y + dy[m_Figure.d];
		if(xx >= M_WIDTH || xx < 0)
			return 0;
		if(yy >= M_HEIGHT || yy < 0)
			return 0;
		if (Maps[m_Figure.nowFloor][yy][xx] != 0 && Maps[m_Figure.nowFloor][yy][xx] != 3 && Maps[m_Figure.nowFloor][yy][xx] != 2007)
			return 0;
		return 1;
	}
	if(Maps[m_Figure.nowFloor][y][x] > 0 && Maps[m_Figure.nowFloor][y][x] < 100)
		return 0;
	if (Maps[m_Figure.nowFloor][y][x] == 1001 && m_Figure.greenkey == 0) return 0;
	if (Maps[m_Figure.nowFloor][y][x] == 1002 && m_Figure.bluekey == 0) return 0;
	if (Maps[m_Figure.nowFloor][y][x] == 1003 && m_Figure.redkey == 0) return 0;
	return 1;
}

// 对战模拟
function Fight(monster){
	//get monster type
	target = clone(Monsters[monster]);
	var aTimer = 0, bTimer = 0, MaxnTime = target.agility * m_Figure.agility;
	var aDemage = m_Figure.attack - target.armor, bDemage = target.attack - m_Figure.armor;
	if (aDemage < 0) aDemage = 0; if (bDemage < 0) bDemage = 0;

	//music
	pausemusic('backmusic');
	startmusic('fighting','mp3','true');
	startmusic('attack','wav','true');
    startmusic('injure','wav','true');
	
	//fighting
	var timer = setInterval(function(){
        if(target.blood > 0 && m_Figure.blood > 0){
			if (aTimer == bTimer){
				//attack at the same time
				aTimer = target.agility; bTimer = m_Figure.agility;
				aRD = RealDemage(aDemage, target.dodge, m_Figure.crit, 'R'); bRD = RealDemage(bDemage, m_Figure.dodge, target.crit, 'L');
				target.blood -= aRD; m_Figure.blood -= bRD;
				posFightingInfo('-' + aRD, 'L'); posFightingInfo('-' + bRD, 'R');
			}else
			if (aTimer > bTimer){
				//attacked
				bTimer += m_Figure.agility;
				bRD = RealDemage(bDemage, m_Figure.dodge, target.crit, 'L');
				m_Figure.blood -= bRD;
				posFightingInfo('-' + bRD, 'R');
			}else {//attack
				aTimer += target.agility;
				aRD = RealDemage(aDemage, target.dodge, m_Figure.crit, 'R');
				target.blood -= aRD;
				posFightingInfo('-' + aRD, 'L');
			}
        }
        else{
			fighting = false;
            $('#fightUi').remove();
            if (m_Figure.blood > 0) {
                m_Figure.exp += target.exp;
                m_Figure.gold += target.gold;
                if (target.exp == -1) {
                    addgamewin();
                }else{
					Maps[m_Figure.nowFloor][m_Figure.y][m_Figure.x] = 0;
					startmusic('backmusic','mp3','true');
				}
            }
            else{    
				$('#gameover').fadeIn(2000);
				startmusic('fail','mp3','false');
			}
			pausemusic('fighting');
			pausemusic('attack');
            pausemusic('injure');
            window.clearInterval(timer);
			UpdateUI();
        }
        changefightUi();
    },TIMEPERROUND);
}

// 实际伤害的计算函数
function RealDemage(demage, dodge, crit, pos){
	var dem = demage;
	if (Math.random() < dodge){
		posFightingInfo('MISS',pos);
		dem = 0;
	}
	if (Math.random() < crit){
		posFightingInfo('DOUBLE!!',pos);
		dem *= 2;
	}
	return dem;
}

// 商店界面事件判定
function itemupdown(evt){
	if(evt.keyCode == 38){
		delight(bid);
		if(bid <= 0)
			bid += 10;
		bid = (bid - 1) % 10;
		highlight(bid);
	}else 
	if(evt.keyCode == 40){
		delight(bid);
		bid = (bid + 1) % 10;
		highlight(bid);
	}
	else 
	if(evt.keyCode == 13){
        if(bid <= 6){    
			if(m_Figure.gold >= 100){
			    m_Figure.gold -= 100;
			    switch(bid) {
				    case 0:
					    m_Figure.blood += 500;
				        break;
				    case 1:
					    m_Figure.attack += 5;
				        break;
				    case 2:
					    m_Figure.armor += 5;
				        break;
				    case 3:
					    m_Figure.agility += 5;
				        break;
                    case 4:
						if (m_Figure.gold >= 99900){
							m_Figure.redkey += 1;
							 m_Figure.gold -= 99900;
						}else
							m_Figure.gold += 100;
                        break;
                    case 5:
                        if (m_Figure.gold >= 99900){
							m_Figure.bluekey += 1;
							 m_Figure.gold -= 99900;
						}else
							m_Figure.gold += 100;
                        break;
                    case 6:
                        if (m_Figure.gold >= 99900){
							m_Figure.greenkey += 1;
							 m_Figure.gold -= 99900;
						}else
							m_Figure.gold += 100;
                        break;
				    default:
				    break;
			    }
		    }
		}else 
			if(m_Figure.exp >= 100) {
                m_Figure.exp -= 100;
                switch (bid) {
                    case 7:
                        m_Figure.attack += 5;
                        break;
                    case 8:
                        m_Figure.armor += 5;
                        break;
                    case 9:
                        m_Figure.agility += 5;
                        break;
                    default:
                        break;
                }
            }
        PaintStatus();
	}else
		if(evt.keyCode == 66){
			$('#mb_shop').remove();
			document.removeEventListener('keydown',itemupdown);
			document.addEventListener('keydown',Move);
		}
}

// UPDATE 区
// 在UI上Update人物属性
function UpdateStatus(){
	$('#CS_blood').text('血量:' + m_Figure.blood);
	$('#CS_attack').text('攻击:' + m_Figure.attack);
	$('#CS_armor').text('防御:' + m_Figure.armor);
	$('#CS_agility').text('敏捷:' + m_Figure.agility);
	$('#CS_dodge').text('闪避:' + m_Figure.dodge);
	$('#CS_crit').text('暴击:' + m_Figure.crit);
	$('#CS_gold').text('金币:' + m_Figure.gold);
	$('#CS_exp').text('经验:' + m_Figure.exp);
	$('#CSKEY_redkey').text('X' + m_Figure.redkey);
	$('#CSKEY_bluekey').text('X' + m_Figure.bluekey);
	$('#CSKEY_greenkey').text('X' + m_Figure.greenkey);
}

// 在UI上Update地图信息并且清空地图元素
function UpdateMap(){
	for(var i=0;i<M_WIDTH;i++)	
		for(var j=0;j<M_HEIGHT;j++)
			if (showing_map[j][i] != Maps[m_Figure.nowFloor][j][i]){
				$('.MI_'+i+'_'+j).remove();
				PaintMapIJ(i,j);
			}
}

// UI UPDATE 函数
function UpdateUI(){
	UpdateStatus();
	UpdateMap();
	PaintFigure(m_Figure.x,m_Figure.y,m_Figure.d);
}

// 整个UI暴力重绘
function rebuildUI(){
	PaintStatus();
	PaintMap();
	UpdateUI();
}

// 打开音乐
function startmusic(name,type,loop){
    var audio = $('<audio></audio>');
    if(loop == 'true') {
        audio.attr({'id': 'music' + name, 'src': 'music/' + name + '.' + type, 'loop': 'loop'});
        $('body').append(audio);
        var d = $('#music' + name);
		if (d.length > 0)
			d[0].play();
    }else{
        audio.attr({'id': 'music'+ name, 'src':'music/' + name + '.' + type});
        $('body').append(audio);
        var d = $('#music' + name);
        if (d.length > 0)
			d[0].play();
        var mtimer = setInterval(function(){
            if(d.ended){
                d.remove();
                window.clearInterval(mtimer);
            }
        },10);
    }
}

// 暂停音乐
function pausemusic(name){
    var d = $('#music' + name)[0];
    if ($('#music' + name).length > 0)
		d.remove();
}

// 通关动画区
function addgamewin(){
    G_window.fadeOut(2000);
    $('.tip').remove();
    $('.dialog').remove();
    document.removeEventListener('keydown',Move);
    pausemusic('backmusic');
    startmusic('win','mp3','true');
    addgamewinui();
}

function addgamewinui(){
    var d1 = $('<div></div>');
    var d2 = $('<div></div>');
    var d3 = $('<div></div>');
    var timer1 = setTimeout(function(){
        d1.attr({'id':'love'});
        var img = $('<img>');
        img.attr({'src':'img/love1.jpg','width':'650px','height':'400px'});
        d1.append(img);
        $('body').append(d1);
        d1.hide();
        d1.fadeIn(2000);
    },2000);
    var timer2 = setTimeout(function(){
        d1.fadeOut(1000);
        d2.attr({'id':'maker'});
        d2.append('<p>剧情 ： 陈亨杰</p>');
        d2.append('<p>美工 ： 王正</p>');
        d2.append('<p>程序 ： 王正和陈亨杰</p>');
        $('body').append(d2);
        d2.hide();
        d2.fadeIn(2000);
    },6000);
    var timer3 = setTimeout(function(){
        d2.fadeOut(1000);
        d3.attr({'id':'end'});
        d3.text('The End');
        $('body').append(d3);
        d3.hide();
        d3.fadeIn(2000);
    },10000);
}