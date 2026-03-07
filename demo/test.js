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

function funSetCharactor(id,char){
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {

    })
  });
  const writer = HanziWriter.create(id, char, {
    width: '150', // px
    height: '150', // px
    showOutline: true,
    showCharacter: false,
    renderer: 'svg',
  });
  writer.quiz();
  return writer;
}
function generateRow(char,rowIndex){
  const row = document.createElement('div'); // 创建一行
  row.classList.add('row'); // 添加行的类名
  target.appendChild(row);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const cell = document.createElement('div'); // 创建一个格子
      cell.classList.add('cell'); // 添加格子的类名

      const cellDFragment = document.createDocumentFragment('div'); // 创建一个格子

      for (let i = 0; i < 10; i++) { // 每行 10 个字

        var c=cell.cloneNode(true)
        c.id = `writer-${rowIndex}-${i}`; // 为每个格子设置唯一 ID
        c=cellDFragment.appendChild(c);
        // c.addEventListener('click', function () {
        //   funSetCharactor(this.id,"书");
        //   console.debug(this.id);
        // });    
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // 创建 HanziWriter 实例
            funSetCharactor(`writer-${rowIndex}-${i}`,char)
          })
        });
      }
      row.appendChild(cellDFragment);

      
      // // 生成第一个字
      // setTimeout(() => {
      //     // 创建 HanziWriter 实例
      //     console.debug(`writer-${rowIndex}-${0}`,row.offsetHeight);
      //     funSetCharactor(`writer-${rowIndex}-${0}`,char)
      // },10000)

    })
  });


}
function generatePracticeSheet() {
  const input = document.querySelector('.js-char').value.trim();
  const target = document.querySelector('#target');
  target.innerHTML = ''; // 清空之前的内容

  input.split('').forEach(generateRow);
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
