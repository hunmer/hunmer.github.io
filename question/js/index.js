$(function() {
    $(document)
        .on('click', '[data-action]', function(event) {
            if (this.classList.contains('disabled')) return;
            doAction(this, this.dataset.action);
        })
    nextQuestion();
});

var g_cache = {
	last: -1,
};

function nextQuestion() {
    if (!g_cache.keys) {
        g_cache.keys = Object.keys(g_questions);
    }
    if(!g_cache.keys.length){
    	$('#content').html('<h2 class="text-center mt-3">点击右上角可以重置</h2>');
    	getDom('next').hide();
    	getDom('check').hide();
    	return alert('恭喜你已经通关了!');
    }
    // var key = arrayRandom(g_cache.keys);
    var index = ++g_cache.last;
    if(index >= g_cache.keys.length){
    	index = 0;
    }
    g_cache.last = index;
    showQuestion(g_cache.keys[index]);
}

function showQuestion(key) {
    var list = g_questions[key];
    if (!Array.isArray(list)) list = [list];

    var h = '';
    var i = 0;
    var show = 0;
    for (var item of list) {
        var answer = '';
        if(isUnderstand(item)){
        	answer = item;
        }else{
        	show++;
        }
        h += `
			<div class="input-group mt-3" data-answer="${item}">
			  <span class="input-group-text" data-action="showAnswer">${++i}</span>
			  <textarea class="form-control" placeholder="${item.substr(0, 2)}"${answer != '' ? ' readonly' : ''}>${answer}</textarea>
			</div>

			<div class="alert alert-info" style="display: none;" role="alert">
			  <b>${item}</b>
			  <div class="d-block text-end">
			  	<button class="btn btn-link text-end" data-action="${answer != '' ? 'nounderstand' : 'understand'}">${answer != '' ? '不懂' : '懂了'}</button>
			  </div>
			</div>
		`;
    }
    if (show) {
        $('#title').html(key);
          $('#content').html(h);
	    getDom('next').hide();
	    getDom('check').show();
    }else{
    	var i = g_cache.keys.indexOf(key);
    	if(i != -1) g_cache.keys.splice(i, 1);
    	console.log(key, i)
    	nextQuestion();
    }
}

function check() {
    for (var group of $('.input-group[data-answer]')) {
        group = $(group);
        if (!group.find('textarea').prop('readonly')) {
        	group.next('.alert').show();
        }
    }
    getDom('check').hide();
    getDom('next').show();
}

function doAction(dom, action) {
    action = action.split(',');
    switch (action[0]) {
    	case 'showAnswer':
    		$(dom).parents().next().show();
    		break;
    	case 'reset':
    		if(confirm('确定重置吗?')){
    			delete g_cache.keys;
    			g_config.primary = {};
    			saveConfig();
    			nextQuestion();
    		}
    		break;
    	case 'nounderstand':
        case 'understand':
            dom = $(dom);
            var answer = dom.parents().prev().html();
            if(action[1] == 'understand'){
            	g_config.primary[answer] = new Date().getTime();

            }else{
            	delete g_config.primary[answer];
            }
            saveConfig();
            dom.remove();
            break;
        case 'check':
            check();
            break;

        case 'next':
            nextQuestion();
            break;

    }
}

function saveConfig() {
    local_saveJson('config', g_config);
}

function isUnderstand(key) {
    return g_config.primary[key];
}