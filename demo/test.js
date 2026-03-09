var writer;
var isCharVisible;
var isOutlineVisible;

// 分析svg结构，获取笔画路径元素列表
function get$listPath(writer){
  // const $char=writer.target;
  const $listG=writer.target.svg.querySelectorAll(`g`);
  const $outline=$listG[1]; // [1]是画之前显示的outline,最下层
  const $stroke=$listG[2]; //[2]是画完显示的strokeColor，最上层
  // const $drawing=$listG[2];
  if(!$outline || !$stroke){
    console.error("未找到outline或stroke元素！");
    debugger;
    return [];
  }
  return $outline.querySelectorAll("g path");
}
// 显示到特定的某一笔之前，通过改变opacity
function showStrokeByIndex(writer,strokeNum=-1){
  const $listPath=get$listPath(writer);
  for(var i=0;i < $listPath.length;i++){
    if(strokeNum!=-1 && strokeNum<$listPath.length){
      if($listPath[i] && i <= strokeNum){
        $listPath[i].style.opacity=1;
      }else{
        $listPath[i].style.opacity=0;
      }
    }else{
      $listPath[i].style.opacity=1;
    }
  }
}
// 隐藏特定的某一笔之后所有，通过改变opacity
function hideStrokeByIndex(writer,strokeNum=-1){
  const $listPath=get$listPath(writer);
  for(var i=0;i<$listPath.length;i++){
    if(strokeNum!=-1 && strokeNum<$listPath.length){
      if($listPath[i] && i >= strokeNum){
        $listPath[i].style.opacity=0;
      }else{
        $listPath[i].style.opacity=1;
      }
    }else{
      $listPath[i].style.opacity=0;
    }
  }
  
}
// 显示下一笔，通过改变opacity
function showStrokeNext(writer,data){
  const $listPath=get$listPath(writer);

  const $currentPath=$listPath[data.strokeNum];
  showStrokeByIndex(writer,data.strokeNum);
  const $nextPath= (data.strokesRemaining>0 && $listPath[data.strokeNum+1]) ? $listPath[data.strokeNum+1] : null;
  if($nextPath){
    $nextPath.classList.add("dashed");
    $nextPath.style.opacity=1;
  }
}
// 当文字完全显示后，分情况处理（showCharacter，showOutline 控制是通过display:none，所以只改变透明度不可行）
function onLoadCharDataSuccess(data){
  const $c=this;
  $c.params=$c.params || {};
  const writer=$c.writer;
  // const listColor=["#aaa","#ddd","#eee"];
  // 如果是单子练整行
  if($c.parentNode.classList.contains('row')){
    // 第一个展示示例
    if($c.params.index==0){
      // defaultOptions.showCharacter=false;
      // defaultOptions.showOutline=true;
      writer.showCharacter({duration:60})
      $c.params.type="example";
    }
    // 分笔画联系
    if($c.params.index>=1 && $c.params.index < data.strokes.length){
      // defaultOptions.outlineColor=listColor[$c.params.index];
      writer.showOutline({duration:0,onComplete(data){
        hideStrokeByIndex(writer,$c.params.index);
      }})
      $c.params.type="strokePractice";
    }
    // 第三个往后不显示字了
    if($c.params.index > data.strokes.length){
      // defaultOptions.showOutline=false;
      writer.showOutline({duration:0,onComplete(data){
        hideStrokeByIndex(writer,-1);
      }})
      $c.params.type="practiceWithoutExample";
    }
  }
}
function printStrokePoints(data) {
  var pointStrs = data.drawnPath.points.map((point) => `{x: ${point.x}, y: ${point.y}}`);
  console.log(`[${pointStrs.join(', ')}]`);
}
// 当正确描红一笔时，计算分数
function onCorrectStroke(data) {
  console.log(`Correct stroke drawn!`,data);
  const writer=this.writer;
  // const $char=this.getElementsByClassName("char")[0];
}
// 当错误描红，若干次，显示下一笔
function onMistakeStroke(data){
  const writer=this.writer;
  const $char=this;
  // 显示下一笔
  // if(writer.$char.params.type="word" && data.mistakesOnStroke > 10 ) showStrokeNext(writer,data);
  console.debug(`Mistake on stroke !`,data);
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
  
  const $cell = document.createElement('div',{class: 'cell'}); // 创建一个格子
  $cell.classList.add('cell'); // 添加格子的类名

  const $pinyin = document.createElement('div',{"class": 'pinyin'}); // 创建一个格子
  $pinyin.classList.add('pinyin'); // 添加格子的类名
  $cell.appendChild($pinyin);

  const $char = document.createElement('div',{class: 'char'}); // 创建一个格子
  $char.classList.add('char'); // 添加格子的类名
  $cell.appendChild($char);


  return $cell;
}
// 生成格子模板
const $cell = $getCell(); // 创建一个格子

// 块的DOM模板实例化
function $getBlock(char,rowIndex){
  const $word = document.createElement('div'); // 创建一块
  $word.classList.add('word'); // 添加行的类名
  // 以行为单位
  $word.strCharacter=char; // 存储当前行的字符
  $word.list$Writer=[]; // 存储当前行的 HanziWriter 实例列表
  //再分字
  $word.listStrChar=char.split('');
  // 属性定义
  $word.params= $word.params || {};

  const listStrChar=$word.listStrChar
  // 如果是词语
  if(listStrChar.length>1){
      $word.params.type="word";
  }else if(listStrChar.length==1){
    // 如果是单个字
    $word.classList.add('row'); // 添加行的类名
    $word.params.type="character";
  }else{
    $word.params.type="unkonwn";
  }  
  const cellDFragment = document.createDocumentFragment('div'); // 创建一个格子

  for (let i = 0; i < (listStrChar.length>1?listStrChar.length:10); i++) { // 每行 10 个字  
    var $c=$cell.cloneNode(true)
    $c.params=$c.params || {};
    $c.id = `writer-${rowIndex}-${i}`; // 为每个格子设置唯一 ID
    if(i==0)$c.classList.add('first'); // 添加第一格的类名
    $c.params.char=listStrChar[i]?listStrChar[i]:listStrChar[0]; // 存储当前格子的字符
    $c.params.pinyin=pinyinUtil.getPinyin($c.params.char);
    $c.getElementsByClassName("pinyin")[0].innerText=$c.params.pinyin; // 显示拼音

    $c.params.index=i;
    cellDFragment.appendChild($c);

    $word.list$Writer[i]= $c// 存储当前格子的 char 元素
  }
  $word.appendChild(cellDFragment);
  return $word;
}

function funSetCharactor($c){
  $c.$writer=$c.getElementsByClassName("char")[0];
  console.debug($c.params,$c.id);
  const defaultOptions = {
    width: '150', // px
    height: '150', // px
    radicalColor: '#166E16',
    // outlineColor:"#ff000000" ,
    // strokeColor:"#0f0",
    onCorrectStroke: onCorrectStroke.bind($c),
    onMistake: onMistakeStroke.bind($c),
    showOutline: $c.parentNode.classList.contains('row'),
    showCharacter: false,
    renderer: 'svg',
    // undocumented obscure options
    drawingFadeDuration: 300,
    drawingWidth: 40,
    strokeWidth: 2,
    outlineWidth: 2,
    onLoadCharDataSuccess:onLoadCharDataSuccess.bind($c),
  }

  const writer = HanziWriter.create($c.$writer, $c.params.char, defaultOptions);
  writer.quiz({quizStartStrokeNum:$c.params.index?$c.params.index:0});
  $c.writer=writer;
  writer.$char=$c;
  return writer;
}
// 将每个块，初始化writer
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
  // window.addEventListener('resize', generatePracticeSheet);
};
