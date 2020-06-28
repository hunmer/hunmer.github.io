var _GET = getGETArray(window.location.search);

function getGETArray(s_url){
	if(s_url === '') return [];
	
	var a_result = [], a_exp;
	var a_params = s_url.slice(1).split('&');
	for(var k in a_params){
		a_exp = a_params[k].split('=');
		if(a_exp.length > 1){
			var key = a_exp.splice(0, 1, a_exp);
			var value = a_exp.join('=')
			a_result[key] = value.substr(1, value.length-1);
		} 
	}
	return a_result;
}

function getParam(k, df = ''){
	return _GET[k] != undefined ? _GET[k] : df;
}

 function getLen(str){
    var len = str.length;
    var relen = 0;
    
    for(var i=0; i<len; i++)
    {
          if(str.charCodeAt(i) <27 || str.charCodeAt(i) >126 )
          {
              relen += 2;
          }else
          {
              relen ++;
          }
    }
    return relen;
}

function getTextbyStartAndEnd_string(s_text, s_start, s_end, i_start = 0, b_save = false){
	i_start = s_text.indexOf(s_start, i_start);
	if(i_start === -1) return '';
	i_start += s_start.length;
	i_end = s_text.indexOf(s_end, i_start);
	if(i_end === -1) return '';
	if(b_save){
		return s_start+ s_text.substr(i_start, i_end-i_start) +s_end;
	}else{
		return s_text.substr(i_start, i_end-i_start);
	}
}