var writer;
var isCharVisible;
var isOutlineVisible;

import DOMPracticeSheet from "./DOMPracticeSheet.js";
// function updateCharacter() {
//   document.querySelector('#target').innerHTML = '';

//   var character = document.querySelector('.js-char').value;
//   window.location.hash = character;
//   writer = HanziWriter.create('target', character, {
//     width: 400,
//     height: 400,
//     renderer: 'svg',
//     radicalColor: '#166E16',
//     onCorrectStroke: printStrokePoints,
//     onMistake: printStrokePoints,
//     showCharacter: false,
//   });
//   isCharVisible = true;
//   isOutlineVisible = true;
//   window.writer = writer;
// }

// function updateCharacterFromInput() {
//   const input = document.querySelector('.js-char');
//   const firstChar = input.value.trim().charAt(0); // 提取首个汉字
//   if (firstChar) {
//     input.value = firstChar; // 保留首个汉字
//     updateCharacter(); // 更新显示

//     writer.quiz({
//       showOutline: true,
//     });
//   }
// }








// 初始生成字帖
function generatePracticeSheet() {
    const input = document.querySelector('.js-char').value.trim();
    const $target = document.querySelector('#target');
    const inputSize = document.querySelector('.js-char-size').value.trim();

    if(!practiceSheet) {
        practiceSheet = new DOMPracticeSheet($target, input,inputSize || 100);
    }else{
        practiceSheet.init(input,inputSize || 100);
    }
}     // 初始生成字帖

// function eInputChangeSize(){
//     if(practiceSheet) {
//         practiceSheet.setCellSize(inputSize);
//     }    
// }
var practiceSheet=null;

window.onload = function () {
  var char = decodeURIComponent(window.location.hash.slice(1)); // 从 URL 哈希中提取字符

  // 设置页面格子大小，从 url参数中提取字符
  const urlParams = new URLSearchParams(window.location.search);
  const sizeInit = urlParams.get('size');
  if(sizeInit){
    document.querySelector('.js-char-size').value = sizeInit;
  }
  if (char) {
    document.querySelector('.js-char').value = char;
  }

  generatePracticeSheet(); // 初始生成字帖

  // 添加文本框输入完成事件监听
  document.querySelector('.js-char').addEventListener('blur', generatePracticeSheet);
  // document.querySelector('.js-char-size').addEventListener('blur', eInputChangeSize);

  // document.querySelector('.js-toggle').addEventListener('click', function () {
  //   isCharVisible ? writer.hideCharacter() : writer.showCharacter();
  //   isCharVisible = !isCharVisible;
  // });
  // document.querySelector('.js-toggle-hint').addEventListener('click', function () {
  //   isOutlineVisible ? writer.hideOutline() : writer.showOutline();
  //   isOutlineVisible = !isOutlineVisible;
  // });
  // document.querySelector('.js-animate').addEventListener('click', function () {
  //   writer.animateCharacter();
  // });

  // 监听窗口大小变化，重新生成字帖
  // window.addEventListener('resize', generatePracticeSheet);
};
