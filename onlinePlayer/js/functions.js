/**************************************************
 * MKOnlinePlayer v2.4
 * 封装函数及UI交互模块
 * 编写：mengkun(https://mkblog.cn)
 * 时间：2018-3-11
 *************************************************/
// 判断是否是移动设备
var isMobile = {  
    Android: function() {  
        return navigator.userAgent.match(/Android/i) ? true : false;  
    },  
    BlackBerry: function() {  
        return navigator.userAgent.match(/BlackBerry/i) ? true : false;  
    },  
    iOS: function() {  
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;  
    },  
    Windows: function() {  
        return navigator.userAgent.match(/IEMobile/i) ? true : false;  
    },  
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());  
    }
};

$(function(){
    rem.isMobile = isMobile.any();      // 判断是否是移动设备
    rem.webTitle = document.title;      // 记录页面原本的标题
    rem.errCount = 0;                   // 连续播放失败的歌曲数归零
    
    initProgress();     // 初始化音量条、进度条（进度条初始化要在 Audio 前，别问我为什么……）
    initAudio();    // 初始化 audio 标签，事件绑定
    
    
    if(rem.isMobile) {  // 加了滚动条插件和没加滚动条插件所操作的对象是不一样的
        rem.sheetList = $("#sheet");
        rem.mainList = $("#main-list");
    } else {
        // 滚动条初始化(只在非移动端启用滚动条控件)
        $("#main-list,#sheet").mCustomScrollbar({
            theme:"minimal",
            advanced:{
                updateOnContentResize: true // 数据更新后自动刷新滚动条
            }
        });
        rem.sheetList = $("#sheet .mCSB_container");
        rem.mainList = $("#main-list .mCSB_container"); 
    }
    $("#lyric").mCustomScrollbar({
        theme:"minimal",
        // callbacks:{
        //     whileScrolling:function(e){
        //         g_v_scroll = true;
        //     },
        //     onScroll:function(){
        //         g_v_scroll = false;
        //     },
        // } ,
         advanced:{
            updateOnContentResize: true // 数据更新后自动刷新滚动条
        }
    });
    addListhead();  // 列表头
    addListbar("loading");  // 列表加载中
    
    // 顶部按钮点击处理
    $(".btn").click(function(){
        switch($(this).data("action")) {
            case "player":    // 播放器
                dataBox("player");
            break;
            case "search":  // 搜索
                searchBox();
            break;
            
            case "playing": // 正在播放
                loadList(1); // 显示正在播放列表
            break;
            
            case "sheet":   // 播放列表
                dataBox("sheet");    // 在主界面显示出音乐专辑
            break;
        }
    });
    
    // 列表项双击播放
    // $(".music-list").on("dblclick",".list-item", function() {
    //     var num = parseInt($(this).data("no"));
    //     if(isNaN(num)) return false;
    //     listClick(num);
    // });
    
    // 移动端列表项单击播放
    $(".music-list").on("click",".list-item", function() {
        //if(rem.isMobile) {
            var num = parseInt($(this).data("no"));
            if(isNaN(num)) return false;
            listClick(num);
        //}
    });
    
    // 小屏幕点击右侧小点查看歌曲详细信息
    $(".music-list").on("click",".list-mobile-menu", function() {
        var num = parseInt($(this).parent().data("no"));
        musicInfo(rem.dislist, num);
        return false;
    });
    
    // 列表鼠标移过显示对应的操作按钮
    $(".music-list").on("mousemove",".list-item", function() {
        var num = parseInt($(this).data("no"));
        if(isNaN(num)) return false;
        // 还没有追加菜单则加上菜单
        if(!$(this).data("loadmenu")) {
            var target = $(this).find(".music-name");
            var html = '<span class="music-name-cult">' + 
            target.html() + 
            '</span>' +
            '<div class="list-menu" data-no="' + num + '">' +
                '<span class="list-icon icon-play" data-function="play" title="この歌を再生します"></span>' +
                '<span class="list-icon icon-download" data-function="download" title="この歌をダウンロードします"></span>' +
                '<span class="list-icon icon-share" data-function="share_1" title="この歌をオススメします"></span>' +
            '</div>';
            target.html(html);
            $(this).data("loadmenu", true);
        }
    });
    
    // 列表中的菜单点击
    $(".music-list").on("click",".icon-play,.icon-download,.icon-share", function() {
        var num = parseInt($(this).parent().data("no"));
        if(isNaN(num)) return false;
        switch($(this).data("function")) {
            case "play":    // 播放
                listClick(num);     // 调用列表点击处理函数
            break;
            case "download":    // 下载
                ajaxUrl(musicList[rem.dislist].item[num], download);
            break;
            case "share":   // 分享
                // ajax 请求数据
                ajaxUrl(musicList[rem.dislist].item[num], ajaxShare);
            break;
            case 'share_1':
                getShareUrl(musicList[rem.dislist].item[num]);
                break;
        }
        return true;
    });
    
    // 点击加载更多
    $(".music-list").on("click",".list-loadmore", function() {
        $(".list-loadmore").removeClass('list-loadmore');
        $(".list-loadmore").html('読み込み中...');
        ajaxSearch();
    });
    
    // 点击专辑显示专辑歌曲
    $("#sheet").on("click",".sheet-cover,.sheet-name", function() {
        // :: 手动加载专辑

        var num = parseInt($(this).parent().data("no"));
        // 是用户列表，但是还没有加载数据
        if(musicList[num].item.length === 0 && musicList[num].creatorID) {
            layer.msg('リスト読み込み中...', {icon: 16,shade: 0.01,time: 500}); // 0代表加载的风格，支持0-2
            // ajax加载数据
            ajaxPlayList(musicList[num].id, num, loadList);
            return true;
        }
        loadList(num);
    });
    
    // 点击同步云音乐
    $("#sheet").on("click",".login-in", function() {
        layer.prompt(
        {
            title: 'NeteaseCloudMusicUidを入力してください',
            // value: '',  // 默认值
            btn: ['確定', 'キャンセル', '助けて'],
            btn3: function(index, layero){
                layer.open({
                    title: 'どうおを得た、NeteaseCloudMusicUid ?'
                    ,shade: 0.6 //遮罩透明度
                    ,anim: 0 //0-6的动画形式，-1不开启
                    ,content: 
                    '1、まず<a href="http://music.163.com/" target="_blank">クリック(http://music.163.com/)</a>ホームページを開け<br>' +
                    '2、そしてページ右上の「ログイン」をクリックし、登録あなたのアカウント<br>' + 
                    '3、画像をクリックして、個人センターに入ります。<br>' + 
                    '4、この時<span style="color:red">ブラウザのアドレスバー</span> <span style="color: green">/user/home?id=</span> 後ろの<span style="color:red">数字</span>はあなたのNeteaseCloudMusicUid'
                });  
            }
        },
        function(val, index){   // 输入后的回调函数
            if(isNaN(val)) {
                layer.msg('uidは数字だけです',{anim: 6});
                return false;
            }
            layer.close(index);     // 关闭输入框
            ajaxUserList(val);
        });
    });
    
    // 刷新用户列表
    $("#sheet").on("click",".login-refresh", function() {
        playerSavedata('ulist', '');
        layer.msg('更新中...');
        clearUserlist();
    });
    
    // 退出登录
    $("#sheet").on("click",".login-out", function() {
        playerSavedata('uid', '');
        playerSavedata('ulist', '');
        layer.msg('ログインを終了しました');
        clearUserlist();
    });
    
    // 播放、暂停按钮的处理
    $("#music-info").click(function(){
        if(rem.playid === undefined) {
            layer.msg('まず歌を流してください');
            return false;
        }
        musicInfo(rem.playlist, rem.playid);
    });
    
    // 播放、暂停按钮的处理
    $(".btn-play").click(function(){
        pause();
    });
    
    // 循环顺序的处理
    $(".btn-order").click(function(){
        orderChange();
    });
    // 上一首歌
    $(".btn-prev").click(function(){
        prevMusic();
    });
    
    // 下一首
    $(".btn-next").click(function(){
        nextMusic();
    });

    // 下载按钮
    $(".btn-download").click(function(){
        ajaxUrl(musicList[rem.dislist].item[rem.playid], download);
    });

    // 喜欢
    $("#like").click(function(){
        var list_id = getListIdByName('like');
        var index = idInMusicList(cfg.lastPlay, list_id);
        if(index > -1){ // 已经在喜欢列表
            removeFromMusicList_u(list_id, index);
            changeClass($(this), 'like', 'player-btn');
            layer.msg('お気に入りから削除！', {icon: 0});
        }else{
            addHis(cfg.lastPlay, 'like'); // 添加到喜欢列表
            changeClass($(this), 'liked', 'player-btn');
            layer.msg('お気に入り！', {icon: 1});
        }
    });

    // 分享按钮
    $(".btn-share-1").click(function(){
        getShareUrl(musicList[rem.dislist].item[rem.playid]);
    });

    // 模糊背景
    $("#switch_blur").click(function(){
        switchBlur();
    });

    // 开翻译
    $("#translate").click(function(){
        if(rem.tlyric == ''){
            changeClass($(this), 'translate', 'player-btn');
            layer.msg('この歌は翻訳されていません。');
            return;
        }
        if(cfg.translate){
            $('.tlrc').hide('slow', function(){
                scrollLyric(rem.audio[0].currentTime, true);
            });
            setOption('translate', false);
            changeClass($(this), 'translate', 'player-btn');
            layer.msg('翻訳オフ');
        }else{
            $('.tlrc').show('slow', function(){
                scrollLyric(rem.audio[0].currentTime, true);
            });
            setOption('translate', true);
            changeClass($(this), 'translated', 'player-btn');
            layer.msg('翻訳オープン');
        }
    });


    $('#repeatA').click(function() {
        if(cfg.setRepeat == 'A'){
            setOption('setRepeat' ,'');
            changeClass($(this), 'A', 'player-btn');
            layer.msg('キャンセルする');
            return;
        }
        if(cfg.repeatA === -1){
            setOption('setRepeat','A');
            layer.msg('歌詞をクリックして位置を設定しる');
            changeClass($(this), 'A-2', 'player-btn');
        }else{
            setOption('setRepeat','');
            setOption('repeatA', -1);
            $('.repeatA').removeClass('repeatA');
            changeClass($(this), 'A', 'player-btn');
        }
    });

     $('#repeatB').click(function() {
        if(cfg.setRepeat == 'B'){
            setOption('setRepeat','');
            changeClass($(this), 'B', 'player-btn');
            layer.msg('キャンセルする');
            return;
        }
        if(cfg.repeatB === -1){
            setOption('setRepeat','B');
            layer.msg('歌詞をクリックして位置を設定しる');
            changeClass($(this), 'B-2', 'player-btn');
        }else{
            setOption('setRepeat','');
            setOption('repeatB',-1);
            $('.repeatB').removeClass('repeatB');
            changeClass($(this), 'B', 'player-btn');
        }
    });

     $('#repeatTime').click(function() {
        if(cfg.toStartTime === -1){
              if(cfg.repeat){
                changeClass($(this), '3s-1', 'player-btn');
                 setOption('toStartTime', 3);
                layer.msg('練習モードには3秒後に再生が開始されます');
            }else{
                layer.msg('まだ練習モードではありません');
            }
        }else{
            setOption('toStartTime', -1);
            changeClass($(this), '3s', 'player-btn');
        }
    });

     $('#repeatTimeE').click(function() {
        if(cfg.toAftertime == -1){
              if(cfg.repeat){
                changeClass($(this), '3s-e', 'player-btn');
                 setOption('toAftertime', 3);
                layer.msg('練習モードには终点の時間3秒を延长します');
            }else{
                layer.msg('まだ練習モードではありません');
            }
        }else{
            setOption('toAftertime', -1);
            changeClass($(this), '3s', 'player-btn');
        }
    });

     $('#repeatStop').click(function() {
        setOption('setRepeat','');
        if(cfg.repeat){
            $('.repeatA').addClass('repeat-default');
            $('.repeatB').addClass('repeat-default');
            changeClass($('#repeatA'), 'A-3', 'player-btn');
            changeClass($('#repeatB'), 'B-3', 'player-btn');
            changeClass($('#repeatC'), 'C-1', 'player-btn');
            layer.msg('練習モードはオフ');
        }else{
            $('.repeatA').removeClass('repeat-default');
            $('.repeatB').removeClass('repeat-default');
            if(cfg.repeatA !== -1){
                changeClass($('#repeatA'), 'A-1', 'player-btn');
            }else{
                changeClass($('#repeatA'), 'A', 'player-btn');
            }

            if(cfg.repeatB !== -1){
                changeClass($('#repeatB'), 'B-1', 'player-btn');
            }else{
                changeClass($('#repeatB'), 'B', 'player-btn');
            }
            changeClass($(this), 'C', 'player-btn');
            layer.msg('練習モードはオン');
        }
        setOption('repeat', !cfg.repeat);
    });

    // 静音按钮点击事件
    $(".btn-quiet").click(function(){
        var oldVol = Number(cfg.volume);     // 之前的音量值
        if(isNaN(oldVol)) oldVol = 0;
        var newVol = oldVol + 0.2;
        if(newVol > 1){
            newVol = 0;
            changeClass($(this), 'volume-mute', 'player-btn btn-quiet');// 开启静音
        }else{
            if(newVol > 0.5){
                changeClass($(this), 'volume-full', 'player-btn btn-quiet');// 大音量
            }else{
                changeClass($(this), 'volume-low', 'player-btn btn-quiet');// 小音量
            }
        }
        console.log(oldVol, newVol);
        setOption('volume', newVol);
        volume_bar.goto(newVol);    // 刷新音量显示
        if(rem.audio[0] !== undefined) rem.audio[0].volume = newVol;  // 应用音量
    });
    // 图片加载失败处理
    $('img').error(function(){
        $(this).attr('src', 'images/player_cover.png');
    });
    
    // 初始化播放列表
    initList(); 
    // 初始化abd段播放列表
    repeatList = playerReaddata('repeatList', {});
    console.log(repeatList);
});

// 展现系统列表中任意首歌的歌曲信息
function musicInfo(list, index) {
    var music = musicList[list].item[index];
    var tempStr = '<span class="info-title">歌の名前：' + music.name + '</span>'+
    '<br><span class="info-title">歌手：' + music.artist + '</span>'+
    '<br><span class="info-title">アルバム：' + music.album+ '</span>';
    
    if(list == rem.playlist && index == rem.playid) {   // 当前正在播放这首歌，那么还可以顺便获取一下时长。。
        tempStr += '<br><span class="info-title">長さ：' + formatTime(rem.audio[0].duration) + '</span>';
    }
    
    tempStr += '<br><span class="info-title">操作：</span>' + 
    '<span class="info-btn" onclick="thisDownload(this)" data-list="' + list + '" data-index="' + index + '">ダウンロード</span>' + 
    '<span class="info-btn" onclick="thisShare(this)" data-list="' + list + '" data-index="' + index + '">再生アドレス</span>' +
    '<span class="info-btn" onclick="getShareUrl(this)" data-list="' + list + '" data-index="' + index + '">おすすめします</span>'
    ;
    
    layer.open({
        type: 0,
        shade: false,
        title: false, //不显示标题
        btn: false,
        content: tempStr
    });
    
    if(mkPlayer.debug) {
        console.info('id: "' + music.id + '",\n' + 
        'name: "' + music.name + '",\n' +
        'artist: "' + music.artist + '",\n' +
        'album: "' + music.album + '",\n' +
        'source: "' + music.source + '",\n' +
        'url_id: "' + music.url_id + '",\n' + 
        'pic_id: "' + music.pic_id + '",\n' + 
        'lyric_id: "' + music.lyric_id + '",\n' + 
        'pic: "' + music.pic + '",\n' +
        'url: ""');
        // 'url: "' + music.url + '"');
    }
}

// 展现搜索弹窗
function searchBox() {
    var tmpHtml = '<form onSubmit="return searchSubmit()"><div id="search-area">' + 
    '    <div class="search-group">' + 
    '        <input type="text" name="wd" id="search-wd" placeholder="歌手、歌名、アルバム検索" autofocus required>' + 
    '        <button class="search-submit" type="submit">検索</button>' + 
    '    </div>' + 
    '    <div class="radio-group" id="music-source">' + 
    '       <label><input type="radio" name="source" value="netease" checked=""> NeteaseCloudMusic</label>' + 
    '       <label><input type="radio" name="source" value="tencent"> QQ</label>' + 
    '       <label><input type="radio" name="source" value="xiami"> xiami</label>' + 
    '       <label><input type="radio" name="source" value="kugou"> kugou</label>' + 
    '       <label><input type="radio" name="source" value="baidu"> baidu</label>' + 
    '   </div>' + 
    '</div></form>';
    layer.open({
        type: 1,
        shade: false,
        title: false, // 不显示标题
        shade: 0.5,    // 遮罩颜色深度
        shadeClose: true,
        content: tmpHtml,
        cancel: function(){
        }
    });
    
    // 恢复上一次的输入
    $("#search-wd").focus().val(rem.wd);
    $("#music-source input[name='source'][value='" + rem.source + "']").prop("checked", "checked");
}

// 搜索提交
function searchSubmit() {
    var wd = $("#search-wd").val();
    if(!wd) {
        layer.msg('検索内容を入力してください', {anim:6, offset: 't'});
        $("#search-wd").focus();
        return false;
    }
    rem.source = $("#music-source input[name='source']:checked").val();
    
    layer.closeAll('page');     // 关闭搜索框
    
    rem.loadPage = 1;   // 已加载页数复位
    rem.wd = wd;    // 搜索词
    ajaxSearch();   // 加载搜索结果
    return false;
}

// 下载正在播放的这首歌
function thisDownload(obj) {
    ajaxUrl(musicList[$(obj).data("list")].item[$(obj).data("index")], download);
}

// 分享正在播放的这首歌
function thisShare(obj) {
    ajaxUrl(musicList[$(obj).data("list")].item[$(obj).data("index")], ajaxShare);
}

// 分享正在播放的这首歌 - 站内
function getShareUrl(music){
    var tmpHtml = '<p>' + music.artist + ' - ' + music.name + ' 再生アドレス : </p>' + 
    '<input class="share-url" onmouseover="this.focus();this.select()" value="' + window.location.protocol+'//'+window.location.host+window.location.pathname+'?t=i&i='+music.id + '">';
    layer.open({
        title: '再生アドレス'
        ,content: tmpHtml
    });
    // todo: 添加到推荐列表第一位,要更新播放位置
    // addHis(obj, 'share');
    // if(rem.dislist == 3) {
    //     refreshList();  // 更新列表显示
    // }
}

// 下载歌曲
// 参数：包含歌曲信息的数组
function download(music) {
    if(music.url == 'err' || music.url == "" || music.url == null) {
        layer.msg('この歌のダウンロードを支持しない');
        return;
    }
    openDownloadDialog(music.url, music.name + ' - ' + music.artist);
}

/**
 * 通用的打开下载对话框方法，没有测试过具体兼容性
 * @param url 下载地址，也可以是一个blob对象，必选
 * @param saveName 保存文件名，可选
 * http://www.cnblogs.com/liuxianan/p/js-download.html
 */
function openDownloadDialog(url, saveName)
{
    if(typeof url == 'object' && url instanceof Blob)
    {
        url = URL.createObjectURL(url); // 创建blob地址
    }
    var aLink = document.createElement('a');
    aLink.href = url;
    aLink.target = "_blank";
    aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
    var event;
    if(window.MouseEvent) event = new MouseEvent('click');
    else
    {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}

// 获取外链的ajax回调函数
// 参数：包含音乐信息的数组
function ajaxShare(music) {
    if(music.url == 'err' || music.url == "" || music.url == null) {
        layer.msg('取得できない');
        return;
    }
    
    var tmpHtml = '<p>' + music.artist + ' - ' + music.name + ' 再生アドレス : </p>' + 
    '<input class="share-url" onmouseover="this.focus();this.select()" value="' + music.url + '">' + 
    '<p class="share-tips">* 再生アドレスは一定時間後に無効になります。</p>';
    
    layer.open({
        title: '再生アドレス'
        ,content: tmpHtml
    });
}

// 改变右侧封面图像
// 新的图像地址
function changeCover(music) {
    var img = music.pic;    // 获取歌曲封面
    
    if(!img) {  // 封面为空
        ajaxPic(music, changeCover);    // 获取歌曲封面图
        img == "err";    // 暂时用无图像占个位...
    }
    
    if(img == "err") {
        img = "images/player_cover.png";
    }
    $("#music-cover").attr("src", img);     // 改变右侧封面
    $(".sheet-item[data-no='1'] .sheet-cover").attr('src', img);    // 改变正在播放列表的图像
    blurImg(img);
}

function blurImg(image){
    if(cfg.blur){
        rem.blurImg = image;
        $('#blur-img').backgroundBlur({
            blurAmount :10, // 模糊度
            imageClass : 'bg-blur',
            overlayClass : 'tinted-bg-overlay',
            duration: 3000, // 图片淡出时间
            endOpacity : 0.7 // 图像最终的不透明度
        }).backgroundBlur(image);
        console.log(image);
        window.setTimeout(function(){
            blurText();
        }, 500);
    }
}


// 向列表中载入某个播放列表
function loadList(list) {
    if(musicList[list].isloading === true) {
        layer.msg('読み込み中...', {icon: 16,shade: 0.01,time: 500});
        return true;
    }
    
    rem.dislist = list;     // 记录当前显示的列表
    dataBox("list");    // 在主界面显示出播放列表
    
    // 调试信息输出
    if(mkPlayer.debug) {
        if(musicList[list].id) {
            console.log('加载播放列表 ' + list + ' - ' + musicList[list].name + '\n' +
            'id: ' + musicList[list].id + ',\n' +
            'name: "' + musicList[list].name + '",\n' +
            'cover: "' + musicList[list].cover + '",\n' +
            'item: []');
        } else {
            console.log('加载播放列表 ' + list + ' - ' + musicList[list].name);
        }
    }
    
    rem.mainList.html('');   // 清空列表中原有的元素
    addListhead();      // 向列表中加入列表头

    if(musicList[list].item.length == 0) {
        addListbar("nodata");   // 列表中没有数据
    } else {

        if(list > rem.systemList){ // 用户歌单
            // 记录最后打开歌单
            cfg.lastlist.id = musicList[list].id;
            cfg.lastlist.source = musicList[list].source;
            console.log('debug:>记录最后打开歌单',cfg.lastlist);
        }
        
        // 逐项添加数据
        for(var i=0; i<musicList[list].item.length; i++) {
            var tmpMusic = musicList[list].item[i];
            
            addItem(i + 1, tmpMusic);
            
            // 音乐链接均有有效期限制,重新显示列表时清空处理
            // TODO 不重置自定义的列表
            //if(list == 1 || list == 2){
                tmpMusic.url = "";
            //}
            if(tmpMusic.id === cfg.lastPlay.id && tmpMusic.source === cfg.lastPlay.source){
                rem.dislist = list;
                rem.playid = i;
                console.log('debug:>找到最后打开音乐',tmpMusic);
            }
        }
        
        // 列表加载完成后的处理
        if(list == 1 || list == 2) {    // 历史记录和正在播放列表允许清空
            addListbar("clear");    // 清空列表
        }
        
        if(rem.playlist === undefined) {    // 未曾播放过
            if(mkPlayer.autoplay == true) pause();  // 设置了自动播放，则自动播放
        } else {
            refreshList();  // 刷新列表，添加正在播放样式
        }
        
        listToTop();    // 播放列表滚动到顶部
    }
}

// 播放列表滚动到顶部
function listToTop() {
    if(rem.isMobile) {
        $("#main-list").animate({scrollTop: 0}, 200);
    } else {
        $("#main-list").mCustomScrollbar("scrollTo", 0, "top");
    }
}

// 向列表中加入列表头
function addListhead() {
    var html = '<div class="list-item list-head">' +
    '    <span class="music-album">' +
    '        アルバム' +
    '    </span>' +
    '    <span class="auth-name">' +
    '        歌手' +
    '    </span>' +
    '    <span class="music-name">' +
    '        歌曲' +
    '    </span>' +
    '</div>';
    rem.mainList.append(html);
}

// 列表中新增一项
// 参数：编号、名字、歌手、专辑
function addItem(no, music) {
    var html = '<div class="list-item" data-no="' + (no - 1) + '" data-key="'+music.id+'-'+music.source+'">' +
    '    <span class="list-num">' + no + '</span>' +
    '    <span class="list-mobile-menu"></span>' +
    '    <span class="music-album">' + music.album + '</span>' +
    '    <span class="auth-name">' + music.artist + '</span>' +
    '    <span class="music-name">' + music.name + '</span>' +
    '</div>'; 
    rem.mainList.append(html);
}

// 加载列表中的提示条
// 参数：类型（more、nomore、loading、nodata、clear）
function addListbar(types) {
    var html
    switch(types) {
        case "more":    // 还可以加载更多
            html = '<div class="list-item text-center list-loadmore list-clickable" title="より多くのデータをロード" id="list-foot">より多くのデータをロード...</div>';
        break;
        
        case "nomore":  // 数据加载完了
            html = '<div class="list-item text-center" id="list-foot">読み込み完了</div>';
        break;
        
        case "loading": // 加载中
            html = '<div class="list-item text-center" id="list-foot">プレイリストの読み込み中...</div>';
        break;
        
        case "nodata":  // 列表中没有内容
            html = '<div class="list-item text-center" id="list-foot">何もありません</div>';
        break;
        
        case "clear":   // 清空列表
            html = '<div class="list-item text-center list-clickable" id="list-foot" onclick="clearDislist();">リストをクリア</div>';
        break;
    }
    rem.mainList.append(html);
}

// 将时间格式化为 00:00 的格式
// 参数：原始时间
function formatTime(time){    
	var hour,minute,second;
	hour = String(parseInt(time/3600,10));
	if(hour.length == 1) hour='0' + hour;
	
	minute=String(parseInt((time%3600)/60,10));
	if(minute.length == 1) minute='0'+minute;
	
	second=String(parseInt(time%60,10));
	if(second.length == 1) second='0'+second;
	
	if(hour > 0) {
	    return hour + ":" + minute + ":" + second;
	} else {
	    return minute + ":" + second;
	}
}

// url编码
// 输入参数：待编码的字符串
function urlEncode(String) {
    return encodeURIComponent(String).replace(/'/g,"%27").replace(/"/g,"%22");	
}

// 在 ajax 获取了音乐的信息后再进行更新
// 参数：要进行更新的音乐
function updateMinfo(music) {
    // 不含有 id 的歌曲无法更新
    if(!music.id) return false;
    
    // 循环查找播放列表并更新信息
    for(var i=0; i<musicList.length; i++) {
        for(var j=0; j<musicList[i].item.length; j++) {
            // ID 对上了，那就更新信息
            if(musicList[i].item[j].id == music.id && musicList[i].item[j].source == music.source) {
                musicList[i].item[j] == music;  // 更新音乐信息
                j = musicList[i].item.length;   // 一个列表中只找一首，找到了就跳出
            }
        }
    }
}

// 刷新当前显示的列表，如果有正在播放则添加样式
function refreshList() {
    // 还没播放过，不用对比了
    if(rem.playlist === undefined) return true;
    
    $(".list-playing").removeClass("list-playing");        // 移除其它的正在播放
    
    if(rem.paused !== true) {   // 没有暂停
        for(var i=0; i<musicList[rem.dislist].item.length; i++) {
            // 与正在播放的歌曲 id 相同
            if((musicList[rem.dislist].item[i].id !== undefined) && 
              (musicList[rem.dislist].item[i].id == musicList[1].item[rem.playid].id) && 
              (musicList[rem.dislist].item[i].source == musicList[1].item[rem.playid].source)) {
                $(".list-item[data-no='" + i + "']").addClass("list-playing");  // 添加正在播放样式
                textUpdate();
                return true;    // 一般列表中只有一首，找到了赶紧跳出
            }
        }
    }
    
}

// 添加一个歌单
// 参数：编号、歌单名字、歌单封面
function addSheet(no, name, cover) {
    if(!cover) cover = "images/player_cover.png";
    if(!name) name = "読み込み中...";
    
    var html = '<div class="sheet-item" data-no="' + no + '">' +
    '    <img class="sheet-cover" src="' +cover+ '">' +
    '    <p class="sheet-name">' +name+ '</p>' +
    '</div>'; 
    rem.sheetList.append(html);
}
// 清空歌单显示
function clearSheet() {
    rem.sheetList.html('');
}

// 歌单列表底部登陆条
function sheetBar() {
    var barHtml;
    if(playerReaddata('uid')) {
        barHtml = '[ID:' + rem.uname + '] 同期しました! <span class="login-btn login-refresh">[更新]</span> <span class="login-btn login-out">[終了]</span>';
    } else {
        barHtml = '自分の歌リスト <span class="login-btn login-in">[同期]</span>';
    }
    barHtml = '<span id="sheet-bar"><div class="clear-fix"></div>' +
    '<div id="user-login" class="sheet-title-bar">' + barHtml + 
    '</div></span>'; 
    rem.sheetList.append(barHtml);
}

// 选择要显示哪个数据区
// 参数：要显示的数据区（list、sheet、player）
function dataBox(choose) {
    $('.btn-box .active').removeClass('active');
    switch(choose) {
        case "list":    // 显示播放列表
            if($(".btn[data-action='player']").css('display') !== 'none') {
                $("#player").hide();
            } else if ($("#player").css('display') == 'none') {
                $("#player").fadeIn();
            }
            $("#main-list").fadeIn();
            $("#sheet").fadeOut();
            if(rem.dislist == 1 || rem.dislist == rem.playlist) {  // 正在播放
                $(".btn[data-action='playing']").addClass('active');
            } else if(rem.dislist == 0) {  // 搜索
                $(".btn[data-action='search']").addClass('active');
            }
        break;
        
        case "sheet":   // 显示专辑
            if($(".btn[data-action='player']").css('display') !== 'none') {
                $("#player").hide();
            } else if ($("#player").css('display') == 'none') {
                $("#player").fadeIn();
            }
            $("#sheet").fadeIn();
            $("#main-list").fadeOut();
            $(".btn[data-action='sheet']").addClass('active');
        break;
        
        case "player":  // 显示播放器
            $("#player").fadeIn();
            $("#sheet").fadeOut();
            $("#main-list").fadeOut();
            $(".btn[data-action='player']").addClass('active');
            scrollLyric(rem.audio[0].currentTime, true); 
        break;

        default:
            return;
    }
    rem.viewWindow = choose;
}

// 将当前歌曲加入列表,模式添加到播放历史
// 参数：要添加的音乐
function addHis(music, list = 'his') {
    if(rem.playlist == 2) return true;  // 在播放“播放记录”列表则不作改变
    index = getListIdByName(list);
    if(musicList[index].item.length > 300) musicList[index].item.length = 299; // 限定播放历史最多是 300 首
    
    if(music.id !== undefined && music.id !== '') {
        // 检查历史数据中是否有这首歌，如果有则提至前面
        for(var i=0; i<musicList[index].item.length; i++) {
            if(musicList[index].item[i].id == music.id && musicList[index].item[i].source == music.source) {
                musicList[index].item.splice(i, 1); // 先删除相同的
                i = musicList[index].item.length;   // 找到了，跳出循环
            }
        }
    }
    
    // 再放到第一位
    musicList[index].item.unshift(music);
    playerSavedata(list, musicList[index].item);  // 保存播放历史列表
}


// 初始化播放列表
function initList() {
    // 登陆过，那就读取出用户的歌单，并追加到系统歌单的后面
    if(playerReaddata('uid')) {
        rem.uid = playerReaddata('uid');
        rem.uname = playerReaddata('uname');
        // musicList.push(playerReaddata('ulist'));
        var tmp_ulist = playerReaddata('ulist');    // 读取本地记录的用户歌单
        
        if(tmp_ulist) musicList.push.apply(musicList, tmp_ulist);   // 追加到系统歌单的后面
    }

    var j = {};
    // 获取链接分享信息
    // i - id
    // t - 类型, 每填默认 单曲
    // s - 平台 没填默认网易云
    mkPlayer.defaultlist = getListIdByName('playing'); // 默认显示正在播放歌单
   if(_GET['i'] != undefined){
        j.id = _GET['i'];
        // 解析链接
        if(j.id.substr(0, 4) == 'http' || j.id.substr(0, 5) == 'https'){
            var s;
            if((s = getTextbyStartAndEnd_string(j.id+'&', 'song?id=', '&')) != '') { // 单曲
                j.id = s;
                _GET['t'] = 'i';
            }else
            if((s = getTextbyStartAndEnd_string(j.id+'&', 'playlist?id=', '&')) != ''){ // 歌单
                j.id = s;
                _GET['t'] = 'p';
            }else{
                console.log('不支持的url '+j.id);
            }
            //http://music.163.com/song?id=1418533677&userid=381754034
            //http://music.163.com/playlist?id=4908905437&userid=381754034
        }
        j.source = getParam('s', 'netease');
        switch(getParam('t', 'i')){
            case 'p': // playlist
                // 加入歌单
                musicList.push({
                    id: j.id
                });
                mkPlayer.defaultlist = musicList.length - 1; // 设为默认
                window.history.replaceState(null,null,window.location.protocol+'//'+window.location.host+window.location.pathname); // 删除网址参数
                break;

            case 'a': // artist
                break;

            case 'i': // 单曲
                break;
        }
    }
    console.log(j);

    // 加载歌单信息
    for(var i=1; i<musicList.length; i++) {

        var name = getListNameById(i);
        if(name != ''){ // 系统歌单,没有id
            var tmp_item = playerReaddata(name);
            if(tmp_item) {  // 读取到了正在播放列表
                musicList[i].item = tmp_item;
            }
            switch(name){
                case 'share': // 推荐列表
                    if(j && _GET['t'] == 'i'){ // 分享歌曲
                        addHis(j, 'share'); // 添加到推荐列表
                        mkPlayer.defaultlist = i; // 显示推荐列表
                    }
                    break;
            }
        }else{
            if(!musicList[i].creatorID && (musicList[i].item == undefined || (i>2 && musicList[i].item.length == 0))) {   
                musicList[i].item = [];
                if(musicList[i].id) {   // 列表ID已定义
                    // ajax获取列表信息
                    ajaxPlayList(musicList[i].id, i);

                    if(!j){
                        // 回到上次播放的歌单
                        var k = musicList[i].id; // TODO 增加歌单标识符
                        if(k == cfg.lastlist.id){
                            mkPlayer.defaultlist = i;
                        }
                    }
                } else {    // 列表 ID 未定义
                    if(!musicList[i].name) musicList[i].name = '名前なし';
                }
            }
        }
        // 在前端显示出来
        addSheet(i, musicList[i].name, musicList[i].cover);
    }
    
    // 登陆了，但歌单又没有，说明是在刷新歌单
    if(playerReaddata('uid') && !tmp_ulist) {
        ajaxUserList(rem.uid);
        return true;
    }
    if(musicList[mkPlayer.defaultlist].isloading !== true)  loadList(mkPlayer.defaultlist);
    
    // 显示最后一项登陆条
    sheetBar();
}

// 清空用户的同步列表
function clearUserlist() {
    if(!rem.uid) return false;
    
    // 查找用户歌单起点
    for(var i=1; i<musicList.length; i++) {
        if(musicList[i].creatorID !== undefined && musicList[i].creatorID == rem.uid) break;    // 找到了就退出
    }
    
    // 删除记忆数组
    musicList.splice(i, musicList.length - i); // 先删除相同的
    musicList.length = i;
    
    // 刷新列表显示
    clearSheet();
    initList();
}

// 清空当前显示的列表
function clearDislist() {
    musicList[rem.dislist].item.length = 0;  // 清空内容
    if(rem.dislist == 1) {  // 正在播放列表
        playerSavedata('playing', '');  // 清空本地记录
        $(".sheet-item[data-no='1'] .sheet-cover").attr('src', 'images/player_cover.png');    // 恢复正在播放的封面
    } else if(rem.dislist == 2) {   // 播放记录
        playerSavedata('his', '');  // 清空本地记录
    }
    layer.msg('リストが空になりました');
    dataBox("sheet");    // 在主界面显示出音乐专辑
}

// 刷新播放列表，为正在播放的项添加正在播放中的标识
function refreshSheet() {
    // 调试信息输出
    if(mkPlayer.debug) {
        console.log("开始播放列表 " + musicList[rem.playlist].name + " 中的歌曲");
    }
    
    $(".sheet-playing").removeClass("sheet-playing");        // 移除其它的正在播放
    $(".sheet-item[data-no='" + rem.playlist + "']").addClass("sheet-playing"); // 添加样式
}
