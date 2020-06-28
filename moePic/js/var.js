var g_v_api = 'https://neysummer-moepic.glitch.me';
//var g_v_api = '.';
var g_v_imglist = {
	yande: {'prev': true, 'orgin': true},
	konachan: {},
	danbooru: {},
	behoimi: {},
	safebooru: {},
	gelbooru: {},
	worldcosplay: {},
	kawaiinyan: {},
	bilibili: {'prev': true},
	lolibooru: {},
	rule34: {'r18': true},
	hypnohub: {'r18': true},
	e621: {},
	e926: {},
	minitokyo: {},
	shuushuu: {},
	zerochan: {},
	anime_picture: {},
	sankakucomplex: {'prev': true}
};
for(var i in g_v_imglist){
	g_v_imglist[i].imgs = [];
	g_v_imglist[i].ids = [];
	g_v_imglist[i].lastId = 0;
}
var g_s_host = '';
var g_i_page = 1;
var g_i_index = 0;
var g_b_loading = false;
var g_i_lastloading = 0;

var g_v_http = {
	start: 0,
	timeout: 10000,
	http: []
}


var g_v_search = {
	'host': 'konachan',
	'type': 'post',
	'page': 1,
	'url': '',
	'proxy': false,
	'limit': 40,

};

// var g_v_api = 'http://47.107.143.28/moePIC';