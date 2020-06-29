var g_a_coll = local_readJson('coll', {
  default: {count: 669, lastPlay: null},
  like: {songs: [], lastPlay: null}
});

var g_v_history = local_readJson('his', []);
$('#history span').text(g_v_history.length)

var g_likes_id = [];
for(var i in g_a_coll.like.songs){
  g_likes_id.push(g_a_coll.like.songs[i].id);
}
var g_config = local_readJson('config', {
  'index': 1,
  'playlist': 'default',
  'lastPlayId': -1,
  'playMode': 1, // iframe播放
});


function addToFavorite(key, json, coll = 'like'){
  if(g_a_coll[coll] != undefined){
    if(isFavorite(json.id, coll) === -1){
      g_a_coll[coll].songs.push(json);
      local_saveJson('coll', g_a_coll);
      $('.collection-item[key='+key+'] i').html('favorite');
      initColl(coll);
    }
  }
}

function removeFromFavorite(key, json, coll = 'like'){
  if(g_a_coll[coll] != undefined){
    var i = isFavorite(json.id, coll);
    if(i !== -1){
      g_a_coll[coll].songs.splice(i, 1);
      local_saveJson('coll', g_a_coll);
      $('.collection-item[key='+key+'] i').html('favorite_border');
      initColl(coll);
    }
  }
}


function isFavorite(id, coll = 'like'){
  console.log(id);
  for(var i=0;i<g_a_coll[coll].songs.length;i++){
    if(g_a_coll[coll].songs[i]['id'] == id){
      return i;
    }
  }
  return -1;
}

function isLike(id){
  for(var i=0;i<g_likes_id.length;i++){
    if(g_likes_id[i] == id){
      return i;
    }
  }
  return -1;
}














//$('#selecter_mode li:eq('+g_config.playMode+1+')').addClass('selected');
// 播放器本地存储信息
// 参数：键值、数据
function local_saveJson(key, data) {
    if (window.localStorage) {
        key = 'vm_' + key;    // 添加前缀，防止串用
        data = JSON.stringify(data);
        return localStorage.setItem(key, data);
    }
    return false;
}

// 播放器读取本地存储信息
// 参数：键值
// 返回：数据
function local_readJson(key, defaul = '') {
    if(!window.localStorage) return defaul;
    key = 'vm_' + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}

function getLocalItem(key, defaul = '') {
    var r = null;
    if(window.localStorage){
        r = localStorage.getItem('vm_' + key);
    }
    return r === null ? defaul : r;
}

function setLocalItem(key, value) {
    if(window.localStorage){
       return localStorage.setItem('vm_' + key, value);
    }
    return false;
}

