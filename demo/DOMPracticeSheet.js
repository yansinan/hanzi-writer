
import PracticeCellHelper from "./PracticeCellHelper.js";

// import("./PracticeCellHelper.js")
class DOMPracticeSheet{


    // 输入的联系内容
    listBlockWords=[];
    // 每一个练习块
    $listBlocks=[];
    // 练习块的大小
    sizeWriter=100;

    constructor($container,strInput,inSize=100){
        this.$container=$container;  
        
        this.init(strInput,inSize);

    }
    // 生成块DOM实例，并返回
    $getBlock(char,rowIndex){
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

        for (let i = 0; i < (listStrChar.length>1?listStrChar.length:20); i++) { // 每行 10 个字  
            const strChar=listStrChar[i]?listStrChar[i]:listStrChar[0];
            const index=i;
            const id=`writer-${rowIndex}-${index}`; // 为每个格子设置唯一 ID
            
            const $c =PracticeCellHelper.get$Writer(id,strChar,index); // 获取一个格子

            cellDFragment.appendChild($c);

            $word.list$Writer[i]= $c// 存储当前格子的 char 元素
        }
        $word.appendChild(cellDFragment);
        return $word;
    }
    setCellSize(inSize){
        // 设置屏显大小
        this.sizeWriter=inSize;
        document.documentElement.style.setProperty("--size-writer", this.sizeWriter);
        // 如果有练习块，更新每个块的大小
        // if(this.$listBlocks.length>0){
        //     this.$listBlocks.forEach(($block)=>{
        //         $block.list$Writer.forEach(($c)=>{
        //             debugger
        //             $c.helper.writer.updateDimensions({width:this.sizeWriter,height:this.sizeWriter});
        //         });
        //     });
        // }
        return this.sizeWriter
    }
    // 将每个块，初始化writer
    init(strInput,inSize=100){ //size px 为单位
        if(!strInput) {
            this.$container.innerHTML = ''; // 清空之前的内容
            throw new Error("请输入练习内容");
        }
        // 先清空？？
        // document.querySelector('#target').innerHTML = '';

       this.sizeWriter=this.setCellSize(inSize);

        this.strInput=strInput;
        // 先分词
        this.listBlockWords = strInput.split(/\s+/); // 以空格分词

        this.$listBlocks=[];
        this.listBlockWords.forEach((char,rowIndex)=>{
            // 生成DOM块
            const $block=this.$container.appendChild(this.$getBlock(char,rowIndex));
            this.$listBlocks.push($block); 
            // 初始化writer
            $block.list$Writer.forEach(($c)=>{
                $c.helper.initWriter(this.sizeWriter);
            });
        });
        return this.listBlockWords;
    }
}

export default DOMPracticeSheet