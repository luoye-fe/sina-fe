var formatArr = require('./formatArr.js')

Promise.prototype.delay = function(ms) {
    return this.then(function(val) {
        return new Promise.delay(ms, val);
    })
}
Promise.delay = function(ms, val) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(val);
        }, ms);
    })
}

// 暂停或继续
var paused = false;
var switchStatus = function() {
    paused = !paused;
    if (paused) {
        document.querySelectorAll('.switchBtn')[0].innerHTML = '&#xe614;';
    } else {
        document.querySelectorAll('.switchBtn')[0].innerHTML = '&#xe662;';
    }
}

var workCon = document.getElementById('work_con');

// 创建节点
var createSpan = function(className) {
    var oSpan = document.createElement('span');
    oSpan.className = className;
    return oSpan;
}

// 写字符到文档中
var writeCommonString = function(element, fullText, speed, callback) {
    if (!paused) {
        // 自动滚到底部
        workCon.scrollTop = workCon.scrollHeight;
        var _arr = fullText.split('');
        if (_arr.length === 0) {
            callback && callback();
            return;
        }
        setTimeout(function() {
            element.innerHTML += _arr[0];
            // showTypeEffect('bink')
            fullText = fullText.slice(1);
            writeCommonString(element, fullText, speed, callback);
        }, speed);
    } else {
        // 暂停
        Promise
            .delay(10)
            .then(function() {
                writeCommonString(element, fullText, speed, callback);
            });
    }
}

// 换行特效
var showEffect = function(type) {

}

// 单个字符特效 (写下每个字符之后执行一些操作，比如加入移除一些元素) (type 类名，以这个类名做操作)
var showTypeEffect = function(type) {
    if (document.querySelectorAll('.type_effect').length) {
        var oSpan = document.querySelectorAll('.type_effect');
        var oParent = document.querySelectorAll('.type_effect')[0].parentNode;
        oParent.appendChild(oSpan[0]);
    } else {
        var oSpan = document.createElement('span');
        oSpan.className = 'type_effect ' + type;
        document.getElementById('work_con').appendChild(oSpan);
    }
}

var index = 0;
var isComplete = false;
// 主函数
var init = function(arr) {
    if (index >= arr.length) {
        isComplete = true;
        return;
    }

    if (arr[index]['comment']) {
        var options = arr[index]['options'];
        var fullText = index === 0 ? arr[index]['comment'] : arr[index]['comment'].replace(/\/\*/ig, '\n\n\/\*');
        Promise
            .delay(options['delay'])
            .then(function() {
                var oSpan = createSpan('comment');
                workCon.appendChild(oSpan);
                writeCommonString(oSpan, fullText, options['speed'] * 10, function() {
                    index++;
                    init(arr);
                });
            })
    }
    if (arr[index]['selector']) {
        var options = arr[index]['options'];

        var styleArr = arr[index]['style'];

        Promise
            .delay(options['delay'])
            .then(function() {
                var styleIndex = 0;

                var oSpan1 = createSpan('selector');
                workCon.appendChild(oSpan1);
                oSpan1.innerHTML = '\n\n';

                // 回调的地狱 哎
                writeCommonString(oSpan1, arr[index]['selector'], options['speed'] * 10, function() {
                    workCon.innerHTML += '{\n';
                    (function() {
                        var _this = arguments.callee;
                        var oSpan2 = createSpan('key');
                        var oSpan3 = createSpan('value');
                        workCon.appendChild(oSpan2);
                        writeCommonString(oSpan2, '   ' + styleArr[styleIndex]['key'], options['speed'] * 10, function() {
                            workCon.innerHTML += ':';
                            workCon.appendChild(oSpan3);
                            writeCommonString(oSpan3, styleArr[styleIndex]['value'], options['speed'] * 10, function() {
                                workCon.innerHTML += ';\n';
                                // 换行特效
                                showEffect(options['effect']);
                                document.getElementById('style_con').innerHTML += arr[index]['selector'] + '{' + styleArr[styleIndex]['key'] + ':' + styleArr[styleIndex]['value'] + '}';
                                styleIndex++;
                                if (styleIndex > styleArr.length - 1) {
                                    index++;
                                    workCon.innerHTML += '}';
                                    // 自动滚到底部
                                    workCon.scrollTop = workCon.scrollHeight;
                                    init(arr);
                                } else {
                                    _this();
                                }
                            })
                        })
                    })()
                })
            });
    };
}

init(formatArr);



document.querySelectorAll('.switchBtn')[0].onclick = function() {
    switchStatus();
    if(!paused){
        var timer = window.setInterval(function() {
            if (isComplete) {
                return;
            }
            if (paused) {
                clearInterval(timer);
            }
            timeCon.innerHTML = ((new Date().getTime() - startTime) / 1000).toFixed(2);
        }, 100);
    }
}

document.body.onkeypress = function(event) {
    if (event.keyCode === 32) {
        switchStatus();
        if(!paused){
            var timer = window.setInterval(function() {
                if (isComplete) {
                    return;
                }
                if (paused) {
                    clearInterval(timer);
                }
                timeCon.innerHTML = ((new Date().getTime() - startTime) / 1000).toFixed(2);
            }, 100);
        }
    }
}

var isDebug = location.href.indexOf('debug') >= 0 ? true : false;

if (isDebug) {
    document.querySelectorAll('.debug')[0].style.display = 'block';
    var timeCon = document.querySelectorAll('.time')[0]
    var startTime = new Date().getTime();
    var timer = window.setInterval(function() {
        if (isComplete) {
            return;
        }
        if (paused) {
            clearInterval(timer);
        }
        timeCon.innerHTML = ((new Date().getTime() - startTime) / 1000).toFixed(2);
    }, 100);
}
