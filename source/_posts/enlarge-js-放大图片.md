---
title: enlarge.js 放大图片
date: 2017-03-16 11:40:56
tags:
---
利用jquery 插件 [jquery.enlarge.js](https://github.com/abelyao/enlarge.js) 进行图片的放大处理。  
代码：
  
```
<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="utf-8">
    <meta name="keywords" content=" " />
    <meta name="description" content=" " />
    <meta http-equiv="x-ua-compatible" content="IE=Edge, chrome=1" />
    <meta name="renderer" content="webkit">
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
    <title>enLarge.js</title>
    <style>
        * {
            padding: 0;
            margin: 0;
        }
        #demo1 {
            display: block;
            width: 100px;
            height: 100px;
        }
        img {
            width: 100px;
            height: 100px;
        }
    </style>
    <script src="jquery.min.js"></script>
    <script src="jquery.enlarge.js"></script>
</head>
<body>
    <a id="demo1" href="IMG_0685.JPG">
        <img src="IMG_0685.JPG">
    </a>

    <script>
        $('#demo1').enlarge();
        
        // 以下的配置项是默认的值，可以自行修改
        // $("#demo1").enlarge(
        //     {
        //         // 鼠标遮罩层样式
        //         shadecolor: "#FFD24D",
        //         shadeborder: "#FF8000",
        //         shadeopacity: 0.5,
        //         cursor: "move",

        //         // 大图外层样式
        //         layerwidth: 400,
        //         layerheight: 300,
        //         layerborder: "#DDD",
        //         fade: true,

        //         // 大图尺寸
        //         largewidth: 1280,
        //         largeheight: 960
        //     }
        // );
    </script>
</body>
</html>
```