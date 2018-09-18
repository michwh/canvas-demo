/**
 * @file 项目JS文件
 * @author wenhui-huang(wenhui-huang@qq.com)
 */

//磁道序列数组
let trackSequence = [];

/**
 * 磁盘磁道总个数
 * @type {Number}
 */
const track = 150;

/**
 * 需要生成的磁道序列个数
 * @type {Number}
 */
const trackNumber = 40;

/**
 * 生成[minNum,maxNum]的随机整数
 * 
 * @param  {number} minNum 最小的数
 * @param  {number} maxNum 最大数
 * @return {number}        产生的随机数
 */
function randomNum(minNum,maxNum) { 
  switch(arguments.length){ 
    case 1: 
      return parseInt(Math.random() * minNum + 1, 10); 
      break; 
    case 2: 
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10); 
      break; 
    default: 
      return 0; 
      break; 
  } 
} 

/**
 * 生成num个磁道号序列
 * 其中50%位于 0～499，25%分布在 500～999，25%分布在 1000～1499
 *
 * @param {number} num 磁道号序列个数
 * @return {Array} trackSequence 磁道号序列数组
 */
function generateTrackNumberSequence(num) {
  trackSequence = [];
  const firstSequence = num * 0.5;
  const secondSequence = num * 0.25;
  const thirdSequence = num * 0.25;
  for(let i = 0; i <= firstSequence; i++) {
    trackSequence.push(randomNum(0,49));
  }
  for(let i = 0; i <= secondSequence; i++) {
    trackSequence.push(randomNum(50,99));
  }
  for(let i = 0; i <= thirdSequence; i++) {
    trackSequence.push(randomNum(100,149));
  }
  //将数字顺序打乱
  for (let i = 1; i < trackSequence.length; i++) {
    const random = Math.floor(Math.random() * (i + 1));
    [trackSequence[i], trackSequence[random]] = [trackSequence[random], trackSequence[i]];
  }
  return trackSequence;
}

/**
 * 算法选项数组
 * @type {Array}
 */
const algorithms = Array.from(document.querySelectorAll('.btn-group > button'));

//用户选择的算法
let algorithmValue = null;

/**
 * 记录用户选择的算法选项，并改变该选项的css样式
 * 
 * @param  {Object} btn 用户选择的事件对象
 */
function selectAlgorithm(btn) {
  algorithmValue = this.dataset.algorithm;
  algorithms.forEach(key => key.classList.remove('button-active'));
  btn.target.classList.add('button-active');
}

algorithms.forEach(key => key.addEventListener('click', selectAlgorithm));

/**
 * 提示错误信息
 * 
 * @param  {String} tips 错误信息
 * @param  {boolean} bool 是否要提示信息
 */
function showErrorMessage(tips, bool) {
  const promptBox = document.querySelector('.error-message');
  promptBox.innerHTML = tips;
  if(bool) {
    promptBox.classList.add('show-error-message');
  } else {
    promptBox.classList.remove('show-error-message');
  }
}

/**
 * 检查用户是否选择了算法和输入了磁头初始位置
 * 错误时输出相应提示，正确时返回磁头初始位置
 * 
 * @return {string | boolean} 
 */
function check() {
  const headInitalPosition = document.querySelector('.head-position').value;
  if(!algorithmValue) {
    showErrorMessage('请选择算法！', true);
    return false;
  } else if(!headInitalPosition) {
    showErrorMessage('请输入磁头初始位置！', true);
    return false;
  } else {
    showErrorMessage('', false);
    return headInitalPosition;
  }
}

/**
 * 先来先服务算法
 * 
 * @param  {Array} headPath 磁头路径数组，传入时只包含磁头初始位置
 * @return {Array}          磁头将要走过的路径数组
 */
function fcfs(headInitalPosition) {
  let headPath = [];
  headPath.push(headInitalPosition);
  return headPath.concat(trackSequence);
}

/**
 * 找到数组最小值并返回下标
 * 
 * @return {number} coor 数组最小值下标
 */
Array.prototype.min = function () {
  var min = this[0];
  var coor = 0; 
  this.forEach((ele, index,arr) => {
    if(ele < min) {
      min = ele;
      coor = index; 
    } 
  }) 
  return coor; 
}

/**
 * 最短寻道时间算法
 * 
 * @param  {String} headInitalPosition 磁头初始位置
 * @return {Array}  headPath           磁头路径数组
 */
function sstf(headInitalPosition) {
  let headPath = [];
  headPath.push(headInitalPosition);
  let trackSequenceCopy = trackSequence.concat();
  for(let i = 0; i < trackSequence.length; i++) {
    let distance = trackSequenceCopy.map(key => Math.abs(key - headPath[i]));
    let minCoor = distance.min();
    headPath.push(trackSequenceCopy[minCoor]);
    trackSequenceCopy.splice(minCoor, 1);
  }
  return headPath;
}

/**
 * 电梯调度算法
 *
 * @param  {number} headInitalPosition 磁头初始位置
 * @return {Array}                     磁头路径数组
 */
function scan(headInitalPosition) {
  let headPath = [];
  headPath.push(headInitalPosition);
  headPath = headPath.concat((trackSequence.filter(key => key <= headInitalPosition)).sort((a, b) => b - a));
  headPath = headPath.concat((trackSequence.filter(key => key > headInitalPosition)).sort((a, b) => a - b));
  return headPath;
}

/**
 * 循环扫描算法
 *
 * @param  {number} headInitalPosition 磁头初始位置
 * @return {Array}                     磁头路径数组
 */
function cScan(headInitalPosition) {
  let headPath = [];
  headPath.push(headInitalPosition);
  headPath = headPath.concat((trackSequence.filter(key => key <= headInitalPosition)).sort((a, b) => b - a));
  headPath = headPath.concat((trackSequence.filter(key => key > headInitalPosition)).sort((a, b) => b - a));
  return headPath;
}

const canvas = document.querySelector('#draw');
const ctx = canvas.getContext('2d');

/**
 * 获取css样式
 * 
 * @param  {Object} obj       将要获取样式的元素
 * @param  {String} attr      样式的属性
 * @return {Array}  cssStyleNumber  属性值
 */
function getStyle(obj,attr){
    const cssStyle = obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj)[attr];
    if(attr == 'height' || attr == 'width') {
      return cssStyle.slice(0, cssStyle.length - 2);
    }
    return cssStyle;
}

/**
 * 画线的方法
 * 
 * @param  {number} x1 起点横坐标
 * @param  {number} y1 起点纵坐标
 * @param  {number} x2 终点横坐标
 * @param  {number} y2 终点纵坐标
 */
function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
}

/**
 * 显示标记文本
 * 
 * @param  {String} text 要显示的文本
 * @param  {Number} xPos 横坐标
 * @param  {Number} yPos 纵坐标
 */
function drawText(text, xPos, yPos) {
  ctx.textAlign = "center";
  ctx.font = "20px Arial";
  ctx.fillText(text, xPos, yPos);
}

/**
 * 绘制X轴及标记点
 * 
 * @param  {Array} xCoorArray 按升序排好的横坐标数组
 */
function drawCoordinateAxis(xCoorArray) {
  ctx.strokeStyle = '#566a80';
  ctx.fillStyle = '#566a80';
  ctx.lineWidth = 2;
  for(let i = 0; i < xCoorArray.length; i++) {
    const startXCoor = (xCoorArray[i] / track) * canvas.width;
    const endYCoor = (xCoorArray[i + 1] / track) * canvas.width;
    drawText(xCoorArray[i], startXCoor, 25); 
    drawLine(startXCoor, 40, endYCoor, 40);
    drawLine(startXCoor, 40, startXCoor, 30);
  }
}

/**
 * 画点
 * 
 * @param  {Number} xPos 圆心横坐标
 * @param  {Number} yPos 圆心纵坐标
 * @param  {Number} size 圆半径
 */
function drawPoint(xPos, yPos, size) {
  ctx.beginPath();
  ctx.arc(xPos, yPos, size, 0, Math.PI * 2, true); 
  ctx.fill();
}

/**
 * 绘制折线图
 * 
 * @param  {Array} headPath 磁头轨迹数组
 */
function drawLineChart(headPath) {
  ctx.strokeStyle = '#566a80';
  ctx.fillStyle = '#566a80';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  //起点和终点纵坐标
  let startYCoor = 50;
  let endYCoor = 60;
  for(let i = 0; i < headPath.length; i++) {
    //起点和终点横坐标
    let startXCoor = (headPath[i] / track) * canvas.width;
    let endXCoor = (headPath[i + 1] / track) * canvas.width;
    if(startXCoor == endXCoor) {
      endYCoor = startYCoor;
    }
    drawPoint(startXCoor, startYCoor, 5);
    drawLine(startXCoor, startYCoor, endXCoor, endYCoor);
    startYCoor = endYCoor;
    endYCoor += 10;
  }
}

/**
 * 展示图
 * 
 * @param  {Array} headPath 磁头轨迹数组
 */
function showCanvas(headPath) {
  //清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.width = getStyle(canvas, 'width') * 2;
  canvas.height = getStyle(canvas, 'height') * 2;

  let xCoorArray = []
  xCoorArray = xCoorArray.concat(headPath);
  //横坐标数组
  xCoorArray.sort((a, b) => a - b);
  console.log(`横坐标数组：${xCoorArray}`);
  drawCoordinateAxis(xCoorArray);
  drawLineChart(headPath);
}

/**
 * 显示磁头移动道数
 * 
 * @param  {Array} headPath 磁头移动路径
 */
function showMoveNumber(headPath) {
  let moveNumber = [];
  for(let i = 1; i < headPath.length; i++) {
    moveNumber.push(Math.abs(headPath[i] - headPath[i - 1]));
  }
  showErrorMessage(`磁头移动道数：${moveNumber.reduce((a, b) => a + b)}`, true);
}

/**
 * 生成随机磁道序列
 * 根据用户选择的算法和磁头初始位置绘制效果图
 * 
 */
function start() {
  const headInitalPosition = check();
  if(headInitalPosition && algorithmValue) {
    generateTrackNumberSequence(trackNumber);
    console.log(`随机生成的磁道序列：${trackSequence}`);
    let headPath = [];
    switch(algorithmValue) {
      case 'fcfs':
        headPath = fcfs(headInitalPosition);
        break;
      case 'sstf':
        headPath = sstf(headInitalPosition);
        break;
      case 'scan':
        headPath = scan(headInitalPosition);
        break;
      case 'c-scan':
        headPath = cScan(headInitalPosition);
        break;
    }
    console.log(`磁头轨迹：${headPath}`);
    showCanvas(headPath);
    showMoveNumber(headPath);
  }
}

document.querySelector('.start-btn').addEventListener('click', start);