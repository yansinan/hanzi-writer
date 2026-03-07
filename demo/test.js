var writer;
var isCharVisible;
var isOutlineVisible;

function printStrokePoints(data) {
  var pointStrs = data.drawnPath.points.map((point) => `{x: ${point.x}, y: ${point.y}}`);
  console.log(`[${pointStrs.join(', ')}]`);
}

function updateCharacter() {
  document.querySelector('#target').innerHTML = '';

  var character = document.querySelector('.js-char').value;
  window.location.hash = character;
  writer = HanziWriter.create('target', character, {
    width: 400,
    height: 400,
    renderer: 'svg',
    radicalColor: '#166E16',
    onCorrectStroke: printStrokePoints,
    onMistake: printStrokePoints,
    showCharacter: false,
  });
  isCharVisible = true;
  isOutlineVisible = true;
  window.writer = writer;
}

function updateCharacterFromInput() {
  const input = document.querySelector('.js-char');
  const firstChar = input.value.trim().charAt(0); // 提取首个汉字
  if (firstChar) {
    input.value = firstChar; // 保留首个汉字
    updateCharacter(); // 更新显示

    writer.quiz({
      showOutline: true,
    });
  }
}

window.onload = function () {
  var char = decodeURIComponent(window.location.hash.slice(1));
  if (char) {
    document.querySelector('.js-char').value = char;
  }

  updateCharacter();

  // 添加文本框输入完成事件监听
  document.querySelector('.js-char').addEventListener('blur', updateCharacterFromInput);

  document.querySelector('.js-toggle').addEventListener('click', function () {
    isCharVisible ? writer.hideCharacter() : writer.showCharacter();
    isCharVisible = !isCharVisible;
  });
  document.querySelector('.js-toggle-hint').addEventListener('click', function () {
    isOutlineVisible ? writer.hideOutline() : writer.showOutline();
    isOutlineVisible = !isOutlineVisible;
  });
  document.querySelector('.js-animate').addEventListener('click', function () {
    writer.animateCharacter();
  });

};
