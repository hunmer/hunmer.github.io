/**************************************************
 * MKOnlinePlayer v2.41
 * 播放器主功能模块
 * 编写：mengkun(https://mkblog.cn)
 * 时间：2018-3-13
 *************************************************/
// 播放器功能配置


updateStatus();

function updateStatus(){
    $('#translate').attr('class', 'player-btn btn-translate'+(cfg.translate?'d':''));
    $('#switch_blur').attr('class','player-btn btn-blur'+(cfg.blur?'-1':''));
}

//updateRepeatStatus(cfg.lastPlay);
function updateRepeatStatus(music){
    var key = music.id+'-'+music.source;
    if(repeatList.hasOwnProperty(key)){
        cfg.repeat = repeatList[key].repeat;
        cfg.repeatA = Number(repeatList[key].repeatA);
        cfg.repeatB = Number(repeatList[key].repeatB);
        cfg.toStartTime = Number(repeatList[key].toStartTime);
        cfg.toAftertime = Number(repeatList[key].toAftertime);
    }else{
        cfg.repeat = false;
        cfg.repeatA = -1;
        cfg.repeatB = -1;
        cfg.toStartTime = -1;
        cfg.toAftertime = 0;
    }
    $('#repeatStop').attr('class', ' player-btn btn-C'+(cfg.repeat?'':'-1'));
    $('#repeatA').attr('class', 'player-btn btn-A'+(cfg.repeat ?  (cfg.repeatA !== -1?'-1':'') : '-3'));
    $('#repeatB').attr('class', 'player-btn btn-B'+(cfg.repeat ?  (cfg.repeatB !== -1?'-1':'') : '-3'));
    $('#repeatTime').attr('class', 'player-btn btn-3s'+(cfg.toStartTime !== -1?'-1':''));
    $('#repeatTimeE').attr('class', 'player-btn btn-3s'+(cfg.toAftertime !== -1?'-e':''));
    if(!cfg.repeat){
        $('.repeatA').removeClass('repeatA');
        $('.repeatB').removeClass('repeatB');
    }
}

// 音频错误处理函数
function audioErr() {
    // 没播放过，直接跳过
    if(rem.playlist === undefined) return true;
    
    if(rem.errCount > 10) { // 连续播放失败的歌曲过多
        layer.msg('問題があるようです。放送はもう停止しました。');
        rem.errCount = 0;
    } else {
        rem.errCount++;     // 记录连续播放失败的歌曲数目
        layer.msg('現在の曲の再生に失敗しました。次の曲を自動的に再生します。');
        nextMusic();    // 切换下一首歌
    } 
}

// 点击暂停按钮的事件
function pause() {
    if(rem.paused === false) {  // 之前是播放状态
        rem.audio[0].pause();  // 暂停
    } else {
        // 第一次点播放
        if(rem.playlist === undefined) {

            // TODO 加载正在播放的引用歌单信息

            rem.playlist = rem.dislist;
            
            musicList[1].item = musicList[rem.playlist].item; // 更新正在播放列表中音乐
            
            // 正在播放 列表项已发生变更，进行保存
            playerSavedata('playing', musicList[1].item);   // 保存正在播放列表
            
            listClick(rem.playid);
        }
    }
}

// 循环顺序
function orderChange() {
    var orderDiv = $(".btn-order");
    orderDiv.removeClass();
    switch(rem.order) {
        case 1:     // 单曲循环 -> 列表循环
            orderDiv.addClass("player-btn btn-order btn-order-list");
            orderDiv.attr("title", "列表循环");
            layer.msg("リストのループ");
            rem.order = 2;
            break;
            
        case 3:     // 随机播放 -> 单曲循环
            orderDiv.addClass("player-btn btn-order btn-order-single");
            orderDiv.attr("title", "单曲循环");
            layer.msg("曲のループ");
            rem.order = 1;
            break;
            
        // case 2:
        default:    // 列表循环(其它) -> 随机播放
            orderDiv.addClass("player-btn btn-order btn-order-random");
            orderDiv.attr("title", "随机播放");
            layer.msg("ランダム再生");
            rem.order = 3;
    }
}

// 播放
function audioPlay() {

    rem.paused = false;     // 更新状态（未暂停）
    refreshList();      // 刷新状态，显示播放的波浪
    $(".btn-play").addClass("btn-state-paused");        // 恢复暂停
    
    if((mkPlayer.dotshine === true && !rem.isMobile) || (mkPlayer.mdotshine === true && rem.isMobile)) {
        $("#music-progress .mkpgb-dot").addClass("dot-move");   // 小点闪烁效果
    }
    
    var music = musicList[rem.playlist].item[rem.playid];   // 获取当前播放的歌曲信息
    var msg = " 再生中: " + music.name + " - " + music.artist;  // 改变浏览器标题
    
    scrollLyric(rem.audio[0].currentTime, true); 

    // 清除定时器
    if (rem.titflash !== undefined ) 
    {
        clearInterval(rem.titflash);
    }
    // 标题滚动
    rem.titflash = titleFlash(msg);
}

// 标题滚动
function titleFlash(msg) {
    // 截取字符
    var tit = function() {
        msg = msg.substring(1,msg.length)+ msg.substring(0,1);
        document.title = msg;
    };
    // 设置定时间 300ms滚动
    return setInterval(function(){tit()}, 300);
}

// 歌曲名字滚动
function songNameFlash() {
    var song = $('#song_name');
    var artist = $('#artist_name');
    var ablum = $('#album_name');
    var playlist = $('#playlist_name');

    var l = $('.list-playing');
    var lsong = '';
    if(l.length > 0){
        lsong = l.children('.music-name').text()+'('+l.children('.music-album').text()+')';
    }

    var song_name = song.text();
    var artist_name = artist.html();
    var album_name = ablum.text();
    var playlist_name = playlist.text();
    console.log(playlist_name);

    var a = getLen(song_name) > 16;
    var b = getLen(artist_name) > 16;
    var c = getLen(album_name) > 16;
    var d = getLen(lsong) > 24;
    var e = getLen(playlist_name) > 16;
    var tit = function() {
        if(a){
            song_name = song_name.substring(1,song_name.length)+ song_name.substring(0,1);
             song.html(song_name);
        }
        if(b){
            artist_name = artist_name.substring(1,artist_name.length)+ artist_name.substring(0,1);
                artist.html(artist_name);
        }
        if(c){
            lsong = album_name.substring(1,album_name.length)+ album_name.substring(0,1);
            ablum.html(album_name);
        }
        if(d){
            lsong = lsong.substring(1,lsong.length)+ lsong.substring(0,1);
            l.children('.music-name').html(lsong);
        }
        if(e){
            playlist_name = playlist_name.substring(1,playlist_name.length)+ playlist_name.substring(0,1);
            playlist.html(playlist_name);
        }
    };
    // 设置定时间 300ms滚动
    return setInterval(function(){tit()}, 300);
}
// 暂停
function audioPause() {
    rem.paused = true;      // 更新状态（已暂停）
    
    $(".list-playing").removeClass("list-playing");        // 移除其它的正在播放
    
    $(".btn-play").removeClass("btn-state-paused");     // 取消暂停
    
    $("#music-progress .dot-move").removeClass("dot-move");   // 小点闪烁效果

     // 清除定时器
    if (rem.titflash !== undefined ) 
    {
        clearInterval(rem.titflash);
    }
    document.title = rem.webTitle;    // 改变浏览器标题
}

// 播放上一首歌
function prevMusic() {
    playList(rem.playid - 1);
}

// 播放下一首歌
function nextMusic() {
    switch (rem.order ? rem.order : 1) {
        case 1,2: 
            playList(rem.playid + 1);
        break;
        case 3: 
            if (musicList[1] && musicList[1].item.length) {
                var id = parseInt(Math.random() * musicList[1].item.length);
                playList(id);
            }
        break;
        default:
            playList(rem.playid + 1); 
        break;
    }
}
// 自动播放时的下一首歌
function autoNextMusic() {
    cfg.gc = undefined;
    if(rem.order && rem.order === 1) {
        playList(rem.playid);
    } else {
        nextMusic();
    }
}


// 歌曲时间变动回调函数
function updateProgress(){
    // 暂停状态不管
    if(rem.paused !== false) return true;
     // 同步进度条
    var now = rem.audio[0].currentTime;
    if(cfg.repeat && cfg.repeatA !== -1 && cfg.repeatB !== -1){
        if(now < cfg.repeatA || now > Number(cfg.repeatB)　+ Number(cfg.toAftertime)){
            rem.audio[0].currentTime = cfg.repeatA;

            if(cfg.toStartTime > -1){
                rem.audio[0].pause();
                scrollLyric(rem.audio[0].currentTime, true);
                var i = 0;
                if(rem.toStartTask === -1){
                    layer.msg(cfg.toStartTime - i + 's...');
                    rem.toStartTask =  window.setInterval(function(){
                        i++;
                        if(i >= cfg.toStartTime){
                            rem.audio[0].play();
                            window.clearInterval(rem.toStartTask);
                            rem.toStartTask = -1;
                        }else{
                            layer.msg(cfg.toStartTime - i + 's...');
                        }
                    }, 1000);
                }
            }
            now = cfg.repeatA;
        }
    }else
    if(cfg.gc != undefined && cfg.lastPlay.id == cfg.gc.id && cfg.lastPlay.source === cfg.gc.source){
        if(now < cfg.gc.times[0]){
            rem.audio[0].currentTime = cfg.gc.times[0];
        }else
        if(cfg.gc.times[1] != -1 && now > cfg.gc.times[1]){
            rem.audio[0].pause();
            autoNextMusic();
            console.log('高潮结束,下一首');
        }
    }
    // 同步歌词显示   
    scrollLyric(now);
    music_bar.goto(now / rem.audio[0].duration);

    if(rem.logPlayPosTask === -1){
        rem.logPlayPosTask = window.setTimeout(function(){
            setOption('lastPlayId', cfg.lastPlay.id+'-'+cfg.lastPlay.source);
            setOption('lastPlayPos', now);
            rem.logPlayPosTask = -1;
        }, 5000);
    }
}

// 显示的列表中的某一项点击后的处理函数
// 参数：歌曲在列表中的编号
function listClick(no) {
    // 记录要播放的歌曲的id
    var tmpid = no;
    
    // 调试信息输出
    if(mkPlayer.debug) {
        console.log("点播了列表中的第 " + (no + 1) + " 首歌 ");
    }
    
    // 搜索列表的歌曲要额外处理
    if(rem.dislist === 0) {
        // 没播放过
        if(rem.playlist === undefined) {
            rem.playlist = 1;   // 设置播放列表为 正在播放 列表
            if(musicList[1].item.length > 0){
                rem.playid = 0; // 临时设置正在播放的曲目为 正在播放第一首
            }
        }
        
        // 获取选定歌曲的信息
        var tmpMusic = musicList[0].item[no];
        
        // 查找当前的播放列表中是否已经存在这首歌
        for(var i=0; i<musicList[1].item.length; i++) {
            if(musicList[1].item[i].id == tmpMusic.id && musicList[1].item[i].source == tmpMusic.source) {
                tmpid = i;
                playList(tmpid);    // 找到了直接播放
                return true;    // 退出函数
            }
        }
        
        
        // 将点击的这项追加到正在播放的条目的下方
        musicList[1].item.splice(rem.playid + 1, 0, tmpMusic);
        tmpid = rem.playid + 1;
        
        // 正在播放 列表项已发生变更，进行保存
        playerSavedata('playing', musicList[1].item);   // 保存正在播放列表
    } else {    // 普通列表
        // 与之前不是同一个列表了（在播放别的列表的歌曲）或者是首次播放
        if((rem.dislist !== rem.playlist && rem.dislist !== 1) || rem.playlist === undefined) {
            rem.playlist = rem.dislist;     // 记录正在播放的列表
            musicList[1].item = musicList[rem.playlist].item; // 更新正在播放列表中音乐
            
            // 正在播放 列表项已发生变更，进行保存
            playerSavedata('playing', musicList[1].item);   // 保存正在播放列表
            
            // 刷新正在播放的列表的动画
            refreshSheet();     // 更改正在播放的列表的显示
        }
    }
    
    playList(tmpid);
    
    return true;
}

// 播放正在播放列表中的歌曲
// 参数：歌曲在列表中的ID
function playList(id) {
    // 第一次播放
    if(rem.playlist === undefined) {
        pause();
        return true;
    }
    
    // 没有歌曲，跳出
    if(musicList[1].item.length <= 0) return true;
    
    // ID 范围限定
    if(id >= musicList[1].item.length) id = 0;
    if(id < 0) id = musicList[1].item.length - 1;
    
    // 记录正在播放的歌曲在正在播放列表中的 id
    rem.playid = id;
    
    // 如果链接为空，则 ajax 获取数据后再播放
    // if(musicList[1].item[id].url === null || musicList[1].item[id].url === "") {
         ajaxUrl(musicList[1].item[id], play); // 直接重新获取链接
    // } else {
    //     play(musicList[1].item[id]);
    // }
}

// 初始化 Audio
function initAudio() {
    rem.audio = $('<audio></audio>').appendTo('body');
    
    // 应用初始音量
    rem.audio[0].volume = volume_bar.percent;
    // 绑定歌曲进度变化事件
    rem.audio[0].addEventListener('timeupdate', updateProgress);   // 更新进度
    rem.audio[0].addEventListener('play', audioPlay); // 开始播放了
    rem.audio[0].addEventListener('pause', audioPause);   // 暂停
    $(rem.audio[0]).on('ended', autoNextMusic);   // 播放结束
    rem.audio[0].addEventListener('error', audioErr);   // 播放器错误处理
}

function updateList(music){
    if(mkPlayer.debug) {
        console.log('更新歌曲信息', music);
    }
    var k = music.id+'-'+music.source;
    $('#main-list .list-item').each(function(index, el) {
        if($(this).attr('data-key') == k){
            $(this).children('.music-album').text(music.album);
            $(this).children('.auth-name').text(music.artist);
            $(this).children('.music-name').text(music.name);

            if($(this).hasClass('list-playing')){ // 正在播放的音乐
                updateSongDisplay(music); // 更新封面旁边的歌曲信息显示
            }
            return false;
        }
    });
}

// 播放音乐
// 参数：要播放的音乐数组
function play(music) {
    // 调试信息输出
    if(mkPlayer.debug) {
        console.log('开始播放 - ' + music.name);
        console.info('id: "' + music.id + '",\n' + 
        'name: "' + music.name + '",\n' +
        'artist: "' + music.artist + '",\n' +
        'album: "' + music.album + '",\n' +
        'source: "' + music.source + '",\n' +
        'url_id: "' + music.url_id + '",\n' + 
        'pic_id: "' + music.pic_id + '",\n' + 
        'lyric_id: "' + music.lyric_id + '",\n' + 
        'pic: "' + music.pic + '",\n' +
        'url: "' + music.url + '"');
    }
    console.log(music);
    if(music.name == undefined){
        ajaxSong(music, updateList);
    }

    $("#like").attr('class', idInMusicList(music, getListIdByName('like')) != -1 ? 'player-btn btn-liked' : 'player-btn btn-like');
    // 遇到错误播放下一首歌
    if(music.url == "err") {
        audioErr(); // 调用错误处理函数
        return false;
    }

    cfg.lastPlay = music; // 记录最后播放
    addHis(music);  // 添加到播放历史
    
    // 如果当前主界面显示的是播放历史，那么还需要刷新列表显示
    if(rem.dislist == 2 && rem.playlist !== 2) {
        loadList(2);
    } else {
        refreshList();  // 更新列表显示
    }
    
    try {
        //rem.audio[0].pause();
        rem.audio.attr('src', music.url);

        var k = music.id+'-'+music.source;
        if(k == cfg.lastPlayId){
            rem.audio[0].currentTime = cfg.lastPlayPos;
        }else{
            setOption('lastPlayId', -1);
            setOption('lastPlayPos', -1);
        }
        rem.audio[0].play();
    } catch(e) {
        audioErr(); // 调用错误处理函数
        return;
    }

    // 更新歌曲信息
    updateSongDisplay(music);

    rem.errCount = 0;   // 连续播放失败的歌曲数归零
    music_bar.goto(0);  // 进度条强制归零
    changeCover(music);    // 更新封面展示
    ajaxLyric(music, lyricCallback);     // ajax加载歌词
    music_bar.lock(false);  // 取消进度条锁定

    window.setTimeout(function(){
        updateRepeatStatus(music);
    }, 500);

}

function updateSongDisplay(music){
    $('#song_name').html(music.name);
    $('#artist_name').html(music.artist);
    $('#album_name').html(music.album);
    $('#playlist_name').html(musicList[rem.dislist].name);
    textUpdate();
}

function textUpdate(){
      // 文字滚动
    if(rem.songNameflash !== -1){
        clearInterval(rem.songNameflash);
        rem.songNameflash = -1;
    }
    rem.songNameflash = songNameFlash();
}

// 我的要求并不高，保留这一句版权信息可好？
// 保留了，你不会损失什么；而保留版权，是对作者最大的尊重。
// console.info('欢迎使用 MKOnlinePlayer!\n当前版本：'+mkPlayer.version+' \n作者：mengkun(https://mkblog.cn)\n歌曲来源于各大音乐平台\nGithub：https://github.com/mengkunsoft/MKOnlineMusicPlayer');

// 音乐进度条拖动回调函数
function mBcallback(newVal) {
    var newTime = rem.audio[0].duration * newVal;
    // 应用新的进度
    rem.audio[0].currentTime = newTime;
    scrollLyric(newTime, true);  // 强制滚动歌词到当前进度
}

// 音量条变动回调函数
// 参数：新的值
function vBcallback(newVal) {
    if(rem.audio[0] !== undefined) {   // 音频对象已加载则立即改变音量
        rem.audio[0].volume = newVal;
    }
    
    if($(".btn-quiet").is('.btn-state-quiet')) {
        $(".btn-quiet").removeClass("btn-state-quiet");     // 取消静音
    }
    
    if(newVal === 0) $(".btn-quiet").addClass("btn-state-quiet");
    
    playerSavedata('volume', newVal); // 存储音量信息
}

// 下面是进度条处理
var initProgress = function(){  
    // 初始化播放进度条
    music_bar = new mkpgb("#music-progress", 0, mBcallback);
    music_bar.lock(true);   // 未播放时锁定不让拖动
    // 初始化音量设定
    var tmp_vol = cfg.volume;
    tmp_vol = (tmp_vol != null)? tmp_vol: (rem.isMobile? 1: mkPlayer.volume);
    if(tmp_vol < 0) tmp_vol = 0;    // 范围限定
    if(tmp_vol > 1) tmp_vol = 1;
    if(tmp_vol == 0) $(".btn-quiet").addClass("btn-state-quiet"); // 添加静音样式
    volume_bar = new mkpgb("#volume-progress", tmp_vol, vBcallback);
};  

// mk进度条插件
// 进度条框 id，初始量，回调函数
mkpgb = function(bar, percent, callback){  
    this.bar = bar;
    this.percent = percent;
    this.callback = callback;
    this.locked = false;
    this.init();  
};

mkpgb.prototype = {
    // 进度条初始化
    init : function(){  
        var mk = this,mdown = false;
        // 加载进度条html元素
        $(mk.bar).html('<div class="mkpgb-bar"></div><div class="mkpgb-cur"></div><div class="mkpgb-dot"></div>');
        // 获取偏移量
        mk.minLength = $(mk.bar).offset().left; 
        mk.maxLength = $(mk.bar).width() + mk.minLength;
        // 窗口大小改变偏移量重置
        $(window).resize(function(){
            mk.minLength = $(mk.bar).offset().left; 
            mk.maxLength = $(mk.bar).width() + mk.minLength;
        });
        // 监听小点的鼠标按下事件
        $(mk.bar + " .mkpgb-dot").mousedown(function(e){
            e.preventDefault();    // 取消原有事件的默认动作
        });
        // 监听进度条整体的鼠标按下事件
        $(mk.bar).mousedown(function(e){
            if(!mk.locked) mdown = true;
            barMove(e);
        });
        // 监听鼠标移动事件，用于拖动
        $("html").mousemove(function(e){
            barMove(e);
        });
        // 监听鼠标弹起事件，用于释放拖动
        $("html").mouseup(function(e){
            mdown = false;
        });
        
        function barMove(e) {
            if(!mdown) return;
            var percent = 0;
            if(e.clientX < mk.minLength){ 
                percent = 0; 
            }else if(e.clientX > mk.maxLength){ 
                percent = 1;
            }else{  
                percent = (e.clientX - mk.minLength) / (mk.maxLength - mk.minLength);
            }
            mk.callback(percent);
            mk.goto(percent);
            return true;
        }
        
        mk.goto(mk.percent);
        
        return true;
    },
    // 跳转至某处
    goto : function(percent) {
        if(percent > 1) percent = 1;
        if(percent < 0) percent = 0;
        this.percent = percent;
        $(this.bar + " .mkpgb-dot").css("left", (percent*100) +"%"); 
        $(this.bar + " .mkpgb-cur").css("width", (percent*100)+"%");
        return true;
    },
    // 锁定进度条
    lock : function(islock) {
        if(islock) {
            this.locked = true;
            $(this.bar).addClass("mkpgb-locked");
        } else {
            this.locked = false;
            $(this.bar).removeClass("mkpgb-locked");
        }
        return true;
    }
};  

// 快捷键切歌，代码来自 @茗血(https://www.52benxi.cn/)
document.onkeydown = function showkey(e) {
    var key = e.keyCode || e.which || e.charCode;
    var ctrl = e.ctrlKey || e.metaKey;
    var isFocus = $('input').is(":focus");  
    if (ctrl && key == 37) playList(rem.playid - 1);    // Ctrl+左方向键 切换上一首歌
    if (ctrl && key == 39) playList(rem.playid + 1);    // Ctrl+右方向键 切换下一首歌
    if (key == 32 && isFocus == false) pause();         // 空格键 播放/暂停歌曲
}