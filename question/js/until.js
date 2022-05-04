
var g_questions = {
    用户第一: [
        '尊重他人,随时随地维护聚杰汇的形象',
        '持续输出对用户有价值的内容',
        '具有超强的服务意识,防患于未然',
        '微笑面对投诉和受到的委屈,工作中积极主动的为用户解决问题',
        '委为站在用户的立场思考问题,在坚持原则的基础上,最终达到客户和公司都满意',
    ],
    结果为王: [
        '尊重他人,随时随地维护聚杰汇的形象',
        '今天的事不推到明天,上班时间只做与工作有关的事情',
        '不断设定更高的目标,今天的表现是明天最低的要求',
        '持续学习,自我完善,做事情充分体现以结果为导向',
        '能根据轻重缓急来正确安排工作的优先级,做正确的事',
        '遵循必要的工作流程,没有因工作失职而造成重大错误',
    ],
    拥抱变化: [
        '适应公司的日常变化,不抱怨',
        '面对变化,理性对待,充分沟通,积极配合',
        '创造变化,并带来突破性的提高',
        '工作中具有超强的成长意识,建立新方法、新思路',
        '对变化产生的困难和挫折能自我调整,并正面影响和带动同事',
    ],
    积极向上: [
        '为梦想而工作,以乐观、开放的心态面对日常的工作和生活',
        '对自己的职业和公司要充满感恩之心、敬畏之心',
        '喜欢自己的工作,认同聚杰汇的企业文化',
        '积极正面的影响团队,改善团队的士气和氛围',
        '碰到困难和挫折的时候永不放弃,不断自我激励,努力提升业绩',
    ],
    诚信正直: [
        '言行一致,待人待己,都用真心诚意去相待',
        '通过正确的渠道和流程,准确表达自己的观点',
        '勇于承认错误,敢于承担责任,并及时改正',
        '对损害公司利益的不诚信行为正确有效的制止',
        '不传播未经证实的消息,不在背后不负责任的议论人和事,并能正面指导',
    ],
    团队合作: [
        '有主人公的意识,在团队中顾全大局,不计较个人得失',
        '充分参与团队讨论,决策前发表建设性意见',
        '积极主动分享业务知识和经验,善于利用团队的力量解决困难和问题',
        '融入团队,乐于接受同事的帮助,积极配合团队完成工作',
        '善于和不同类型的同事合作,不将个人喜好带入工作,充分体现对事不对人的原则',
    ],
    使命: '帮助更多创业者通过互联网实现梦想',
    愿景: '在互联网领域服务1亿以上消费者,成为一家真正有社会责任感的互联网公司',
    核心价值观: ['用户第一', '结果为王', '拥抱变化', '积极向上', '诚信正直', '团队合作'],
    公司五不准: ['不准拥有不好的态度', '不准挪用公款', '不准拥有不好的形象', '不准在公司传播负面', '不准拥有不好的服务'],
    育人法则: ['有德有才破格重用', '有德无才培养使用', '有才无德限制使用', '无德无才坚决不用'],
    宣言: '一群有情有义的人相聚在一起做一件不平凡的事!',

}
var g_localKey = 'question_';

var g_config = local_readJson('config', {
    primary: {},
});

function randNum(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
}


function arrayRandom(arr){
    return arr[randNum(0, arr.length - 1)];
}

function isEmpty(s){
    return typeof(s) != 'string' || !s.length;
}

function local_saveJson(key, data) {
    if (window.localStorage) {
        key = g_localKey + key;
        data = JSON.stringify(data);
        if (data == undefined) data = '[]';
        return localStorage.setItem(key, data);
    }
    return false;
}

function local_readJson(key, defaul) {
    if (!window.localStorage) return defaul;
    key = g_localKey + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}


function getDom(opts, s = '') {
    if(typeof(opts) == 'string') opts = {action: opts};
    for (var key in opts) {
        s += '[data-' + key;
        if (opts[key] != '') {
            s += '="' + opts[key] + '"';
        }
        s += ']';
    }
    return $(s);
}

