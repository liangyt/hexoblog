---
title: webSocket实现的聊天Demo
date: 2017-04-28 14:58:40
tags:
---

这是一个基于 node + express + websocket 环境实现的聊天例子，主要是为了熟悉一下webSocket处理流程.  
先一下效果图：  
![动态图](http://opgr6exjm.bkt.clouddn.com/ws.gif)
例子没有使用厉害的那个 <code>socket.io</code> 组件，用了另外一个比较简单一点的 webSocket 组件 [<code>ws</code>](https://github.com/websockets/ws).

话不多说，给出简单的html文件代码，类似于刚切出来的效果，还没有加入JS处理(因为样式不多，就直接写成内部样式了，不喜欢的可以另写一个文件使用 link 引用进来):
```
<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="utf-8">
    <meta name="keywords" content="" />
    <meta name="description" content=" " />
    <meta http-equiv="x-ua-compatible" content="IE=Edge, chrome=1" />
    <meta name="renderer" content="webkit">
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
    <title>Chat</title>
    <style>
        .self {
            text-align: right;
        }
        .online {
            text-align: center;
            color: #ccc;
        }
        .othen-content {
            background-color: #ccc;
            border-radius: 5%;
            padding: 10px;
            line-height: 36px;
        }
        .other {
            margin: 30px 0 30px 5px;
        }
        .self {
            margin: 30px 0 30px 5px;
        }
        .self-content {
            background-color: red;
            border-radius: 5%;
            padding: 10px;
            line-height: 36px;
        }
        .footer {
            width: 100%;
            position: fixed;
            bottom: 0;
            padding: 10px;
        }

        .send-content {
            width: 70%;
            height: 30px;
            border-radius: 5%;
            border: 1px solid #ccc;
        }
        .send-button {
            font-size: 18px;
            width: 60px;
            height: 30px;
        }
        .my-name-bg {
            position: fixed;
            top: 0;
            z-index: 99;
            width: 100%;
            height: 100%;
            background-color: black;
        }
        .my-name {
            position: relative;
            background-color: white;
            top: 50%;
            margin: 0 auto;
            width: 200px;
            height: 80px;
            text-align: center;
            padding-top: 10px;
        }
        .my-name-tip {
            height: 30px;
        }
        #my-name {
            border: 1px solid #ccc;
        }
        .message-tip {
            text-align: center;
            font-size: 10px;
            color: #ccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="online">
            当前在线人数 <span id="onlinecount" class="online-count"></span>
        </div>
        <div class="content">
            <div class="other">
                <span>路人:</span><span class="othen-content">说得不错</span>
            </div>
            <div class="other">
                <span>路人:</span><span class="othen-content">说得不错</span>
            </div>
            <div class="self">
                <span class="self-content">你说得不错你说得不错你说得不错你说得不错</span><span>自已</span>
            </div>
            <div class="message-tip">
                <span>你说得不错你说得不错你说得不错你说得不错</span>
            </div>
        </div>
        <div class="footer">
            <span>
                <input type="text" id="content" class="send-content">
            </span>
            <span>
                <input type="button" value="发送" class="send-button" id="send">
            </span>
        </div>
    </div>
    <div class="my-name-bg">
        <div class="my-name">
            <div class="my-name-tip">
            输入你的名称按回车：
            </div>
            <div>
                <input type="text" id="my-name">
            </div>
        </div>
    </div>
</body>
</html>
```
效果图就是下面这样：
![静态效果图](http://opgr6exjm.bkt.clouddn.com/ws.png)

静态页完成了，那接下来就是逻辑部分的实现了.
项目的创建目录结构是什么样的这里就不过多啰嗦了，知道node的同学估计不会陌生，这里写一下 websocket 与 exporess的结合。
```
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var http = require('http');
const webSocket = require('ws');

// view engine setup
// 设置路由访问根目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// 这个是设置静态资源路径，这里用不上
app.use(express.static(path.join(__dirname, 'public')));
// express 路由
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'webSocket测试' });
});
app.use('/', router);
// 使用 node 内置的 http 创建服务
var server = http.createServer(app);

// 这部分是处理 webSocket 在node服务端的代码
var wsServer = null;
var keepAlive = null;
var aliveCount = 0;

var wsService = {
    connection (ws) {
        // 连上一个添加一个在线人数
        aliveCount++;

        ws.on('message', function incoming(message) {
            wsServer.clients.forEach(function(client) {
                // 发送给自已
                // if(client == ws) {
                //     client.send("你刚才给服务端发送了数据：" + message)
                // }
                // 发送给其它人
                if(client != ws) {
                    var mo = JSON.parse(message);
                    mo.aliveCount = aliveCount;
                    client.send(JSON.stringify(mo))
                }
            })
        });

        // 客户端断开在线数减一
        ws.on('close', function() {
            aliveCount--
        })

        // 所有客户端的 onmessage 监听都会收到 这个是不是可以当作心跳保持呢
        keepAlive = setInterval(function() {
            // WebSocket.CONNECTING = 0;
            // WebSocket.OPEN = 1;
            // WebSocket.CLOSING = 2;
            // WebSocket.CLOSED = 3;
            if(ws.readyState === 1) {
                ws.send(JSON.stringify({keepAlive: 1}))
            } else {
                clearInterval(keepAlive)
            }
        }, 5000)
    },
    setWss (wss) {
        wsServer = wss
    }
};

const wss = new webSocket.Server({server});
// 监听客户端websocket连接
wss.on('connection', wsService.connection)
wsService.setWss(wss)

var port = 4000;
// 监听 4000 端口
server.listen(port);
server.on('error', function(err){});
server.on('listening', function() {
    console.log('listening on:' + port)
});
```
看这代码其实也并不多啊，主要就是三个事件：  
connection: 监听客户端连接  
mssage: 监听客户端消息  
close: 监听客户端是否关闭  
服务端的代码基本就这些了，看看客户端的代码：
```
<div class="container">
        <div class="online">
            当前在线人数 <span id="onlinecount" class="online-count">1</span>
        </div>
        <div class="content" id="content-list">
            
        </div>
        <div class="footer">
            <span>
                <input type="text" id="content" class="send-content">
            </span>
            <span>
                <input type="button" value="发送" class="send-button" id="send">
            </span>
        </div>
    </div>
    <div class="my-name-bg">
        <div class="my-name">
            <div class="my-name-tip">
            输入你的名称按回车：
            </div>
            <div>
                <input type="text" id="my-name">
            </div>
        </div>
    </div>
```
html代码基本就是添加了一些ID和删除了动态生成部分，再来看看JS代码:
```
<script>
        var contentList = document.querySelector('#content-list');
        var onlineCount = document.querySelector('#onlinecount');
        var myName = document.querySelector('#my-name');
        var myNamecontainr = document.querySelector('.my-name-bg');
        var myNameContent = localStorage.getItem('myname')

        if(localStorage.getItem('myname')) {
            myNamecontainr.remove()
        }

        var ctx = window.location.host;
        var ws = new WebSocket('ws://' + ctx);
        // 监听socket 是否连上
        ws.onopen = function() {
            contentList.innerHTML = contentList.innerHTML + '<div class="message-tip"><span>连上服务器了</span></div>'
            handle()
        }

        function handle() {
            ws.onmessage = function(e) {
                console.log(e.data)
                var mo = JSON.parse(e.data);

                if(mo.aliveCount) {
                    var item = '<div class="other">' +
                        '<span>' + mo.name + ':</span><span class="othen-content">' + mo.content + '</span>' +
                    '</div>'
                    contentList.innerHTML = contentList.innerHTML + item
                    onlineCount.innerHTML = mo.aliveCount
                }
            }

            ws.onclose = function(e) {
                contentList.innerHTML = contentList.innerHTML + '<div class="message-tip"><span>服务器关闭了</span></div>'
            }

            window.onunload = function(){
                ws.close();
            };

            var content = document.querySelector('#content')
            // 发送内容输入框按下回车键监听
            content.addEventListener('keydown', function(e) {
                if(e.keyCode == 13) {
                    send()
                }
            })
            // 监控发送按钮
            document.querySelector('#send').addEventListener('click', function(e) {
                send()
            })

            // 发送消息
            function send() {
                var value = content.value
                content.value = ''
                var item = '<div class="self">' +
                        '<span class="self-content">' + value + '</span><span>' + myNameContent + '</span>' +
                    '</div>'
                    contentList.innerHTML = contentList.innerHTML + item

                ws.send(JSON.stringify({
                    name: myNameContent,
                    content: value
                }))
            }

            // 输入用户名称并保存
            myName.addEventListener('keyup', function(e) {
                var n = myName.value.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
                if(e.keyCode === 13 && n != '') {
                    localStorage.setItem('myname', n)
                    myNameContent = n
                    myNamecontainr.remove()
                }
            })
        }
        
    </script>
```
没有使用JS组件，使用的原生API；主要是做两件事，监听服务端数据过来和发送数据到服务端。逻辑也不复杂，上看就明白了。

可以克隆项目到本地，跑起来看看效果.