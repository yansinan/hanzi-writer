var writer;
var isCharVisible;
var isOutlineVisible;

function printStrokePoints(data) {
  var pointStrs = data.drawnPath.points.map((point) => `{x: ${point.x}, y: ${point.y}}`);
  console.log(`[${pointStrs.join(', ')}]`);
}

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
function $getCell(){
  // 生成格子模板
  const cell = document.createElement('div'); // 创建一个格子
  cell.classList.add('cell'); // 添加格子的类名
  return cell;
}
// 生成格子模板
const $cell = $getCell(); // 创建一个格子

// 占整行的DOM模板
function $getBlock(char,rowIndex){
  const $word = document.createElement('div'); // 创建一块
  $word.classList.add('word'); // 添加行的类名
  // 以行为单位
  $word.strCharacter=char; // 存储当前行的字符
  $word.list$Writer=[]; // 存储当前行的 HanziWriter 实例列表
  //再分字
  $word.listStrChar=char.split('');

  const listStrChar=$word.listStrChar
  // 如果是词语
  if(listStrChar.length>1){
      
  }else if(listStrChar.length==1){
    // 如果是单个字
    $word.classList.add('row'); // 添加行的类名

  }else{
    
  }  
  const cellDFragment = document.createDocumentFragment('div'); // 创建一个格子

  for (let i = 0; i < (listStrChar.length>1?listStrChar.length:10); i++) { // 每行 10 个字  
    var $c=$cell.cloneNode(true)
    $c.id = `writer-${rowIndex}-${i}`; // 为每个格子设置唯一 ID
    $c.char=listStrChar[i]?listStrChar[i]:listStrChar[0]; // 存储当前格子的字符  
    $word.list$Writer[i]=cellDFragment.appendChild($c);
  }
  $word.appendChild(cellDFragment);
  return $word;
}

function funSetCharactor($c){
  // console.debug($c.id,$c.char);
  const writer = HanziWriter.create($c.id, $c.char, {
    width: '150', // px
    height: '150', // px
    showOutline: true,
    showCharacter: false,
    renderer: 'svg',
    // undocumented obscure options
    drawingFadeDuration: 300,
    drawingWidth: 40,
    strokeWidth: 2,
    outlineWidth: 2,
  });
  writer.quiz();
  return writer;
}
function generateBlock(char,rowIndex){

  const $word=target.appendChild($getBlock(char,rowIndex)); 

  $word.list$Writer.forEach(funSetCharactor);
}
function generatePracticeSheet() {
  const input = document.querySelector('.js-char').value.trim();
  const target = document.querySelector('#target');
  target.innerHTML = ''; // 清空之前的内容
  // 先分词
  const listWords = input.split(/\s+/); // 以空格分词
  listWords.forEach(generateBlock);
}

window.onload = function () {
  var char = decodeURIComponent(window.location.hash.slice(1));
  if (char) {
    document.querySelector('.js-char').value = char;
  }

  generatePracticeSheet(); // 初始生成字帖

  // 添加文本框输入完成事件监听
  document.querySelector('.js-char').addEventListener('blur', generatePracticeSheet);

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
  window.addEventListener('resize', generatePracticeSheet);
};
