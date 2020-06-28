function scrollTimeTask(){
	if(rem.returnLrc != -1){
        clearTimeout(rem.returnLrc);
    }
    g_b_mmove = true;
    rem.returnLrc = window.setTimeout(function(){
    	g_b_mmove = false;
        rem.returnLrc = -1;
        scrollLyric(rem.audio[0].currentTime, true);
    }, 1000);
}

// newClass 后面加空格
function changeClass(selecter, keyName, newClass){
	if(!typeof(selecter) == 'object'){
		selecter = $(selecter);
	}
	if(newClass != ''){
		if(newClass.substr(-1) != ' '){
			newClass = newClass + ' ';
		}
	}
	selecter.css('background-image', '').attr('class', newClass+'btn-'+keyName);
	if(icon_names.indexOf(keyName) != -1 && rem.icon != 'black'){
		selecter.css('background-image', 'url('+default_list[rem.icon]+keyName+'.png)');
	}
}

function resetRepeat(){
	changeClass($('#repeatB'), 'A', 'player-btn');
	changeClass($('#repeatA'), 'B', 'player-btn');
	changeClass($('#repeatStop'), 'C', 'player-btn');
	changeClass($('#repeatTime'), '3s', 'player-btn');
    $('.repeatA').removeClass('repeatA');
    $('.repeatB').removeClass('repeatB');
}

function idInMusicList(music, index){
	if(index <= musicList.length){
		 for(var i=0; i<musicList[index].item.length; i++) {
	        if(musicList[index].item[i].id == music.id && musicList[index].item[i].source == music.source) {
	        	return i;
	        }
	    }
	}
    return -1;
}

// i_playlis 歌单id
// i 数组索引
function removeFromMusicList_u(i_playlist, i){
	console.log(i_playlist, i);
    if(typeof(musicList[i_playlist].item.splice(i, 1)) == 'object'){
		return playerSavedata(getListNameById(i_playlist), musicList[i_playlist].item);  // 保存
    }
    return false;
}

function getBlurImg(){
	return rem.isMobile ? $("#mobile-blur").css('background-image') : $("#blur-img").css('background-image'); 
}

function switchBlur(enable = null, image = ''){
	if(enable === null) enable = !cfg.blur;
	console.log(enable, image);
	if(enable){
		if(image == '') image = cfg.lastPlay.pic;
		changeClass($('#switch_blur'), 'blur-1', 'player-btn');
		$('#blur-img').backgroundBlur().fadeIn('slow'); // 展示

		if(image != rem.blurImg){ // 已经模糊过此图片
			blurImg(image);
		}
	}else{
		//rem.blurImg = '';
		changeClass($('#switch_blur'), 'blur', 'player-btn');
		$('#blur-img').backgroundBlur().fadeOut('slow'); // 隐藏
	}
	setOption('blur', enable);
	//$('body').css('color', enable ? 'black' : 'white');
}


function getListNameById(id){
	if(!isRealNum(id)) return id;
	 switch(id){
	 	case 0: return 'search';
	 	case 1: return 'playing';
	 	case 2: return 'his';
	 	case 3: return 'share';
	 	case 4: return 'like';
    }
    return '';
}

function getListIdByName(list){
	if(isRealNum(list)) return list;
	 switch(list){
	 	case 'search':
            index = 0;
            break;

        case 'playing':
            index = 1;
            break;

        case 'his':
            index = 2;
            break;

        case 'share':
            index = 3;
            break;

        case 'like':
            index = 4;
            break;

        default:
            index = 1;
    }
    return index;
}

function isRealNum(val){
    // 先判定是否为number
    if(typeof val !== 'number'){
      return false;
    }
    if(!isNaN(val)){
        return true;
    }else{
        return false;
    }
}


function blurText(){
	RGBaster.colors($("#music-cover")[0], {
	paletteSize: 3,
	exclude: [],
	success: function(payload) {

	    $('.mkpgb-dot').css('background-color', payload.dominant); // 进度光标
	    $('.mkpgb-cur').css('background-color', 'rgba(60, 240, 103, 0.83)'); // 已播放

	    // 取最相近的rgb
	    console.log(payload.dominant);

	    var a = payload.dominant.substr(4, payload.dominant.length - 5).split(',');
	    console.log(a);

	    var r = parseInt(a[0]);
	    var g = parseInt(a[1]);
	    var b = parseInt(a[2]);
	    rem.color = 'rgb('+r+','+g+','+b+')'; // 主题颜色

	    var nr, ng, nb;
	    if(r > 125 || g > 125 || b > 125){
	    	// 暗色
	    	nr = 0;
	    	ng = 0;
	    	nb = 0;
			loadIcon('black');
	    }else{
	    	// 亮色
	    	nr = 255;
	    	ng = 255;
	    	nb = 255;
			loadIcon('white');
	    }

	    // var nr = 255 - r;
	    // var ng = 255 - g;
	    // var nb = 255 - b;

	    rem.dbcolor = 'rgb('+nr+','+ng+','+nb+')'; // 字体对比色
	    // text-shadow:0 0 0.2em #f87,-0 -0 0.2em #f87;

	    $('.mkpgb-bar').css('background-color', rem.dbcolor); // 未播放进度

	    $('body').
	    css('color', rem.dbcolor). // 字体颜色
	    css('text-shadow', '0 0 0.1em rgb(0, 0, 0),-0 -0 0.2em '+rem.dbcolor) // 字体阴影

	    if(rem.css.length > 0){
	        rem.css.remove();
	    }

	    rem.css = $('<style>.dbcolor{color: rgb(255, 255, 255, 1);background-color: rgb(0, 0, 0 ,0.2);}</style>'); // 创建css样式
	    $('body').append(rem.css);

	    $('.list-playing').css('color', rem.color); // 播放项使用主题色,对比
	}
	});
}