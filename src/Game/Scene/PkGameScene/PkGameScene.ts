
const PKGameTimeout = new Timeout();

class PkGameScene extends CommonGameScene{

	// 重连中标识
	private reconnect = true;
	
	// 玩家pk进度
	private gamer_top:eui.Group;
	// 玩家group
	private game_group:eui.Group;
	// 分数进度条
	private score_process:eui.Rect[];

	// 确认按钮
	private sure_btn:eui.Group

	// 当前问题索引Lable
	private question_index:eui.Label
	// 当前游戏答案索引
	private current_quetion_index = 0;
	// 记录玩家是否选择了题目
	private player_selected = false

	// 玩家选择
	// private player_selected_index = -1;
	private player_right_count = 0
	// 对手选择
	// private rival_selected_index = -1;
	private rival_right_count = 0

	private user_avatar:eui.Image
	private rival_avatar:eui.Image

	// 多选题选择选项
	private checkSelectOptions = []
	// 连线题选择选项
	private lineSelectOptions = []

	// 题目结果
	// 每次对方 我方选择完题目 触发sumbit事件
	// 监听返回的答题结果会存入result 
	// 双方回答完毕后 当触发next_question时会从result中得到双方答案进行检查 
	// 检查完毕后会把result清空 准备存入下条题目的双方答案
	private result = []

	// 题目标题
	private question_title:eui.Label
	// 题干背景
	private question_bg:eui.Image
	// 已经提交过
	private submited = false
	
	public constructor() {
		super();
	}

	private static shared:PkGameScene;
	
	public static getInstance(){
		if( !PkGameScene.shared){
			PkGameScene.shared = new PkGameScene();
		}
		return PkGameScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
		RES.getResAsync("game")
	}

	protected childrenCreated():void
	{
		super.childrenCreated();
		// this.setBackBtn(()=>{
		// 	this.reset.bind(this)(1)
		// 	this.leaveGame()
		//  // 为了中断Promise 和 动画 设置的变量
		// 	this.isleave = true;
		// })
		this.init()
	}

	/* 初始化方法 */
	public init(){
		super.init();
		this.submit_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.submit,this) 
		this.reset_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.resetBtn,this)
		this.question_bg.addEventListener(egret.TouchEvent.TOUCH_TAP,this.prviewImg,this) 
		this.initAnswerBtn(this.selectAnswer.bind(this),this.selectImgAnswer.bind(this))
		this.resetGameScene();
		this.score_process = this.querySelector(this.gamer_top,'score_process',true)
		
		// 设置双方头像背景
		const avaterImgs = this.querySelector(this.gamer_top,'avater_img',true)
		const avaterBgs = this.querySelector(this.gamer_top,'avater_bg',true)
		this.setBackGround( avaterBgs[0] , [0x84FEB4,0x3CD9CF] , 20)
		this.setBackGround( avaterBgs[1] , [0xF30039,0x387BF2] , 20)
	}
	private writeQuestion(){
		const store = Store.getInstance()
		const { title,options,question_type,background,credit } = store.battle.current_question;
		const types = {
			option:"单选题",
			check:"多选题",
			line:"连线题"
		};
				
		console.log( store.battle.current_question , 'store.battle.current_question' )
		this.credit.text = `+${credit}`
		this.question_type.text = `—— ${types[question_type]} ——`
		// 是否有题干背景 判断是否显示显示
		if( background ){
			Utils.ImageLoader(background).then(res=>{
				this.question_bg.source = res
				this.question_bg.width = 200
				this.question_bg.visible = true

			})
		}else{
			this.question_bg.width = 0
			this.question_bg.visible = false
		}

		// 判断是图片题还是文字题
		const isImgQuestion = options.some( (i:any) =>  i.image !=='' && i.image !== '/upload/test' )
		
		// 题目类型模块的控制显示隐藏
		if( isImgQuestion ){
			store.battle.current_question.isimg_question = true
			this.img_question.visible = true
			this.text_question.visible = false
		}else{
			this.img_question.visible = false
			this.text_question.visible = true
		}

		// 题目数量的控制显示隐藏
		if( isImgQuestion ){
			this.img_question_answers.forEach((item,index)=>{
				if( options[index] ){
					item.btn.visible = true
					Utils.ImageLoader(options[index].image).then(res=>{
						item.img.source = res
					})
					const btn = item[question_type === 'check' ? 'check' : 'option'].btn
					btn.alpha = 1
					btn.visible = true
				}else{
					item.btn.visible = false
				}
			})
		}else{
			this.question_answers.forEach((item,index)=>{
				// 题目中有选项则展示 没有则把选项隐藏
				if( options[index] ){
					item.btn.maxHeight = 999
					item.btn.minHeight = 94
					item.btn.visible = true
					item.text.text = options[index].text
					const btn = item[question_type === 'check' ? 'check' : 'option'].btn;
					btn.alpha = 1
					btn.visible = true
				}else{
					item.btn.maxHeight = 0
					item.btn.minHeight = 0
					item.btn.visible = false
				}
			})
		}
		
		// 设置题干
		if( question_type === 'line' ){
			this.question_title.textFlow = this.formatLineQuestionTitle()
		}else{
			this.question_title.text = title
		}
		// 设置多选按钮
		if( question_type === 'check' || question_type === 'line' ){
			this.show_bottom_btns = true
		}else{
			this.show_bottom_btns = false
		}
		
		// 设置重置按钮
		if( question_type === 'line' ){
			this.reset_btn.width = 280;
			this.reset_btn.visible = true
		}else{
			this.reset_btn.visible = false
			this.reset_btn.width = 0;
		}
	}
	private formatLineQuestionTitle(){
		const store = Store.getInstance()
		const { title } = store.battle.current_question
		const textArr = title.split(lineOptionReg)
		// 填空次数
		let fillCount = 0;
		return textArr.map((text,index)=>{
			const option = text.trim()
			// 选项处理
			if(  answerOptions.indexOf(option) !== -1 ){
				text = this.lineSelectOptions[fillCount] ? 
					`   ${this.lineSelectOptions[fillCount]}    ` :`        `;
				++fillCount;
				return { text, style:{ "size": 34,"underline" : true }}
			};
			// 其他文字处理
			return { text, style: {"size": 34} }
		})
	}
	// 重置所有需要重置的状态
	private async reset(quetionIndex){
		// 设置问题索引
		this.current_quetion_index = quetionIndex;

		/**** 最先处理过渡层 防止上一次过渡层动画残留 */
		// 清除tween
		this.clearnTween()
		// 重置过渡层
		this.resetTranstions()
		// 隐藏题目
		if( quetionIndex !== 0 ){
			await this.hideQuestion()
		}
		// scroller滚动到初始位置
		this.resetScrollerPoint()
		// 清空用户选择的多选题选项
		this.checkSelectOptions = []
		// 清空用户选择连线题选项
		this.lineSelectOptions = []
		
		// 重置玩家答案选择
		this.resetGamerSelectedState()
		// 重制计时器
		const store = Store.getInstance();
		PKGameTimeout.setSeconds(store.battle.current_question.solve_time)
		PKGameTimeout.restTimeout(this.timeout);
		this.resetTimeProgress()
		// 恢复状态 玩家可以再次选择答案
		this.player_selected = false;
		this.submited = false;
		this.resetGameScene();
		// 重制按钮选中状态
		this.resetAnswerBtn();
		this.question_index.text = `${quetionIndex + 1}/${this.questions_num}`
	}

	// 重置玩家答案选择
	private resetGamerSelectedState(){
		// this.player_selected_index = -1;
		// this.rival_selected_index = -1;
		this.result = []
	}
	// 设置双方玩家信息
	private setUserInfo(){
		const { user, rival } = Store.getInstance()
		Utils.ImageLoader(user.avatar).then((res)=>{
			this.user_avatar.source = res
		})
		Utils.ImageLoader(rival.avatar).then((res)=>{
			this.rival_avatar.source = res
			this.question_answers.forEach((option)=>{
				Utils.ImageLoader(rival.avatar).then((res)=>{
					option.rival.img.source = res
				})
			})
			this.img_question_answers.forEach((option)=>{
				Utils.ImageLoader(rival.avatar).then((res)=>{
					option.rival.img.source = res
				})
			})
		})
	}
	public async startGame():Promise<any>{
		const store = Store.getInstance()

		// 进入游戏	
		this.setUserInfo()

		// 重置得分进度
		this.player_right_count = 0
		this.rival_right_count = 0
		this.score_process.forEach((p,index)=>{ p.width = 0 })
		
		this.isleave = false
		// 设置题目数
		this.questions_num = store.battle.totle
		// 重置
		await this.myPromise(this.reset(0))
		// 写入题目
		this.writeQuestion()
		await this.myPromise(this.showTranstions('开始'));
		await this.myPromise(this.showQuestion());
		// this.AI(this.selectAnswer)
		PKGameTimeout.startTimeOut(this.timeout,this.onTiemout.bind(this),this.timeoutHandle.bind(this))

		const socket = SocketIO.getInstance().socket
		const loading = Loading.getInstance()

		const disconnect = ()=>{
			this.reconnect = true;
			loading.show('重连中...')
			SocketIO.getInstance().init()
			const timer = setTimeout(()=>{
				if( this.reconnect ){
					// 5秒后关闭重链接提示
					loading.hide()
					alert('重连失败')
					this.reconnect = false	
					// 退到上个页面
					SceneManager.getInstance().popScene()
				}
				clearTimeout(timer)
			},5000)
		}

		const connect = ()=>{
			this.reconnect = false;
			loading.hide()
			// 重新加入房间
			socket.emit('battle',{
				"type":"join",
				"target":store.battle.roomid,
				"user_id":store.user._id
			})
		}

		socket.on('disconnect',disconnect)
		socket.on('connect',connect)

		socket.on('battle',async (res)=>{

			if(res.type === 'submit'){
				console.log('submit',res)
				const { user,answer,is_correct } = res
				// 似乎可以去除这段代码
				this.result.push({
					is_correct,
					answer,
					user
				})

				const question_type = store.battle.current_question.question_type
				const isimg_question = store.battle.current_question.isimg_question

				// 单选题设置选中的状态
				if( question_type ===  'option' ){
					// 超时时会提交空字符串
					if( answer !== "" ){
						this[isimg_question ? 'setOptionImgAnswerSelected' : 'setOptionAnswerSelected']( answerOptions.indexOf(answer),
					 		store.user._id === user._id ? 'player' : 'rival')	
					}
				}
				// 多选题设置选中的状态
				if( question_type ===  'check' ){
					//	用户自己已经在选择时展示选中状态了 只需要设置对手的选中状态即可
					if( store.user._id !== user._id ){
						answer.split('').forEach(option=>{
							this[isimg_question ? 'setCheckImgAnswerSelected' : 'setCheckAnswerSelected']( answerOptions.indexOf(option), 'rival')
						})
					}	
				}
				// 连线题设置选中的状态
				if( question_type ===  'line' ){
					//	用户自己已经在选择时展示选中状态了 只需要设置对手的选中状态即可
					if( store.user._id !== user._id ){
						answer.split('').forEach(option=>{
							this[isimg_question ? 'setOptionImgAnswerSelected' : 'setOptionAnswerSelected']( answerOptions.indexOf(option), 'rival')
						})
					}	
				}
			}

			if(res.type === 'next_question'){
				console.log('emit next_question')
				const { question , result } = res
				this.result = result

				const old_question = store.battle.current_question
				const isimg_question = store.battle.current_question.isimg_question
				console.log( store.battle.current_question , 'question')
				// 设置结果所需旧题目
				this.result.forEach(item=>{
					item.question_type = old_question.question_type
					item.answers = old_question.answers
					// 是否纯图片问题
					item.isimg_question = isimg_question
				})
				// 写入题目
				store.battle.current_question = question
				this.checkIsNext();
			}

			if(res.type === 'finish'){
				socket.off('disconnect',disconnect)
				socket.off('connect',connect)
				console.log( 'finish' , res )
				const { result,current_result } = res
				store.battle.result = result

				this.result = current_result;
				const old_question = store.battle.current_question
				// 设置结果所需旧题目
				this.result.forEach(item=>{
					item.question_type = old_question.question_type
					item.answers = old_question.answers
				})
				this.checkIsNext();
			}

			if(res.type === 'error'){
				alert(res.errmsg)
			}
		})
	}	

	/* 游戏动画方法 */
	private showAnswerStateAmin(selected,index):Promise<any>{
		// test 
		const state = index === 0 ? 0 : 1 
		// 设置选中答案radio状态
		selected.option.radiobox.fillColor = ANSWER_RADIO_COLORS[state];
		selected.option.radio_checked.fillColor = ANSWER_RADIO_COLORS[state];
		// selected.radio_checked.alpha = 1
		// 设置选中答案背景色
		selected.bg.fillColor = ANSWER_SELECT_COLORS[state];
		// 设置选中答案icon
		selected.icon[state].visible = true;

		return new Promise(relsove=>{
			let tw1 = this.myTween(selected.option.radio_checked);
			tw1.to({ alpha:1 },100,egret.Ease.backInOut)
			let tw2 = this.myTween(selected.bg);
			tw2.to({ alpha:1 },100,egret.Ease.circIn)
			.call(relsove);
		})
	}
	/* 游戏逻辑方法 */

	// 设置AI自动作答
    // public AI(cb){
    //     const that = this;
    //     const randomAnswer = Math.floor( Math.random() * 4 );
    //     // 6 秒内作答 
    //     const randomSelectTime = Math.floor( Math.random() * 6  );
    //     const timer = setTimeout(async ()=>{
    //         cb.call(this, randomAnswer, 'rival');
    //         clearTimeout(timer);
    //     },randomSelectTime * 1000)
    // }

	// 预览图片
	private prviewImg(){
		const store = Store.getInstance()
		const { background  } = store.battle.current_question
		if( wx ){
			wx.previewImage({
				current:background,
				urls:[background]
			})
		}
	}
	// 重置按钮
	private resetBtn(){
		const store = Store.getInstance()
		const isimg_question = store.battle.current_question.isimg_question
		if( isimg_question ){
			this.img_question_answers.forEach((item,index)=>{
					item.option.btn.visible = false
					item.check.btn.visible = false
					item.border.fillColor = ANSWER_BORDER_COLOR;
			})
		}else{
			this.question_answers.forEach((item,index)=>{
				item.option.radiobox.fillColor = ANSWER_RADIO_COLORS[2];
				item.option.radio_checked.alpha = 0
				item.option.radio_checked.fillColor = ANSWER_RADIO_COLORS[2];
				item.option.radiobox && item.option.radiobox.alpha === 0 && (item.option.radiobox.alpha = 1);
			})
		}
		this.lineSelectOptions = []
		this.question_title.textFlow = this.formatLineQuestionTitle()
	}
	// 选择答案
	private async selectAnswer(index,from = 'player'){ 

		const store = Store.getInstance()
		const question_type = store.battle.current_question.question_type;

		// ‘player’ 玩家点击触发  ‘ai’ AI点击触发 ‘auto’ 时间到系统自动触发
		// 测试代码 设置AI操作 相当于之后线上的对手 后面会删除

		const selected = this.question_answers[index]
		
		// 单选题类型
		if( question_type === 'option' ){
			if( from == 'player' && this.player_selected ){
				return false;
			}
			if(from == 'player'){
				this.player_selected = true;
			}
			await this.tapAnswerAmin(selected)
			this.submit(answerOptions[index])
		}
		// 多选题类型
		else if( question_type === 'check' ){
			if( this.checkSelectOptions.indexOf(answerOptions[index]) !== -1 ){
				this.checkSelectOptions.splice( this.checkSelectOptions.indexOf(answerOptions[index]),1 ) 
				this.SetunCheckAnswerSelected(selected);
				await this.tapAnswerAmin(selected)
				return
			}
			this.checkSelectOptions.push( answerOptions[index] )
			await this.tapAnswerAmin(selected)
			this.setCheckAnswerSelected( index , 'player' )
		}
		// 连线题选项
		else if( question_type === 'line' ){
			if( this.lineSelectOptions.indexOf(answerOptions[index]) !== -1 ) return
			this.lineSelectOptions.push( answerOptions[index] )
			await this.tapAnswerAmin(selected)
			this.question_title.textFlow = this.formatLineQuestionTitle()
			this.setOptionAnswerSelected( index , 'player' )
		}	

	}
	// 选择图片答案
	private async selectImgAnswer(index,from = 'player'){
		
		const store = Store.getInstance()
		const question_type = store.battle.current_question.question_type;
		
		const selectAnswer = answerOptions[index]
		const selected = this.img_question_answers[index]

		// 单选题类型
		if( question_type === 'option' ){
			if( from == 'player' && this.player_selected ){
				return false;
			}
			if(from == 'player'){
				this.player_selected = true;
			}
			await this.tapAnswerAmin(selected)
			// 停止计时器
			GameTimeout.stopTimeOut()
			this.submit(answerOptions[index])
		}
		// 多选题类型
		if( question_type === 'check' ){
			if( this.checkSelectOptions.indexOf(selectAnswer) !== -1 ){
				this.checkSelectOptions.splice( this.checkSelectOptions.indexOf(selectAnswer),1 ) 
				this.SetunCheckImgAnswerSelected(selected);
				await this.tapAnswerAmin(selected)
				return
			}
			this.checkSelectOptions.push( selectAnswer )
			await this.tapAnswerAmin(selected)
			this.setCheckImgAnswerSelected( index , 'player')
		}
		// 连线题选项
		else if( question_type === 'line' ){
			if( this.lineSelectOptions.indexOf(selectAnswer) !== -1 ) return
			this.lineSelectOptions.push( selectAnswer )
			await this.tapAnswerAmin(selected)
			this.question_title.textFlow = this.formatLineQuestionTitle()
			this.setOptionImgAnswerSelected( index , 'player')
		}	
	}
	public submit(answer){
		
		if( this.submited ) return;
		this.submited = true;

		const socket = SocketIO.getInstance().socket
		const store = Store.getInstance()
		const question_type = store.battle.current_question.question_type;

		// 因为多选和连线submit函数不会传answer参数 函数中自己判断获取
		if(  question_type === 'check'  ){
			answer = this.checkSelectOptions
		}else if( question_type === 'line' ){
			answer = this.lineSelectOptions
		}
		
		console.log({
			"user_id":store.user._id,
			"type":"submit",
			"target":store.battle.roomid,
			"id":store.battle.current_question._id ,
			"answer":answer
		})

		socket.emit('battle',{
			"user_id":store.user._id,
			"type":"submit",
			"target":store.battle.roomid,
			"id": store.battle.current_question._id ,
			"answer": answer
		})

	}
	private setOptionAnswerSelected(index,from){

		const selected = this.question_answers[index];
		if( !selected ) return
		if( from === 'player' ){
			selected.option.radio_checked.visible = true
			selected.option.radio_checked.alpha = 1
		}
		
		if( from === 'rival' ){
			selected.icon[2].visible = true
			selected.icon[2].alpha = 1
		}
		
	}
	// 设置图片多选选中样式
	private setOptionImgAnswerSelected(index,from){
		const selected = this.img_question_answers[index];
		if( !selected ) return
		if( from === 'player' ){
			selected.border.fillColor = ANSWER_RADIO_COLORS[2]
		}
		
		if( from === 'rival' ){
			selected.icon[3].visible = true
			selected.icon[3].alpha = 1
		}
	}
	// 设置多选选中样式
	private setCheckAnswerSelected(index,from){
		const selected = this.question_answers[index];
		if( !selected ) return
		if( from === 'player' ){
			selected.check.checked.visible = true
			selected.check.unchecked.visible = false
		}

		if( from === 'rival' ){
			selected.icon[2].visible = true
			selected.icon[2].alpha = 1
		}
	}
	// 取消多选题选中
	private SetunCheckAnswerSelected(selected){
		selected.check.unchecked.visible = true
		selected.check.checked.visible = false
	}
	// 设置图片单选选中样式
	private setCheckImgAnswerSelected(index,from){
		const selected = this.img_question_answers[index];
		if( !selected ) return
		if( from === 'player' ){
			selected.border.fillColor = ANSWER_RADIO_COLORS[2]
			selected.check.checked.visible = true
			selected.check.unchecked.visible = false
		}

		if( from === 'rival' ){
			selected.icon[3].visible = true
			selected.icon[3].alpha = 1
		}
	}
	// 取消图片多选题选中
	private SetunCheckImgAnswerSelected(selected){
		selected.border.fillColor = ANSWER_BORDER_COLOR
		selected.check.unchecked.visible = true
		selected.check.checked.visible = false
	}
	// 检查是否下个题目
	private async checkIsNext(){

		// 电脑与玩家在此题都选择过答案了 

		// 检查答案
		await this.checkAnswer();
		// 之后判断答题结束 或者 进入下一题
		if( this.current_quetion_index === this.questions_num - 1){
			this.finishGame();
			return;
		}
		this.showNextQuestion();
	
	}
	// 检查答案
	private async checkAnswer(){	

		const store = Store.getInstance()
		const sounds = SoundManager.getInstance()

		console.log( this.result , 'result' )

		this.result.forEach((item,index)=>{
			const user_id = typeof item.user === "string" ? item.user : item.user._id
			// 检查单选题答案
			if( item.question_type === 'option' ){
				// 时间到时用户会选择空字符串
				if( item.answer !== "" ){
					this.setAnswerState(item.is_correct,
						item.answer,
						user_id === Store.getInstance().user._id  ? 'player' : 'rival',
						item.isimg_question ? 'img' : 'text')
				}
			// 检查多选题答案
			}else if( item.question_type === 'check' ){
				this.setCheckAnswerState(
					item.is_correct,
					item.answers,
					item.answer,
					user_id === Store.getInstance().user._id  ? 'player' : 'rival',
					item.isimg_question ? 'img' : 'text')
			// 检查连线题答案
			}else if( item.question_type === 'line' ){
				this.setLineAnswerState(
					item.is_correct,
					item.answers,
					item.answer,
					user_id === Store.getInstance().user._id  ? 'player' : 'rival',
					item.isimg_question ? 'img' : 'text')
			}
			// 播放音频
			if( user_id === Store.getInstance().user._id ){
				if( item.is_correct ){
					sounds.playSuccessSound()
				}else{
					sounds.playErrorSound()
				}
			}
		})
		// 执行得分进度
		this.checkScoreProcess();
		// 检查完毕 清空
		this.result = [];
		return this.wait(1500);
	}
	// 设置单选题
	public async setAnswerState(is_correct,index,from,type){

		const state = is_correct ? 0 : 1;

		if( from === 'player' ){
			if(state === 1){ this.errorAmin() }
			else ++this.player_right_count
		}
		if( from === 'rival' ){
			if(state === 0) ++this.rival_right_count
		}

		if( type === 'text' ){
			const selected = this.question_answers[ answerOptions.indexOf(index) ];
			selected.bg.fillColor = ANSWER_SELECT_COLORS[state];
			selected.bg.visible = true;
			selected.icon[state].visible = true;
			selected.option.btn.visible = false;
			return new Promise(relsove=>{
				let tw1 = this.myTween(selected.icon[state]);
				tw1.to({ alpha:1 },100,egret.Ease.backInOut)
				let tw2 = this.myTween(selected.bg);
				tw2.to({ alpha:1 },100,egret.Ease.circIn)
				.call(relsove);
			})
		}else{
			const selected = this.img_question_answers[ answerOptions.indexOf(index) ];
			selected.border.fillColor = ANSWER_RADIO_COLORS[state];
			selected.icon[2].visible = false;
			selected.icon[state].visible = true;
		}
	}
	// 设置多选题
	public async setCheckAnswerState(is_correct,right,answers,from,type){
		// console.log( is_correct,'is_correct',
		// right,'right',
		// answers,'answers',
		// from ,'from', 'setLineAnswerState' );
		
		( Array.isArray(answers) ? answers :answers.split('') ).forEach(option=>{
			const state = right.indexOf(option) !== -1 ? 0 : 1 

			console.log( 'setCheckAnswerState', type )
			if( type === 'text' ){
				console.log( 'setCheckAnswerState', 'here111' )
				const selected = this.question_answers[ answerOptions.indexOf(option) ];
				selected.bg.fillColor = ANSWER_SELECT_COLORS[state];
				selected.bg.visible = true;
				if( from === 'player' ){
					selected.icon[state].visible = true;
					selected.check.btn.visible = false;
				}
				let tw1 = this.myTween(selected.icon[state]);
				tw1.to({ alpha:1 },100,egret.Ease.backInOut)
				let tw2 = this.myTween(selected.bg);
				tw2.to({ alpha:1 },100,egret.Ease.circIn)
			}else{
				console.log( 'setCheckAnswerState', 'here222' )
				const selected = this.img_question_answers[ answerOptions.indexOf(option) ];
				selected.border.fillColor = ANSWER_RADIO_COLORS[state];
				selected.check.btn.visible = false;
				selected.icon[state].visible = true;
			}

		})

		if( from === 'player' ){
			if(!is_correct){ this.errorAmin() }
			else ++this.player_right_count
		}
		if( from === 'rival' ){
			if(is_correct) ++this.rival_right_count
		}
	}
	// 设置连线题
	public async setLineAnswerState(is_correct,right,answers,from,type){
		// console.log( is_correct,'is_correct',
		// right,'right',
		// answers,'answers',
		// from ,'from', 'setLineAnswerState' );

		( Array.isArray(answers) ? answers :answers.split('') ).forEach( (option,index)=>{
			const state = right[index] === option ? 0 : 1 

			console.log( 'setLineAnswerState', type )
			if( type === 'text' ){
				console.log( 'setCheckAnswerState', 'here111' )
				const selected = this.question_answers[ answerOptions.indexOf(option) ];
				selected.bg.fillColor = ANSWER_SELECT_COLORS[state];
				selected.bg.visible = true;
				if( from === 'player' ){
					selected.icon[state].visible = true;
					selected.option.btn.visible = false;
				}
				let tw1 = this.myTween(selected.icon[state]);
				tw1.to({ alpha:1 },100,egret.Ease.backInOut)
				let tw2 = this.myTween(selected.bg);
				tw2.to({ alpha:1 },100,egret.Ease.circIn)
			}else{
				console.log( 'setCheckAnswerState', 'here222' )
				const selected = this.img_question_answers[ answerOptions.indexOf(option) ];
				selected.border.fillColor = ANSWER_RADIO_COLORS[state];
				selected.icon[2].visible = false;
				selected.icon[state].visible = true;
			}

		})

		if( from === 'player' ){
			if(!is_correct){ this.errorAmin() }
			else ++this.player_right_count
		}
		if( from === 'rival' ){
			if(is_correct) ++this.rival_right_count
		}
	}
	private checkScoreProcess(){
		this.score_process.forEach((p,index)=>{
			const tw = this.myTween(p);
			tw.to({ width: (190 / this.questions_num) * this[`${index === 0? 'player' : 'rival'}_right_count`]}
			,500,egret.Ease.elasticIn)
		})
	}
	// 展示下一题
	private async showNextQuestion(){
		if(this.current_quetion_index === this.questions_num - 1){
			this.finishGame()
			return;
		}
		// 注意： reset 会把 current_quetion_index 加1
		await this.myPromise(this.reset(this.current_quetion_index + 1));
		// 写入题目
		this.writeQuestion()
		await this.myPromise(this.showTranstions(
			this.current_quetion_index === this.questions_num - 1?
			`最后一题`
			:`第${ this.current_quetion_index + 1 }题`))
		await this.myPromise(this.showQuestion(  ))
		// // 重新开始计时
		PKGameTimeout.startTimeOut(this.timeout,this.onTiemout.bind(this),this.timeoutHandle.bind(this));
		//测试代码 设置AI操作 相当于之后线上的对手 后面会删除
		// this.AI.call( this, this.selectAnswer )
	}
	private async finishGame(){	
		this.leaveGame()
		// 停止计时器
		PKGameTimeout.stopTimeOut();
		await this.myPromise(this.hideQuestion())
		//await this.myPromise(this.showTranstions('答题结束'))
		const scene = PkResultScene.getInstance()
		SceneManager.getInstance().changeScene( scene )
		scene.setScore()
 	}
	// 时间到事件
	private timeoutHandle(){
		// 双方已经作答 出现这种请求可能是websocket没有触发next_question
		if( this.result.length === 2 ){ return } 
		const sounds = SoundManager.getInstance()
		// this.player_selected可以判断玩家是否点击过答案按钮
		// 玩家没有作答过 则时间到自动作答
		if( !this.player_selected ){
			console.log( 'timeoutHandle'  )
			sounds.playErrorSound()
			this.submit('')
		}
	}
	private wait(time){
		return new Promise(resolve=>{
			const timer = setTimeout(()=>{
				clearTimeout(timer)
				resolve()
			},time)
		})
	}
	// 离开游戏
	leaveGame(){
		const store = Store.getInstance()
		const socket = SocketIO.getInstance().socket
		
		// 离开房间
		socket.emit('battle',{
			"type":"leave",
			"target":store.battle.roomid,
			"user_id":store.user._id
		})

		// 取消此页面的监听
		socket.off('battle')
	}
}