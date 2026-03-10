// import HanziWriter from "hanzi-writer";


class PracticeCellHelper{
    
    // 生成格子模板 
    static $getCell(){        
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
    static $cell = PracticeCellHelper.$cell || PracticeCellHelper.$getCell(); // 创建一个格子


    static get$Writer(id,strChar,index){
        const cellHelper = new PracticeCellHelper();
        cellHelper.params=cellHelper.params || {};
        cellHelper.params.index=index;
        cellHelper.params.char=strChar; // 存储当前格子的字符
        cellHelper.params.pinyin=pinyinUtil.getPinyin(cellHelper.params.char);

        cellHelper.$cell=PracticeCellHelper.$cell.cloneNode(true)
        cellHelper.$cell.id = id; // 为每个格子设置唯一 ID
         if(index==0)cellHelper.$cell.classList.add('first'); // 添加第一格的类名
       cellHelper.$cell.getElementsByClassName("pinyin")[0].innerText=cellHelper.params.pinyin; // 显示拼音

        // Object.defineProperty(cellHelper.$cell, "params", {
        //     get() { return cellHelper.params; },
        //     // set(in)=>{cellHelper.params=in},
        // });
        cellHelper.$cell.params=cellHelper.params;
        Object.defineProperty(cellHelper.$cell, "writer", {
            get() { return cellHelper.writer; }
        });
        cellHelper.$cell.helper=cellHelper;
        return cellHelper.$cell;
    }
    
    $cell=null;
    params={};
    // hanzi-writer实例
    writer=null;

    initWriter(){
        const $c=this.$cell;
        $c.$writer=$c.getElementsByClassName("char")[0];
        console.debug($c.params,$c.id);
        const defaultOptions = {
            width: '150', // px
            height: '150', // px
            radicalColor: '#166E16',
            // outlineColor:"#ff000000" ,
            // strokeColor:"#0f0",
            onCorrectStroke: this.onCorrectStroke.bind($c),
            onMistake: this.onMistakeStroke.bind($c),
            showOutline: $c.parentNode.classList.contains('row'),
            showCharacter: false,
            renderer: 'svg',
            // undocumented obscure options
            drawingFadeDuration: 300,
            drawingWidth: 40,
            strokeWidth: 2,
            outlineWidth: 2,
            onLoadCharDataSuccess:this.onLoadCharDataSuccess.bind($c),
        }

        const writer = window.HanziWriter.create($c.$writer, $c.params.char, defaultOptions);
        writer.quiz({quizStartStrokeNum:$c.params.index?$c.params.index:0});
        this.writer=writer;
        writer.$char=$c;
        return writer;
    }

    // 分析svg结构，获取笔画路径元素列表
    get$listPath(writer){
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
    showStrokeByIndex(writer,strokeNum=-1){
        const $listPath=this.get$listPath(writer);
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
    hideStrokeByIndex(writer,strokeNum=-1){
        const $listPath=this.get$listPath(writer);
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
    showStrokeNext(writer,data){
        const $listPath=this.get$listPath(writer);

        const $currentPath=$listPath[data.strokeNum];
        this.showStrokeByIndex(writer,data.strokeNum);
        const $nextPath= (data.strokesRemaining>0 && $listPath[data.strokeNum+1]) ? $listPath[data.strokeNum+1] : null;
        if($nextPath){
            $nextPath.classList.add("dashed");
            $nextPath.style.opacity=1;
        }
    }
    // 当文字完全显示后，分情况处理（showCharacter，showOutline 控制是通过display:none，所以只改变透明度不可行）
    onLoadCharDataSuccess(data){
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
                $c.helper.hideStrokeByIndex(writer,$c.params.index);
            }})
            $c.params.type="strokePractice";
            }
            // 第三个往后不显示字了
            if($c.params.index > data.strokes.length){
            // defaultOptions.showOutline=false;
            writer.showOutline({duration:0,onComplete(data){
                $c.helper.hideStrokeByIndex(writer,-1);
            }})
            $c.params.type="practiceWithoutExample";
            }
        }
    }
    // function printStrokePoints(data) {
    //   var pointStrs = data.drawnPath.points.map((point) => `{x: ${point.x}, y: ${point.y}}`);
    //   console.log(`[${pointStrs.join(', ')}]`);
    // }
    // 当正确描红一笔时，计算分数
    onCorrectStroke(data) {
        console.log(`Correct stroke drawn!`,data);
        const writer=this.writer;
        // const $char=this.getElementsByClassName("char")[0];
    }
    // 当错误描红，若干次，显示下一笔
    onMistakeStroke(data){
        const writer=this.writer;
        const $char=this;
        // 显示下一笔
        // if(writer.$char.params.type="word" && data.mistakesOnStroke > 10 ) showStrokeNext(writer,data);
        console.debug(`Mistake on stroke !`,data);
    }
}

export default PracticeCellHelper