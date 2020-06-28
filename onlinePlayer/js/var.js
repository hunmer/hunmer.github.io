var g_v_scroll = false;
var g_b_mmove = false;

var mkPlayer = {
    api: "api.php", // api地址
    //api: "https://xptt.com/i/yinyue/api.php",
    loadcount: 20,  // 搜索结果一次加载多少条
    method: "POST",     // 数据传输方式(POST/GET)
    defaultlist: 3,    // 默认要显示的播放列表编号
    autoplay: true,    // 是否自动播放(true/false) *此选项在移动端可能无效
    coverbg: true,      // 是否开启封面背景(true/false) *开启后会有些卡
    mcoverbg: true,     // 是否开启[移动端]封面背景(true/false)
    dotshine: true,    // 是否开启播放进度条的小点闪动效果[不支持IE](true/false) *开启后会有些卡
    mdotshine: false,   // 是否开启[移动端]播放进度条的小点闪动效果[不支持IE](true/false)
    version: "v2.41",    // 播放器当前版本号(仅供调试)
    debug: false   // 是否开启调试模式(true/false)
};

var repeatList = []; // 循环列表

// 存储全局变量
var rem = [];
rem.returnLrc = -1; // 用户长按取消滚回到当前播放位置的计时器
rem.songNameflash = -1; // 文字滚动计时器
rem.toStartTask = -1; // 3秒后开始回到起点的倒计时
rem.logPlayPosTask = -1; // 自动记录最后播放位置
rem.lyric = [];
rem.systemList = 4; // 不可操作的歌单
rem.css = [];
rem.blurImg = ''; //背景图片
rem.icon = 'black'; // 默认图标颜色
rem.viewWindow; // 当前显示的窗口

rem.playid = -1; //缓存 - 最后播放

if(getLocalItem('version') != '2020年3月17日02点19分'){
    localStorage.clear();
    setLocalItem('version', '2020年3月17日02点19分');
}

var cfg = playerReaddata('opition', {
    translate: true, // 是否自动打开翻译模式
    setRepeat: '', // 设置起点模式 A - B
    repeat: false, // 是否开启循环播放
    repeatA: -1, // A开启位置 时间
    repeatB: -1, // b结束位置 时间
    toStartTime: -1, // 回到A段开始播放的倒计时
    toAftertime: 0, //结束位置延长秒数
    blur: true, // 专辑背景图片模糊

    lastPlayId: -1, // 播放位置记录id id-source
    lastPlayPos: -1, // 播放位置记录

    // 最后播放歌曲
    lastPlay: {
        id: -1,
        source: ''
    },
    // 最后播放的歌单记录
    lastlist: {
        id: -1,
        source: ''
    },

    volume: 0.8,        // 默认音量值(0~1之间)
});


// 播放器本地存储信息
// 参数：键值、数据
function playerSavedata(key, data) {
    // 存储，IE6~7 不支持HTML5本地存储
    if (window.localStorage) {
        key = 'mkPlayer2_' + key;    // 添加前缀，防止串用
        data = JSON.stringify(data);
        return localStorage.setItem(key, data);
    }
    return false;
}

// 播放器读取本地存储信息
// 参数：键值
// 返回：数据
function playerReaddata(key, defaul = '') {
    if(!window.localStorage) return defaul;
    key = 'mkPlayer2_' + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}

function getLocalItem(key, defaul = '') {
    var r = null;
    if(window.localStorage){
        r = localStorage.getItem('mkPlayer2_' + key);
    }
    return r === null ? defaul : r;
}

function setLocalItem(key, value) {
    if(window.localStorage){
       return localStorage.setItem('mkPlayer2_' + key, value);
    }
    return false;
}

function setOption(k, v){
    cfg[k] = v;
    if(['repeat', 'repeatA', 'repeatB', 'repeatTime', 'repeatStop', 'toAftertime'].indexOf(k) !== -1){
        if(typeof(cfg) == 'object'){
            var key = cfg.lastPlay.id+'-'+cfg.lastPlay.source;
            if(!repeatList.hasOwnProperty(key)){
                repeatList[key] = {repeat: false, repeatA: -1, repeatB: -1, toStartTime: -1, toAftertime: 0};
            }
            repeatList[key][k] = v;
            playerSavedata('repeatList', repeatList);
            console.log(repeatList);
        }
    }

    playerSavedata('opition', cfg);
}

