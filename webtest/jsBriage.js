//log
var j = 1, env = 'dev'
function logger(data){
    if(env !== 'dev') return ;
    var el = document.createElement('div')
    var index = j++
    el.innerHTML = index+':'+JSON.stringify(data)
    document.body.appendChild(el)
}
(function(window){
     //参数池
     var _paramsStore = {
         save: function(key, params){
            this[key] = params
         },
        get: function(key){
             var params = this[key]
             delete this[key]
             return params
         }
     }
     //回调池
     var _callbackStore = {
         save: function(key, callback){
            this[key] = callback
         }
     }
 
    function Briage(){
        this.id = 0
    }

    Briage.prototype = {
        _init_:function(config){
            window.globalConfig = config
            logger(window.globalConfig)
        },
        //添加事件
        addEvent: function(evName, callback){
            window.addEventListener(evName, callback, false)
        },
        //移除事件
        removeEvent: function(handle){
            var evName = this.getHandleKey(handle).e
            window.removeEventListener(evName, function(){}, false)
        },
        //生成handlekey
        getHandleKey: function getHandleKey(handle){
            return {
            p: 'param_'+handle,
            c: 'cb_'+handle,
            e: 'event_'+handle
            }
        },
        //H5-->Native
        nativeCall: function(params, callback){
            logger(params)
            params = params ? JSON.stringify(params) : ''
 
            var handle = this.id++
            var handleKey = this.getHandleKey(handle)
            logger(handleKey)
            _paramsStore.save(handleKey.p, params)
            logger(_paramsStore)
            if(typeof callback === 'function'){
                _callbackStore.save(handleKey.c, callback)
                //添加回调事件，回调成功后，删除事件
                var _this = this
                this.addEvent(handleKey.e, function(e) {
                     var result = e.data.result
                     var handle = e.data.handle
                     _this.removeEvent(handle)
                     callback.call(null, result)
                })
            }
            this.send('lagou://doAction?handle='+handle)
        },
        send: function (scheme){
            logger(scheme)
            setTimeout(function() {
               //创建iframe并设置src
               var iframe = document.createElement('iframe')
               iframe.src = scheme
               iframe.style.display = 'none'
               document.body.appendChild(iframe)
               //延迟删除节点
               setTimeout(function(){
                  iframe.parentNode.removeChild(iframe)
                  }, 300)
               }, 0)
        },
        //Native-->H5 js注入方式获取参数
        getParam: function(handle) {
            var key = this.getHandleKey(handle).p
            return _paramsStore.get(key)
        },
        //Native-->H5
        postMessage: function(handle) {
            var evName = this.getHandleKey(handle).e
            var data = {
                result: 'data;hangle='+handle,
                handle: handle
            }
            //创建并触发自定义事件
            this.fireEvent(evName, data)
        },
        fireEvent: function(evName, data) {
            var eventItem
            if(typeof window.CustomEvent === 'function') {
                eventItem = new window.CustomEvent(evName, {bubbles: true, cancelable: true})
            } else if (typeof document.createEvent === 'function'){
                eventItem = document.createEvent('event')
                eventItem.initEvent(evName, true, true)
            }
            if(data&&eventItem){
                eventItem.data = data
            }
            if(eventItem) {
                window.dispatchEvent(eventItem)
            } else {
                console.log('Briage Error : dispatchEvent')
            }
        }
    }
 
    window.Briage = new Briage()
 
})(window)
