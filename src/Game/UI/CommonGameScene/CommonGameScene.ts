// 状态16位颜色
const ANSWER_SELECT_COLORS = [0xDBF8EA,0xFFCDCC,]
const ANSWER_RADIO_COLORS = [0x13D990,0xFF514E,0x23BFD5]
const TIME_PPROGRESS_COLORS = [0x23BFD5,0xCBF0F5]
const ANSWER_BORDER_COLOR = 0xEDDEFF

const answerOptions = ['A','B','C','D','E','F','G','H']
const lineOptionReg = /\{\s*([A-H]{1})\s*\}/g

class CommonGameScene extends CommonScene{

	// 游戏窗口
	public game_window:eui.Group;
    // 游戏过渡文字
	public transtions:eui.Label
    // 题目类型
	public question_type:eui.Label
	// 题目盒子
	public question_box:eui.Group

	// 题目滚动盒
	private question_title_scroller:eui.Scroller
	// 答案滚动盒
	private question_answer_scroller:eui.Scroller
	// 爱心数量
	public credit:eui.Label
	// 规则盒子
	public question_rule:eui.Group
	// 答案盒子
	public question_answer:eui.Group
    // 答案按钮存储对象
	public question_answers:{ 
		btn:eui.Group,
		bg:eui.Rect,
		text:eui.Label,
		option:{
			btn:eui.Group,
			radiobox:eui.Rect,
			radio_checked:eui.Rect,
		},
		check:{
			btn:eui.Group,
			checked:eui.Image,
			unchecked:eui.Image,
		}
		line:{
			btn:eui.Group,
		},
		rival:{
			border:eui.Rect,
			img:eui.Image
		}
		icon:eui.Image[]
	}[] = []
	 // 图片答案按钮存储对象
	public img_question_answers:{
		btn:eui.Group,
		border:eui.Rect,
		img:eui.Image,
		rival:{
			border:eui.Rect,
			img:eui.Image
		}
		option:{
			btn:eui.Group,
		},
		check:{
			btn:eui.Group,
			checked:eui.Image,
			unchecked:eui.Image,
		}
		icon:any[]
	}[] = []

    // 答案按钮
    public answer_1:eui.Group;
    public answer_2:eui.Group;
    public answer_3:eui.Group;
    public answer_4:eui.Group;
	public answer_5:eui.Group;
	public answer_6:eui.Group;
	public answer_7:eui.Group;
	public answer_8:eui.Group;

	// 图片答案按钮
	public answer_img_1:eui.Group;
    public answer_img_2:eui.Group;
    public answer_img_3:eui.Group;
    public answer_img_4:eui.Group;
	

	// 文字类型题目
	public text_question:eui.Group

	// 图片类型题目
	public img_question:eui.Group

	// 游戏问题数
	public questions_num = 0;
	// 游戏问题
	public questions = []

    // 倒计时进度
	public time_progress:eui.Group;
	public time_progress_block = []
    // 倒计时
    public timeout:eui.Label

	// 是否已经离开游戏场景
	public isleave = false
    // 收集tw 切换场景时删除
    public Tweens = []

	// 底部按钮
	public bottom_btns:eui.Group;
	// 是否显示底部按钮
	public show_bottom_btns:boolean
	// 提交按钮
	public submit_btn:eui.Group;
	// 重置按钮
	public reset_btn:eui.Group;
	
	// 答案不可点击状态
	public disabled_answer_btn:boolean;

    /** 初始化方法 ***/

    // 清楚Tween 
    public init(){
        this.time_progress_block = this.querySelector(this.time_progress,'time_progress_item',true)
        this.time_progress_block = this.time_progress_block.reverse();
    }
	public setQuestions(questions){
		this.questions_num = questions.length
		this.questions = questions
	}
    // 初始化按钮
    public initAnswerBtn(btnCb = (index:number)=>{}, imgBtnCb = (index:number)=>{}){
		for( let i = 1; i <= 8; i++ ){
			const answer = this[`answer_${i}`]
			const answerObject = { 
				btn:answer,
				bg:this.querySelector(answer,'question_bg'),
				option:{
					btn:this.querySelector(answer,'radio'),
					radiobox:this.querySelector(answer,'radio_box'),
					radio_checked:this.querySelector(answer,'radio_checked'),
				},
				check:{
					btn:this.querySelector(answer,'checkbox'),
					checked:this.querySelector(answer,'checkbox_checked'),
					unchecked:this.querySelector(answer,'checkbox_unchecked'),
				},
				line:{
					btn:this.querySelector(answer,'line'),
				},
				text:this.querySelector(answer,'answer_text'),
				rival:{
					border:this.querySelector(answer,'rival_icon_border'),
					img:this.querySelector(answer,'rival_img'),
				},
				icon:[
					this.querySelector(answer,'right_icon'),
					this.querySelector(answer,'error_icon'),
                    this.querySelector(answer,'rival_icon'),
				]
			}
			// 设置对手头像边框
			if(answerObject.rival.border){
				this.setBackGround(answerObject.rival.border,[0xF61737,0x3481F3],20)
			}
			this.question_answers.push(answerObject)
            answerObject.btn.addEventListener(egret.TouchEvent.TOUCH_TAP,()=>{
				if(this.disabled_answer_btn) return
				btnCb(i-1)
			},answerObject.btn)
			answerObject.bg.alpha = 0;

			const img_answer = this[`answer_img_${i}`]
			if( img_answer ){
				const imgAnswerObject = { 
					btn:img_answer,
					border:this.querySelector(img_answer,'answer_img_border'),
					img:this.querySelector(img_answer,'answer_img'),
					option:{
						btn:this.querySelector(img_answer,'option'),
					},
					check:{
						btn:this.querySelector(img_answer,'checkbox'),
						checked:this.querySelector(img_answer,'checkbox_checked'),
						unchecked:this.querySelector(img_answer,'checkbox_unchecked'),
					},
					rival:{
						border:this.querySelector(img_answer,'rival_icon_border'),
						img:this.querySelector(img_answer,'rival_img'),
					},
					icon:[
						this.querySelector(img_answer,'answer_img_right'),
						this.querySelector(img_answer,'answer_img_error'),
						this.querySelector(img_answer,'answer_img_btn'),
						this.querySelector(img_answer,'rival_icon'),
					]
				}
				this.img_question_answers.push(imgAnswerObject)
				imgAnswerObject.btn.addEventListener(egret.TouchEvent.TOUCH_TAP,() => {
					if(this.disabled_answer_btn) return
					imgBtnCb(i-1)
				},imgAnswerObject.btn)
			}
		}
	}
	public resetScrollerPoint(){
		this.question_title_scroller.viewport.scrollV = 0
		this.question_answer_scroller.viewport.scrollV = 0
	}
    // 重置游戏场景
	public resetGameScene(){
		this.question_type.alpha = 0,
		this.question_box.alpha = 0,
		this.question_rule.alpha = 0,
		this.question_answer.alpha = 0
	}
    // 重置按钮状态
	public resetAnswerBtn(){
		// 可优化 减少for次数
		this.question_answers.forEach((item,index)=>{
			item.icon.forEach(i=> i && (i.visible = false) )
			// 单选题
			item.option.btn.visible = false
			item.check.btn.alpha = 0
			item.option.radiobox.fillColor = ANSWER_RADIO_COLORS[2];
			item.option.radio_checked.alpha = 0
			item.option.radio_checked.fillColor = ANSWER_RADIO_COLORS[2];
            item.option.radiobox && item.option.radiobox.alpha === 0 && (item.option.radiobox.alpha = 1);
			// 多选题
			item.check.btn.visible = false
			item.check.btn.alpha = 0
			item.check.checked.visible = false;
			item.check.unchecked.visible = true;
			// 连线题
			item.line.btn.visible = false
			item.check.btn.alpha = 0

			item.bg.alpha = 0;
			
		})

		if( this.img_question_answers.length ){
			this.img_question_answers.forEach((item,index)=>{
				item.icon.forEach(i=> i && (i.visible = false) )
				item.icon[2].visible = true
				item.option.btn.visible = false
				item.check.btn.visible = false
				item.border.fillColor = ANSWER_BORDER_COLOR;
				// 多选题
				item.check.btn.visible = false
				item.check.btn.alpha = 0
				item.check.checked.visible = false;
				item.check.unchecked.visible = true;
			})
		}
	}
	public clearnTween(){
		egret.Tween.removeAllTweens()
		this.Tweens.forEach(el=> egret.Tween.removeTweens(el))
		this.Tweens.length = 0;
	}
    // 重制进度样式
	public resetTimeProgress(){
		this.time_progress_block.forEach(item=>{
			item.fillColor = TIME_PPROGRESS_COLORS[1]
		})
	}
    // 重置过渡层
	public resetTranstions(){
		this.transtions.visible && (this.transtions.visible = false)
	}
    // 监听倒计时时间
	public onTiemout(progress,time){
		if( progress.hasOwnProperty(time) ){
			this.time_progress_block[progress[time]].fillColor = TIME_PPROGRESS_COLORS[0]
		}
	}
    
    /*** 游戏动画方法 ***/

    // 显示过渡文字
	public showTranstions(text):Promise<any>{
		this.transtions.text = text;
		// this.addChild(this.transtionsScreen);
		this.transtions.visible = true;
		const tw = this.myTween(this.transtions);
		return new Promise(resolve=>{
			tw.to({ size:60 },500,egret.Ease.backInOut)
			.to({ alpha:0 },500,egret.Ease.backInOut)
			.call(()=>{
				this.transtions.size = 40;
				this.transtions.alpha = 1;
				this.transtions.visible = false;
				resolve();
			})
		})
	}
	// 显示题目场景
	public showQuestion(){
		return new Promise(async relsove=>{
			// this.addChild(this.question_screen)
			const shower = [
				...[
					this.question_type,
					this.question_box,
					this.question_rule,
					this.question_answer
				],
				...( this.show_bottom_btns ? [this.bottom_btns] : [] )
			]

			let showedIndex = 0;
			let p = this.showQuestionAmin(shower[showedIndex]);
			while( showedIndex !== shower.length - 1 ){
				await this.myPromise( p.then( ()=> p = this.showQuestionAmin(shower[++showedIndex]) ) );
			}
			// 题目显示完毕 可以点击进行选择答案按钮
			this.disabled_answer_btn = false
			relsove()
		})
	}
		// 隐藏题目场景
	public hideQuestion(){
		
		return new Promise(relsove=>{
			const shower = [
				this.question_type,
				this.question_box,
				this.question_rule,
				this.question_answer,
				this.bottom_btns,
			]
			shower.forEach(show=>{
				let tw = this.myTween(show)
				// tw.wait(800)
				.to({ alpha:0 },500,egret.Ease.circOut);
			})
			const timer = setTimeout(()=>{
				relsove();
				// 题目隐藏 不可点击选择答案按钮
				this.disabled_answer_btn = true
				clearTimeout(timer);
			},500);

			
		})
	}
	// 显示题目场景动画
	public showQuestionAmin(show):Promise<any>{
		const p = new Promise(relsove=>{
			let tw = this.myTween(show);
			tw.to({ alpha:1 },300,egret.Ease.circIn);
			tw.call( ()=> relsove() );
		})
		return p
	}
	// 点击按钮时的动画
	public tapAnswerAmin(selected):Promise<any>{
		return new Promise(relsove=>{
			let tw = this.myTween(selected.btn);
			tw.to({ scaleX:1.02,scaleY:1.02 },200,egret.Ease.backInOut)
			.to({ scaleX:1,scaleY:1 },200,egret.Ease.backInOut)
			// .wait(500)
			.call(relsove);
		})
	}
    // 错误动画
	public errorAmin():Promise<any>{
		const x = this.game_window.x
		return new Promise(relsove=>{
			let tw = this.myTween(this.game_window);
			tw.to({ x:x-10 },100,egret.Ease.cubicInOut)
			.to({ x:x+10 },100,egret.Ease.cubicInOut)
			.to({ x:x-10 },100,egret.Ease.cubicInOut)
			.to({ x:x },100,egret.Ease.cubicInOut)
			// .wait(500)
			.call(relsove);
		})
	}

    /*** 工具类 ***/
	public setBackGround(el:eui.Rect,colors,round?){
        
        const width = el.width;
		const height = el.height;
		const gradient = new egret.Shape();
        var matrix = new egret.Matrix();
        matrix.createGradientBox(width, height, Math.PI * 0.5, 0, 0);
        gradient.graphics.beginGradientFill(egret.GradientType.LINEAR, colors, [1, 1], [0, 255], matrix);
        if( round ){
            gradient.graphics.drawRoundRect(0, 0, width, height,round)
        }else{
            gradient.graphics.drawRect(0, 0, width, height);
        }
        gradient.graphics.endFill();
        el.addChild(gradient)
	}
	// 根据name查找元素
	public querySelector(element,name,all = false){
		const ret = [];
		const elements = element.$children
		// console.log( elements,'elements', element ,'element', element.$children )
		if( !elements.length ) return all ? [] : undefined;
		for( let i = 0, len = elements.length; i<len; i++ ){
			if( elements[i].name === name ){	
				if(all){
					 ret.push(elements[i])
				}else{
					return elements[i]
				}
			}
			if( elements[i].$children && elements[i].$children.length ){
				  const match = this.querySelector(elements[i],name,all)
                  if(all){
					if(match.length) ret.push(...match);
				  }else{
					if( match ) return match;
				  }
			}else{
				continue;
			}
		}
		
		if( all ){
			return ret;
		}
	}
	// 当游戏离开 则中断Promise
	public myPromise(then){
		return new Promise(async (resolve,reject)=>{
			if(this.isleave) reject()
			const result = await then;
			if(this.isleave) reject()
			resolve(result)
		})
	}
	public myTween(el){
		const tw = egret.Tween.get(el)
		this.Tweens.push(el)
		tw.call(()=>{
			const findIndex = this.Tweens.indexOf(el);
			this.Tweens.splice(findIndex,1)
		})
		return tw
	}
}