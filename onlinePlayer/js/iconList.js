

var icon_names = ['translate', 'like', 'collection', 'blur', 'song', 'album', 'artist', 'download', 'share-1', '3s', 'A', 'A-3', 'B-3', 'B', 'C', 'from-album', 'play', 'prev', 'next', 'state-paused', 'order-single', 'order-random', 'order-list', 'volume-low', 'volume-full', 'volume-mute'];
var default_list = {
	black: ['./images/black/'],
	white: ['./images/white/']
};
//loadIcon('white');
function loadIcon(name){
	if(default_list.hasOwnProperty(name) && rem.icon != name){
		console.log('loadStyle '+name);
		rem.icon = name;
		for(var n of icon_names){
			$('.btn-'+n).css('background-image', 'url("'+default_list[name][0]+n+'.png")');
		}
		return true;
	}
	return false;
}