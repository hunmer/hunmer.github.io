var g_actions = {};
var g_localKey = 'h_';
var g_api = 'https://neysummer-api.glitch.me/';
var g_config = local_readJson('config', {
    
});

var g_cache = {
    toast: -1,
    lastWheel: 0,
    nextPage: 0,
    isWeb:  typeof($autojs) == 'undefined' && typeof(_api) == 'undefined'
}


function parseFile(input) {
    var reader = new FileReader();
    reader.readAsText(input.files[0]);
    reader.onload = function(e) {
        try {
            json = JSON.parse(this.result);
            importData(json);
        } catch (err) {
            alert('错误的json数据!');
        }
    }
}

function importData(data, b_confirm = true) {
    var fun = (b = true) => {
        for (var key in data) {
            if (b) {
                s = data[key];
            } else {
                var old = JSON.parse(localStorage.getItem(key)) || {};
                s = JSON.stringify(Object.assign(old, JSON.parse(data[key])));
            }
            localStorage.setItem(key, s);
        }
        location.reload();
    }
    if (b_confirm) {
        showModal({
            title: '导入数据',
            msg: '<b>是否完全覆盖数据?</b>'
        }).then(() => {
            local_clearAll();
            fun();
        }, () => fun())
    } else {
        fun();
    }
}


function downloadData(blob, fileName) {
    if (typeof(blob) != 'blob') {
        blob = new Blob([blob]);
    }
    var eleLink = document.createElement('a');
    eleLink.download = fileName;
    eleLink.style.display = 'none';
    eleLink.href = URL.createObjectURL(blob);
    document.body.appendChild(eleLink);
    eleLink.click();
    document.body.removeChild(eleLink);
}


function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
}

function getURL(url){
    if(g_cache.isWeb) url = 'http://neysummer.vastserve.com/proxy.php?url='+ encodeURIComponent(url);
    return url;
}

function numToStr(n) {
    if (n > 10000) {
        return (n / 10000).toFixed(1) + 'w';
    }
    if (n > 1000) {
        return (n / 1000).toFixed(1) + 'k';
    }
    return n;
}

function getNow(){
    return new Date().getTime();
}


function cutString(s_text, s_start, s_end, i_start = 0) {
    i_start = s_text.indexOf(s_start, i_start);
    if (i_start === -1) return '';
    i_start += s_start.length;
    i_end = s_text.indexOf(s_end, i_start);
    if (i_end === -1) return '';
    return s_text.substr(i_start, i_end - i_start);
}



function registerAction(name, callback) {
    if (!Array.isArray(name)) name = [name];
    for (var alisa of name) g_actions[alisa] = callback;
}

function toast(msg, style, time = 3000) {
    $(`#toast`).html(`
        <div class="am-alert am-alert-${style}" data-am-alert>
          <button type="button" class="am-close">&times;</button>
          <p>${msg}</p>
        </div>
    `).show();
    clearTimeout(g_cache.toast);
    g_cache.toast = setTimeout(() => {
        $('#toast').html('').hide();
    }, time);
}

function getDomIndex(dom) {
    Array.prototype.indexOf.call(dom.parentNode.children, dom)
}

function loadRes(files, callback, cache = true) {
    var i = 0;
    const onProgress = () => {
        if (++i == files.length) {
            callback && callback(i);
        }
    }
    for (var file of files) {
        if (file.type == "js") {
            if (cache && $('script[src="' + file.url + '"]').length) { // js已加载
                onProgress();
                continue;
            }
            var fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", file.url)
        } else if (file.type == "css" || file.type == "cssText") {
            if (cache && $('link[href="' + file.url + '"]').length) { // css已加载
                onProgress();
                continue;
            }
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", file.url)
        }
        document.getElementsByTagName("head")[0].appendChild(fileref).onload = () => onProgress()
    }
}

Date.prototype.format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

function _l(s){
    return s;
}

function getTime(s, sh = _l(':'), sm = _l(':'), ss = _l(''), hour = false, msFixed = 2) {
    s = Number(s);
    if (s < 0) return '';
    var h = 0,
        m = 0;
    if (s >= 3600) {
        h = parseInt(s / 3600);
        s %= 3600;
    }
    if (s >= 60) {
        m = parseInt(s / 60);
        s %= 60;
    }
    if (ss === false && s % 1 == 0) ss = '';
    return (hour ? _s(h, sh) : _s2(h, sh)) + _s(m, sm) + _s(s, ss);
}


function toTime(s) {
    var a = s.split(':');
    if (a.length == 1) return s;
    if (a.length == 1) return Number(s);
    if (a.length == 2) {
        a.unshift(0);
    }
    return a[0] * 3600 + a[1] * 60 + a[2] * 1;
}

function _l(s) {
    return s;
}

function _s2(s, j = '') {
    s = parseInt(s);
    return (s <= 0 ? '' : s + j);
}

function clearEventBubble(evt) {
    if (evt.stopPropagation) evt.stopPropagation();
    else evt.cancelBubble = true;
    if (evt.preventDefault) evt.preventDefault();
    else evt.returnValue = false
}


function ipc_send(type, msg) {
    var data = {
        type: type,
        msg: msg
    }

    switch(type){
        case 'reload':
            return location.reload();

        case 'copy':
            if(g_cache.isWeb) return window.open(msg);
            break;
    }

     if (typeof($autojs) != 'undefined') {
        $autojs.invoke('action',data);
    }if (typeof(_api) != 'undefined') {
        _api.method(data); // ELECTRON
    } else {
        console.log(JSON.stringify(data));
    }
}


function toggleFullScreen() {
    if (!document.fullscreenElement && // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        $(window).resize();
        return true;
    }
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
    $(window).resize();
    return false;
}


function setConfig(k, v) {
    g_config[k] = v;
    local_saveJson('config', g_config);
    if (typeof(onSetConfig) == 'function') onSetConfig(k, v);
}

const _config = {};
function onSetConfig(k, v){
    if(_config[k]) _config[k](v);
}

function getConfig(k, def) {
    var v = g_config[k];
    if (v == undefined) v = def;
    return v;
}



function domSelector(opts, s = '') {
    if (typeof(opts) != 'object') opts = { action: opts };
    for (var key in opts) {
        s += '[data-' + key;
        if (opts[key] !== '') {
            s += '="' + opts[key] + '"';
        }
        s += ']';
    }
    return $(s);
}


function isEmpty(s) {
    return typeof(s) != 'string' || !s.length;
}

function local_saveJson(key, data) {
    if (window.localStorage) {
        key = g_localKey + key;
        data = JSON.stringify(data);
        if (data == undefined) data = '[]';
        return localStorage.setItem(key, data);
    }
    return false;
}

function local_readJson(key, defaul) {
    if (!window.localStorage) return defaul;
    key = g_localKey + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}

function local_getList() {
    var res = [];
    for (k of Object.keys(localStorage)) {
        if (k.indexOf(g_localKey) == 0) {
            res.push(k);
        }
    }
    return res;
}

function local_clearAll() {
    for (var key of local_getList()) {
        localStorage.removeItem(key);
    }
}

function _s(i, j = '') {
    return (i < 10 ? '0' + i : i) + j;
}

function time_getRent(time) {
    if(!time) return '';
    var today = new Date();
    var s = (parseInt(today.getTime()) - time) / 1000;
    if (s >= 84000) {
        if (s >= 84000 * 30) {
            if (s >= 84000 * 365) {
                return getFormatedTime(4, time);
            }
            return getFormatedTime(2, time);
        }
        return parseInt(s / 86400) + _l('天前');
    }
    // console.log(getTime(s, '时', '分', '秒前'));
    var s = '';
    if(today.getDate() != new Date(time).getDate()){
        s = _l('昨天');
    }
    return s+ getFormatedTime(0, time);
}

function getFormatedTime(i = 0, date = new Date()) {
    if (typeof(date) != 'object') date = new Date(parseInt(date));
    switch (i) {
        case 0:
            return _s(date.getHours()) + ':' + _s(date.getMinutes());
        case 1:
            return date.getMonth() + 1 + '/' + date.getDate() + ' ' + _s(date.getHours()) + ':' + _s(date.getMinutes());
        case 2:
            return date.getMonth() + 1 + '/' + date.getDate();
        case 3:
            return date.getFullYear() + '_' + (Number(date.getMonth()) + 1) + '_' + date.getDate();
        case 4:
            return date.getFullYear() + '/' + (Number(date.getMonth()) + 1) + '/' + date.getDate();

        case 5:
            return date.getFullYear() + '/' + (Number(date.getMonth()) + 1) + '/' + date.getDate() + ' ' + _s(date.getHours()) + ':' + _s(date.getMinutes());
    }
}
