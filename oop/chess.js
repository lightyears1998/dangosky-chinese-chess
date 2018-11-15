'use strict';


// 象棋游戏对象
function ChessGame(node) {
  if (!(this instanceof ChessGame)) {
    return new ChessGame(node);
  }
  if (!node) {
    throw new Error('人生充满意外，需要放平心态');
  }

  this.node;     // 游戏在DOM树中的节点
  this.chesses;  // 游戏中的棋子 
  this.canvas;   // 游戏画布

  this.playerRed;    // 红色玩家
  this.playerBlack;  // 黑色玩家

  this.isOngoing;  // 指示游戏是否正在进行

  this.init;               // 初始化游戏
  this.start;              // 指定玩家后开始游戏
  this.startSelfPractice;  // 开始自我对局
  this.finish;             // 结束游戏

  this.checkThreat;  // 检查某方的主将是否正在受到攻击

  this.onPlayerAction;     // 处理棋手的移动
  
  this.history;  // 行棋历史记录

  this.init = function () {
    this.chesses = [
      Chess('車', 0, 0), Chess('馬', 0, 1), Chess('象', 0, 2), Chess('士', 0, 3), 
      Chess('將', 0, 4), Chess('士', 0, 5), Chess('象', 0, 6), Chess('馬', 0, 7), 
      Chess('車', 0, 8), Chess('砲', 2, 1), Chess('砲', 2, 7), Chess('卒', 3, 0), 
      Chess('卒', 3, 2), Chess('卒', 3, 4), Chess('卒', 3, 6), Chess('卒', 3, 8),
      Chess('俥', 9, 0), Chess('傌', 9, 1), Chess('相', 9, 2), Chess('仕', 9, 3), 
      Chess('帥', 9, 4), Chess('仕', 9, 5), Chess('相', 9, 6), Chess('傌', 9, 7), 
      Chess('俥', 9, 8), Chess('炮', 7, 1), Chess('炮', 7, 7), Chess('兵', 6, 0), 
      Chess('兵', 6, 2), Chess('兵', 6, 4), Chess('兵', 6, 6), Chess('兵', 6, 8),
    ];
    this.canvas.cvsChesses.dispatchEvent(new Event('chess-update'));
  }

  this.start = function (playerRed, playerBlack) { 
    this.playerBlack = playerBlack;
    this.playerRed = playerRed;
  }

  this.startSelfPractice = function () {
    let user = new LocalPlayer(this);
    this.start(user, user);
  }

  this.move = function () {
    
  }

  this.onPlayerAction = function (event) {
    
  }

  this.node = node;
  this.node.addEventListener('player-action', this.onPlayerAction.bind(this));
  this.canvas = new ChessGameCanvas(this);
  this.init();
}


// 棋子对象
function Chess(rank, x, y) {
  if (!(this instanceof Chess)) {
    return new Chess(rank, x, y);
  }
  
  this.rank = rank;  // 棋名
  this.x = x;        // 棋子的逻辑坐标
  this.y = y;
  
  // 取得棋子的阵营
  this.getCamp = function () {
    switch (this.rank) {
      case '車': case '馬': case '象': case '士': 
      case '將': case '砲': case '卒':
        return 'black';
      case '俥': case '傌': case '相': case '仕': 
      case '帥': case '炮': case '兵':
        return 'red';
    }
  }
  
  this.listPossibleMove = function () {
    switch (this.rank) {
      
    }
  }
}


// 棋盘上可以容纳棋子的空位
function IdlePlace(x, y) {
  if (!(this instanceof IdlePlace)) {
    return new IdlePlace(x, y);
  }
  
  this.x = x;  // 空位的逻辑坐标
  this.y = y; 
}


// 棋子移动对象
function ChessMove() {
  this.chess;    // 欲移动的棋子
  this.type;     // 移动类型：trivial（平凡）, attck（攻击）
  this.targetX;  // 棋子移动的目标位置
  this.targetY;
}


// 游戏对象绑定的画布
function ChessGameCanvas(game) {
  if (!(this instanceof ChessGameCanvas)) {
    return new ChessGameCanvas(game);
  }
  if (!(game instanceof ChessGame)) {
    throw new Error('人生充满意外，需要放平心态');
  }

  const 晓灰 = '#d4c4b7';
  const 玉红 = '#c04851';
  const 李紫 = '#2b1216';
  const 落英淡粉 = '#f9e8d0';

  this.cvsChessboard;     // 棋盘画布
  this.cvsChesses;        // 棋子画布
  this.cvsFeedback;       // 反馈画布

  this.updateMeasuring;   // 更新度量
  this.canvasWidth;       // 画布宽度
  this.canvasHeight;      // 画布高度
  this.offsetTop;         // 绘图坐标原点距离父元素顶端的偏移
  this.offsetLeft;        // 绘图坐标原点距离父元素左端的偏移
  this.cellLength;        // 单位棋盘格子的长度

  this.viewMode = 'red';  // ['red' | 'black'] 棋盘下方的阵营颜色

  this.draw;              // 绘制游戏
  this.drawChessboard;    // 绘制棋盘
  this.drawChesses;       // 绘制棋盘上的棋子

  // 像素坐标、逻辑坐标与象棋坐标
  // 棋子逻辑坐标与像素坐标的相互转换
  this.logicCoordinate2PixelCoordinate;
  this.PixelCoordinate2LogicCoordinate;

  // 计算画布宽高等棋盘参数
  this.updateMeasuring = function () {
    let parentHeight = game.node.clientHeight;
    let parentWidth = game.node.clientWidth;
    // 将画布所占空间视为正方形，正方形边长取父元素宽高中的较小值
    this.canvasHeight = Math.min(parentHeight, parentWidth);
    // 计算画布（9单元格 x 10单元格）的实际大小
    this.cellLength = Math.floor(this.canvasHeight / 10);
    this.canvasWidth = this.cellLength * 9;
    this.canvasHeight = this.cellLength * 10;
    // 计算画布距离父元素的偏移量
    this.offsetTop = (parentHeight - this.canvasHeight) / 2;
    this.offsetLeft = (parentWidth - this.canvasHeight) / 2 + this.cellLength / 2;
    // 设置画布的DOM属性
    [this.cvsChessboard, this.cvsChesses, this.cvsFeedback].forEach(function (cvs) {
      cvs.style.top = `${this.offsetTop}px`;
      cvs.style.left = `${this.offsetLeft}px`;
      cvs.width = `${this.canvasWidth}`;
      cvs.height = `${this.canvasHeight}`;
    }.bind(this));
  }

  this.draw = function () {
    this.updateMeasuring();
    this.drawChessboard();
    this.drawChesses();
  }
  
  // 中国象棋棋盘
  // 宽9单元格，其中内外边框距共计1格、阵营宽度8格
  // 高10单元格，其中内外边框距1格、各阵营高度4格、楚河汉界1格
  this.drawChessboard = function () {
    let ctx = this.cvsChessboard.getContext('2d');
    ctx.save();
    
    ctx.lineWidth = this.cellLength / 32;
    ctx.strokeStyle = 晓灰;
    
    // 绘制棋盘外围的边框
    ctx.strokeRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 绘制棋盘上的竖直线
    for (let i = 0; i < 9; i++) {
      let x = (0.5 + i) * this.cellLength;
      let y = [0.5, 4.5, 5.5, 9.5].map((item) => item * this.cellLength);
      for (let j = 0; j < 4; j += 2) {
        ctx.beginPath();
        ctx.moveTo(x, y[j]);
        ctx.lineTo(x, y[j+1]);
        ctx.stroke();
      }
    }
    
    // 绘制棋盘上的水平线
    for (let i = 0; i < 10; i++) {
      let x = [0.5, 8.5].map((item) => item * this.cellLength);
      let y = (0.5 + i) * this.cellLength;
      ctx.beginPath();
      ctx.moveTo(x[0], y);
      ctx.lineTo(x[1], y);
      ctx.stroke();
    }
    
    // 绘制楚河汉界
    {
      let x = [0.5, 8.5].map((item) => item * this.cellLength);
      let y = [4.5, 5.5].map((item) => item * this.cellLength);
      for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.moveTo(x[i], y[0]);
          ctx.lineTo(x[i], y[1]);
          ctx.stroke();
      }
    }    
    
    // 绘制棋盘上大本营处的斜线
    {
      let head = [
        [3.5, 0.5], [5.5, 0.5], [3.5, 7.5], [5.5, 7.5]
      ].map((pair) => pair.map((val) => val * this.cellLength));  // 折线起点的像素坐标
      let tail = [
        [5.5, 2.5], [3.5, 2.5], [5.5, 9.5], [3.5, 9.5]
      ].map((pair) => pair.map((val) => val * this.cellLength));  // 折线终点的像素坐标
      for (let i = 0; i < 4; ++i) {
        ctx.beginPath();
        ctx.moveTo(head[i][0], head[i][1]);
        ctx.lineTo(tail[i][0], tail[i][1]);
        ctx.stroke();
      }
    }
    
    // 绘制棋盘上特殊位置的标记
    {
      let place = [
        [1.5, 2.5], [7.5, 2.5], [0.5, 3.5], [2.5, 3.5], [4.5, 3.5], [6.5, 3.5], [8.5, 3.5],
        [1.5, 7.5], [7.5, 7.5], [0.5, 6.5], [2.5, 6.5], [4.5, 6.5], [6.5, 6.5], [8.5, 6.5],
      ];  // 特殊位置的逻辑坐标
      for (let i = 0; i < place.length; ++i) {
        for (let dx = -1/16; dx <= 1/16; dx += 1/8) {
          for (let dy = -1/16; dy <= 1/16; dy += 1/8) {
            let center = [place[i][0] + dx, place[i][1] + dy];
            if (center[0] > 0.5 && center[0] < 8.5) {
              let pt = [
                [center[0] + 4 * dx, center[1]],
                [center[0], center[1]],
                [center[0], center[1] + 4 * dy]
              ].map((pair) => pair.map((val) => val * this.cellLength));
              ctx.beginPath();
              ctx.moveTo(pt[0][0], pt[0][1]);
              ctx.lineTo(pt[1][0], pt[1][1]);
              ctx.lineTo(pt[2][0], pt[2][1]);
              ctx.stroke();
            }
          }
        }
      }
    }
    
    ctx.restore();
  }
  
  // 中国象棋棋子
  // 棋子坐标，规定黑將右手侧車为(0, 0)，棋盘对角线上红方的俥为(9, 8)
  // 注意棋子坐标以行列记，像素坐标以宽高记，两者序偶的顺序相反
  this.drawChesses = function () {
    let ctx = this.cvsChesses.getContext('2d');
    for (let idx in game.chesses) {
      ctx.save();
      
      let chess = game.chesses[idx];
      let camp = chess.getCamp();
      
      let x = (chess.x + 0.5) * this.cellLength;
      let y = (chess.y + 0.5) * this.cellLength;
      
      ctx.translate(y, x);
      if (camp !== this.viewMode) {
        ctx.rotate(Math.PI);
      }
      
      let colorChess;       // 棋子和边框的颜色
      switch (camp) {
        case 'red': {
          colorChess = 玉红;
          break;
        }
        case 'black': {
          colorChess = 李紫;
          break;
        }
      }
      let colorBackground = 落英淡粉;  // 棋子背景颜色
      
      let radius = this.cellLength / 2.5;  // 棋子半径

      // 绘制棋子底色
      ctx.fillStyle = colorBackground;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // 绘制棋子边框
      ctx.strokeStyle = colorChess;
      ctx.beginPath();
      ctx.lineWidth = this.cellLength / 32;
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // 绘制棋子等级
      ctx.fillStyle = colorChess;
      ctx.font = `${radius * 1.8}px KaiTi`
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(chess.rank, 0, 0);
    
      ctx.restore();
    }
  }

  // 获取对应客户坐标中的棋子或空位
  this.getChessOrIdlePlace = function (clientX, clientY) {
    let x = Math.floor((clientY - this.offsetTop) / this.cellLength);
    let y = Math.floor((clientX - this.offsetLeft) / this.cellLength);
    for (let idx in game.chesses) {
      let chess = game.chesses[idx];
      if (chess.x == x && chess.y == y) {
        return chess;
      }
    }
    return new IdlePlace(x, y);
  }

  
  // 在DOM中添加画布
  {['cvs-chessboard', 'cvs-chesses', 'cvs-feedback'].forEach(function (cvs_name) {
    let cvs = document.createElement('canvas');
    cvs.setAttribute('id', `${game.node.id}-${cvs_name}`);
    cvs.setAttribute('style', 'position: absolute;');
    game.node.appendChild(cvs);
  });}
  this.cvsChessboard = document.getElementById(`${game.node.id}-cvs-chessboard`); 
  this.cvsChesses = document.getElementById(`${game.node.id}-cvs-chesses`); 
  this.cvsFeedback = document.getElementById(`${game.node.id}-cvs-feedback`);

  window.addEventListener('resize', this.draw.bind(this));
  this.cvsChesses.addEventListener('chess-update', this.drawChesses.bind(this));
  this.draw();
}
