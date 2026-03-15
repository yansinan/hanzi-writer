// import HanziWriter from "hanzi-writer";
import "./StrokeQualityScorer.js";

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

    initWriter(size=150){
        const $c=this.$cell;
        $c.$writer=$c.getElementsByClassName("char")[0];
        // console.debug($c.params,$c.id);
        const defaultOptions = {
            width: size.toString(), // px
            height: size.toString(), // px
            radicalColor: '#166E16',
            // outlineColor:"#ff000000" ,
            // strokeColor:"#0f0",
            onCorrectStroke: this.onCorrectStroke.bind(this),
            onMistake: this.onMistakeStroke.bind(this),
            showOutline: $c.parentNode.classList.contains('row'),
            showCharacter: false,
            renderer: 'svg',
            // undocumented obscure options
            drawingFadeDuration: 300,
            drawingWidth: 40,
            strokeWidth: 2,
            outlineWidth: 2,
            onLoadCharDataSuccess:this.onLoadCharDataSuccess.bind(this),
        }

        const writer = window.HanziWriter.create($c.$writer, $c.params.char, defaultOptions);
        writer.quiz({quizStartStrokeNum:$c.params.index?$c.params.index:0});
        this.writer=writer;
        writer.$char=$c;
        return writer;
    }

    // 分析svg结构，获取笔画路径元素列表
    get$listPath(writer){
        writer=writer || this.writer;
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
        const $c=this.$cell;
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
    drawPath(pathD,color="#0f0"){
        const $path=document.body.querySelector(".word svg g g path");
        const $pathCopy=$path.cloneNode(true);
        $pathCopy.setAttribute("d", pathD);
        $pathCopy.setAttribute("opacity", 1);
        $pathCopy.setAttribute("stroke", "#0f0");
        $pathCopy.setAttribute("clip-path", "");
        $pathCopy.setAttribute("stroke-width", "10");
        if(src=="user"){
        $pathCopy.setAttribute("stroke-width", "2");
        $pathCopy.setAttribute("stroke", "#f00");
        document.body.querySelector(".word svg").appendChild($pathCopy);
        }else document.body.querySelector(".word svg g g:last-child").appendChild($pathCopy);
    }
    // function printStrokePoints(data) {
    //   var pointStrs = data.drawnPath.points.map((point) => `{x: ${point.x}, y: ${point.y}}`);
    //   console.log(`[${pointStrs.join(', ')}]`);
    // }
    // 当正确描红一笔时，计算分数
    onCorrectStroke(data) {
        console.log(`Correct stroke drawn!`,data.drawnPath);
        const writer=this.writer;
        // const $char=this.getElementsByClassName("char")[0];
        const listPath=this.get$listPath(writer);
        const $currentPath=listPath[data.strokeNum];
        const strCorrectPath=$currentPath.getAttribute("d");
        // const $userPath=writer.target.svg.querySelector("path");
        // const strUserPath=$userPath.getAttribute("d");
        let strUserPath=data.drawnPath.pathString;


        // //当前 svg.g.g
        // // const $char=writer.target;
        // const $listG=writer.target.svg.querySelectorAll(`g`);
        // const $outline=$listG[1]; // [1]是画之前显示的outline,最下层
        // // const $stroke=$listG[2]; //[2]是画完显示的strokeColor，最上层
        // // Path -> SVG 的矩阵
        // let matCurrentPath=$currentPath.getCTM();
        // // SVG -> Path 的矩阵
        // const matSVGToCurrentPath=matCurrentPath.inverse();
        // // Path -> Group 的矩阵
        // // const pathToGroup = matSVGToCurrentPath.multiply(pathToViewport);

        // // 4. 应用转换
        // // let transformedPoint = point.matrixTransform(pathToGroup);
        // // 将用户路径也转换到和标准路径相同的坐标系下
        
        // 用户轨迹转成字体坐标
        strUserPath="";
        data.drawnPath.points.forEach((p,idx)=>{
            let strCMD="L ";
            if(idx==0)strCMD="M ";
            strUserPath+=strCMD+p.x+" "+p.y+" ";
        }) 
        console.log("strCorrectPath",strCorrectPath);
        console.log("strUserPath",strUserPath);
        const res=scorePaths(strCorrectPath,strUserPath,128);


        // 画出用户线
        const strColor=gradientHSL('#ff0000', '#00ff00', Math.round(res));
        const $userPath=$currentPath.cloneNode(true);
        $userPath.setAttribute("clip-path", "");
        $userPath.setAttribute("d", data.drawnPath.pathString);
        // $userPath.setAttribute("opacity", 0.2);
        $userPath.setAttribute("stroke", strColor);
        $userPath.setAttribute("stroke-width", "5");
        $userPath.style.opacity=0.7;
        writer.target.svg.appendChild($userPath);

        console.log("当前笔画评分：",res,strColor)
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