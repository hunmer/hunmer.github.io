$(function() {
    $(document)
        .on('click', '[data-action]', function(event) {
            if (this.classList.contains('disabled')) return;
            doAction(this, this.dataset.action);
        })
    nextQuestion();
});

var g_cache = {};

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
    var key = arrayRandom(g_cache.keys);
    showQuestion(key);
}

function showQuestion(key) {
	console.log(key);
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
			  <span class="input-group-text">${++i}</span>
			  <textarea class="form-control" placeholder="${item.substr(0, 2)}"${answer != '' ? ' readonly' : ''}>${answer}</textarea>
			</div>
		`;
    }
    console.log(show);
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
            var answer = group.attr('data-answer');
            $(`
				<div class="alert alert-info" role="alert">
				  <b>${answer}</b>
				  <div class="d-block text-end">
				  	<button class="btn btn-link text-end" data-action="understand">懂了</button>
				  </div>
				</div>
			`).insertAfter(group);
        }
    }
    getDom('check').hide();
    getDom('next').show();
}

function doAction(dom, action) {
    action = action.split(',');
    switch (action[0]) {
    	case 'reset':
    		if(confirm('确定重置吗?')){
    			delete g_cache.keys;
    			g_config.primary = {};
    			saveConfig();
    			nextQuestion();
    		}
    		break;
        case 'understand':
            dom = $(dom);
            var answer = dom.parents().prev().html();
            console.log(answer, dom)
            g_config.primary[answer] = new Date().getTime();
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