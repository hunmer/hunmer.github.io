/**************************************************
 * MKOnlinePlayer v2.31
 * 歌词解析及滚动模块
 * 编写：mengkun(http://mkblog.cn)
 * 时间：2017-9-13
 *************************************************/

function addLyricItem(no, time, lrc, tlrc = '') {
    var li = $('<div class="lrc-item" data-no="'+no+'" data-time="' + time+ '">' +
    '    <span class="lrc">' + lrc + '</span>' +
    (tlrc != '' ? '</br><span class="tlrc" style="display: '+(cfg.translate ? 'block' : 'none')+'">' + tlrc + '</span>' : '') +
    '</div>');
    $("#lyric .mCSB_container").append(li);

    // event
    li.on('touchstart', function(){

    }).on('touchend',function(){
        if(rem.isMobile){
            scrollTimeTask();
        }
    }).on('touchmove', function(){
        if(rem.isMobile){
            scrollTimeTask();
        }
    }).on('mousewheel', function(){
        if(!rem.isMobile){
            scrollTimeTask();
        }
    }).click(function(event) {

        var time = Number($(this).attr('data-time'));
        if(cfg.setRepeat == 'A'){
            setOption('repeatA', time);
            layer.msg('開始位置を正常に設定します');
            setOption('setRepeat', '');
            changeClass($('#repeatA'), 'A-1', 'player-btn');
            $('.repeatA').removeClass('repeatA');
            $(this).addClass('repeatA');
        }else
        if(cfg.setRepeat == 'B'){
            var next;
            if(index === rem.lyric.length - 1){
                next = rem.audio[0].duration; // 到结尾
            }else{
                next = rem.lyric[parseInt(no)+1][0];
            }
            setOption('repeat', true);
            setOption('repeatB', next);
            layer.msg('終了位置を正常に設定します');
            setOption('setRepeat', '');
            changeClass($('#repeatB'), 'B-1', 'player-btn');
            $('.repeatB').removeClass('repeatB');
            $(this).addClass('repeatB');
        }else{
            if(time > -1){
                rem.audio[0].currentTime = time;
                lyric_setPlaying(no);;
                scrollLyric(time, false);
            }
        }
    });
    return li;
}

// 在歌词区显示提示语（如歌词加载中、无歌词等）
function lyricTip(str) {
    $("#lyric .mCSB_container").html("<div class='list-item'><span class='lrc'>" + str + '</span></div>');     // 显示内容
}


// 歌曲加载完后的回调函数
// 参数：歌词源文件
function lyricCallback(id, source, str, t_lrc = '') {
    resetRepeat();
    if(id !== musicList[rem.playlist].item[rem.playid].id) return;  // 返回的歌词不是当前这首歌的，跳过
    parseLyric(id, source, str, t_lrc);    // 解析获取到的歌词

    if(!rem.lyric.length) {
        lyricTip('歌詞がありません');
        return false;
    }

    if(!rem.tlyric.length){ // 没有翻译歌词
        if($('#translate').hasClass('btn-translated')){
            changeClass($('#translate'), 'translate', 'player-btn');//  关闭歌词翻译样式
        }
    }else
    if(cfg.translate && !$('#translate').hasClass('btn-translated')){  // 开启歌词翻译样式
        changeClass($('#translate'), 'translated', 'player-btn');
    }

    $("#lyric .mCSB_container").html('');     // 清空歌词区域的内容
    $("#lyric").scrollTop(0);    // 滚动到顶部
    
    rem.lastLyric = -1;
    var li;
    var s = -1, e = -1;
    var last;
    for(var i in rem.lyric){
        var k = rem.lyric[i][0];
        var txt = rem.lyric[i][1];
        if(!txt) txt = "&nbsp;";

        // 中文歌词
        var tlrc = '';
        if(rem.tlyric[i] != undefined){
            tlrc = rem.tlyric[i][1];
        }

        li = addLyricItem(i, k, txt, tlrc);
        if(cfg.repeatA !== -1 && s === -1 && k >= cfg.repeatA){
            s = k;
            if(!cfg.repeat){
                $('.repeatA').addClass('repeat-default');
            }
            $('.repeatA').removeClass('repeatA');
            li.addClass('repeatA');
        }else
        if(cfg.repeatB !== -1 && e === -1 && s !== -1 && k >= cfg.repeatB && last !== null){
            // e = k; 这个应该要取last的,没用先放着
            if(!cfg.repeat){
                $('.repeatB').addClass('repeat-default');
            }
            $('.repeatB').removeClass('repeatB');
            last.addClass('repeatB');
        }else{
            last = li;
        }
    }
}

function removePlaying(){
    $(".lplaying").attr('class', "lrc-item")
    /*$(".lplaying").css({
        fontSize: '14px',
        marginTop: '0px',
        marginBottom: '0px',
        display: '',
    }).attr('class', "lrc-item");*/
}

function lyric_setPlaying(index){
    removePlaying();
    var playing = $(".lrc-item[data-no='" +index + "']").attr('class', "lrc-item lplaying dbcolor");    // 加上正在播放样式;
    /*var text = playing.children('.lrc').html();
    if(typeof(text) === 'string' && text.replace('&nbsp;', '') != ''){
        playing.css('display', 'inline-block');
        playing.animate({
        fontSize: '+=3px',
        marginTop: '+=20px',
        marginBottom: '+=20px'
        }, 800, function(){

        });
    }*/
    return playing;

}

// 滚动歌词到指定句
// 参数：当前播放时间（单位：秒）
function scrollLyric(time, scrollTo = false) {
    
    time = Number(time);
    if(rem.viewWindow != 'player') return;
   
    var fk;
    if(!scrollTo){
        if(rem.lyric.length === 0) return;
        //if(g_b_mmove) return; // 用户正在滚动或者按住
        //if(g_v_scroll) return; // 滚动条正在滚动
    }
    for(var k in rem.lyric){
        var find = Number(rem.lyric[k][0]);
        if(find >= time){
            fk = k > 0 ? k - 1 : k; // 从上一段开始播放
            break;
        }
    }

    if(fk != undefined){
        var v = rem.lyric[fk];
        if(!scrollTo && rem.lastLyric == v[1]) return;  // 歌词没发生改变
        rem.lastLyric = v[1];  // 记录方便下次使用
        //console.log({'time': time, 'find': v[0], 'lsat': rem.lastLyric, 'no': fk, 'lrc': v[1]});

        var playing = lyric_setPlaying(fk);
        // $("#lyric .mCSB_container").children().height() // 不能取平均

        // 滚动
        var h = 28 * (cfg.translate ? 2 : 1) // 28 / 54
        var nh = 0;
        var ar = [];
        var cm = $(".lyric").height(); 
        if(cm == 0) return; // 没打开歌词界面
        $('.lrc-item').each(function(index, el) {
            nh += $(el).height();
            ar.push(nh);
            if(index == fk){
                var pos = fk - parseInt(cm / h / 2) - 1;
                if(!pos){
                    console.log('找不到滚动位置'); // 最前面的歌词
                    if(fk <= 3) return;
                    return;
                }
                console.log('pos '+ar[pos]);
                //g_v_scrolling = true;
                $("#lyric").mCustomScrollbar("stop");
                console.log($("#lyric").mCustomScrollbar("scrollTo", ar[pos] == undefined ? playing : parseInt(ar[pos])));
                if(rem.returnLrc != -1){
                    clearTimeout(rem.returnLrc);
                    rem.returnLrc = -1;
                }
                return;
            }
        });
    }
}

// 解析歌词
function parseLyric(s_id, s_source, lrc, tlrc) {
    //console.log(lrc);
    var c = 0;
    var res = [];
    var tres = [];
    var s_tlrc;
    var lrcs = [], times =[];
    if(typeof(lrc) == 'string'){
        var lyrics = lrc.split("\n");
        for(var i=0;i<lyrics.length;i++){
            var lyric = decodeURIComponent(lyrics[i]);
            var s_time = getTextbyStartAndEnd_string(lyric, '[', ']');
            time = getSecFromTime_ms(s_time);
            var s_lyric = lyric.replace('['+s_time+']', '');
            // TODO 有的歌词把中文歌词放在原歌词里了, / 分割
            if(time != -1){
                c++;
                lrcs.push(s_lyric);
                times.push(time);
            }
            if(tlrc != ''){
                s_tlrc = getTextbyStartAndEnd_string(tlrc + "\n", '['+s_time+']', "\n"); // 找出中文歌词
                tres.push([time, !s_tlrc ? '' : s_tlrc]);
            }
            res.push([time, s_lyric]);
        }
    }
    if(!c){
        layer.msg('歌詞がスクロールできません');
    }else
    if(false){
        var count = {};
        for(var i = 0;i<lrcs.length;i++){
            for(var c = i+1;c<lrcs.length;c++){
                if(lrcs[c] != '' && lrcs[c] == lrcs[i]){
                    if(count[i] === undefined){
                        count[i] = [];
                    }
                    count[i].push(c);
                }
            }
        }
        //console.log(count);
        max = [[], -1];
        for(var i in count){
            if(count[i].length >= max[0].length){
                max = [count[i], i]; 
            }
        }
        //console.log(max);

        if(max[0].length == 0){
            console.log('没有发现重复歌词 = 0');
        }else{
            if(max[0].length == 1){
                start = max[0][0];
                end = -1
                console.log('没有发现重复歌词 = 1');
            }else{
                var half = parseInt(max[0].length / 2);
                start = max[0][half-1]
                var end = max[0][half];
            }
             var e1 = end === -1 ? lrcs.length : end;
                 for(var i=start;i<e1;i++){
                    if(lrcs[i] == '' && start - i >= 5){ // 中間有空行 且 歌词超过5行
                        end = i; // 截至
                        break;
                    }
                }
            console.log(start, end);
            cfg.gc = {
                id: s_id,
                source: s_source,
                times: [times[start], end === -1 ? -1 : times[end]]
            };
            if(end != -1){
                console.log('高潮歌词', lrcs.splice(start, end-start));
                console.log('高潮时间', times[start], times[end]);
            }
        }
    }
    rem.lyric = res;
    rem.tlyric = tres;
    //console.log(rem.lyric, rem.tlyric);
}

function getSecFromTime_ms(s){
    if(typeof(s) === 'string'){
        s = s.replace('.', ':');
        var a = s.split(':');
        if(a.length > 2){
            return Number(a[0] * 60) + Number(a[1]) + Number(a[2]) / 1000;
        }
    }
    return -1;
}