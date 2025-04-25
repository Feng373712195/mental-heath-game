const GameTimeout = new Timeout()

const CAN_USE_MAX_USE_KEY = 2;


class GameScene extends CommonGameScene {
	// 只读题目
	private readonly:boolean = false;
	// 只读按钮盒子
	private readonly_btn:eui.Group
	// 查看解析和答案
	private analysis_btn:eui.Group

	// 游戏类型
	private game_type = ''
	// 设置游戏监听socket事件名称
	private socket_event_name = ''

	// 当前问题索引
	private question_index:eui.Label

	// 使用钥匙按钮
	private usekey_btn:eui.Group
	// 题干背景
	private question_bg:eui.Image
	// 当前游戏答案索引
	private current_quetion_index = 0;
	// 记录玩家是否选择了题目
	private player_selected = false

	// 可使用钥匙数量
	private can_use_keys = 0
	private use_key_text:eui.Label;
	private use_key_bg:eui.Rect;

	// 多选题选择选项
	private checkSelectOptions = []
	// 连线题选择选项
	private lineSelectOptions = []

	// 已经提交过
	private submited = false

	// 题目标题
	public question_title:eui.Label

	public constructor() {
		super();
	}

	private static shared:GameScene;
	public static getInstance(){
		if( !GameScene.shared){
			GameScene.shared = new GameScene();
		}
		return GameScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
		RES.getResAsync("game")
	}

	protected childrenCreated():void
	{
		super.childrenCreated();

		var search = document.getElementById('search')
		this.setBackBtn(()=>{
			if( this.readonly ){
				search.style.zIndex = '999';
				this.readonly_btn.visible = false
				this.bottom_btns.visible = true
			}
			this.reset.bind(this)(0)
			this.isleave = true;
		})
		this.init();
	}
	/* 初始化方法 */

	public init(){
		super.init();
		this.submit_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.submit,this)
		this.reset_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.resetBtn,this)
		this.analysis_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.readonlyMessage,this)
		this.question_bg.addEventListener(egret.TouchEvent.TOUCH_TAP,this.prviewImg,this)
		this.initAnswerBtn(this.selectAnswer.bind(this),this.selectImgAnswer.bind(this))
		this.resetGameScene();
		this.usekey_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.useKey,this)

		// RES.getResAsync('bg02_png').then(res=>this.bg_img.source = res)
		// this.setPkInfo();
		// this.startCreateScene();
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
		// 第一道题目不用hideQuestion
		await this.hideQuestion()
		// scroller滚动到初始位置
		this.resetScrollerPoint()
		// 清空用户选择的多选题选项
		this.checkSelectOptions = []
		// 清空用户选择连线题选项
		this.lineSelectOptions = []

		// 重制计时器
		if( this.questions[this.current_quetion_index] && this.questions[this.current_quetion_index].solve_time ){
			GameTimeout.setSeconds(this.questions[this.current_quetion_index].solve_time)
		}
		GameTimeout.restTimeout(this.timeout);
		this.resetTimeProgress()
		// 只读按钮隐藏
		this.readonly_btn.visible = false
		// 恢复状态 玩家可以再次选择答案
		this.player_selected = false;
		this.submited = false;
		this.resetGameScene();
		// 重制按钮选中状态
		this.resetAnswerBtn();
		this.question_index.text = `${quetionIndex + 1}/${this.questions_num}`
	}
	// 写入当前展示题目
	private writeQuestion(readonly = false){
		const { title,options,question_type,background ,credit } = this.questions[this.current_quetion_index]

		console.log( this.questions[this.current_quetion_index], 'question' )

		const types = {
			option:"单选题",
			check:"多选题",
			line:"连线题"
		};
		this.credit.text = `+${credit || 0}`
		this.question_title.text = title
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
		if( isImgQuestion ){
			this.questions[this.current_quetion_index].isimg_question = true
			this.img_question.visible = true
			this.text_question.visible = false
		}else{
			this.img_question.visible = false
			this.text_question.visible = true
		}

		// 题目类型模块的控制显示隐藏
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

		if(readonly) return

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
		const { title } = this.questions[this.current_quetion_index]
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
	// 设置可用钥匙
	public async setUseKey(){
		const user_info = Store.getInstance().user;

		if( user_info.key_count !== 0 ){
			this.use_key_bg.fillColor = 0x23BFD5
			this.can_use_keys = user_info.key_count >= CAN_USE_MAX_USE_KEY ? CAN_USE_MAX_USE_KEY : user_info.key_count
		}else{
			this.can_use_keys = 0
			this.use_key_bg.fillColor = 0xDCDCDC
		}
		this.use_key_text.text = `${this.can_use_keys}/${CAN_USE_MAX_USE_KEY} 使用钥匙`
	}
	// 展示题目
	public async readyQuestion(question){
		this.readonly = true;
		// 进入游戏
		this.isleave = false
		this.disabled_answer_btn = true
		this.questions = [question]
		this.writeQuestion(true);
		[this.question_type,
		 this.question_box,
		 this.question_rule,
		 this.question_answer
		].forEach(v=>v.alpha = 1)
		// 只读按钮隐藏
		this.readonly_btn.visible = true
		this.bottom_btns.visible = false
	}
	public readonlyMessage(){
		const question = this.questions[this.current_quetion_index];
		ResultMessageBox.getInstance().showMessage();
		ResultMessageBox.getInstance().setSate(
			0,
			question.answer,
			question.analysis,
			0,
			0,
			true);
	}
	public async startGame(type):Promise<any>{
		// 设置游戏类型
		this.game_type = type
		// 设置游戏监听socket事件名称
		this.socket_event_name = {
			medinfo:'medinfo',
			ranking:'contest',
		}[type]
		// 进入游戏
		this.isleave = false
		// 设置钥匙
		this.setUseKey()
		// 设置问题
		this.setQuestions(Store.getInstance()[this.game_type].questions)
		// 重置
		await this.myPromise(this.reset(0))
		// 把题目写入UI
		this.writeQuestion()
		await this.myPromise(this.showTranstions('开始'));
		await this.myPromise(this.showQuestion());
		GameTimeout.startTimeOut(this.timeout,this.onTiemout.bind(this),this.timeoutHandle.bind(this))
	}

	/* 游戏动画方法 */
	private showAnswerStateAmin(selected,index,right):Promise<any>{
		const { question_type } = this.questions[this.current_quetion_index]

		const state = index === right ? 0 : 1

		if(question_type === 'option'){
			// 设置选中答案radio状态showQuestion
			selected.option.radiobox.fillColor = ANSWER_RADIO_COLORS[state];
			selected.option.radio_checked.fillColor = ANSWER_RADIO_COLORS[state];
		}
		// selected.radio_checked.alpha = 1
		// 设置选中答案背景色
		selected.bg.fillColor = ANSWER_SELECT_COLORS[state];
		// 设置选中答案icon
		selected.icon[state].visible = true;

		return new Promise(relsove=>{
			if(question_type === 'option'){
				let tw1 = this.myTween(selected.option.radio_checked);
				tw1.to({ alpha:1 },100,egret.Ease.backInOut)
			}
			let tw2 = this.myTween(selected.bg);
			tw2.to({ alpha:1 },100,egret.Ease.circIn)
			.call(relsove);
		})
	}
	private showImgAnswerStateAmin(selected,index,right){
		console.log( selected , 'selected' )
		// test
		const state = index === right ? 0 : 1
		// 设置选中答案radio状态showQuestion
		selected.border.fillColor = ANSWER_RADIO_COLORS[state];
		selected.icon[2].visible = false;
		selected.icon[state].visible = true;
	}
	/* 游戏逻辑方法 */

	// 预览图片
	private prviewImg(){
		const { background  } = this.questions[this.current_quetion_index]
		if( wx ){
			wx.previewImage({
				current:background,
				urls:[background]
			})
		}
	}
	// 重置按钮
	private resetBtn(){
		const { questions } = Store.getInstance()[this.game_type]
		const { isimg_question }  = questions[this.current_quetion_index]
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
	// 使用钥匙
	private async useKey(){

		if( this.can_use_keys === 0 ) return

		// 停止计时器
		GameTimeout.stopTimeOut()

		// 获取正确答案
		const loading = Loading.getInstance()
		loading.show();
		const res = await Http.PostRequest<{
			errcode:number
			errmsg:string,
			question: {
				answer: string,
				analysis: string
			},
			contest:{
				questions:any[],
				round:string
			}
		}>('/use/key',{
			id:this.questions[this.current_quetion_index]._id
		})
		loading.hide()

		if( res.errcode === 0 ){
			// 可使用钥匙数量减1
			--this.can_use_keys
			this.use_key_text.text = `${this.can_use_keys}/${CAN_USE_MAX_USE_KEY} 使用钥匙`
			// 无钥匙可用按钮显示禁用状态
			if( this.can_use_keys === 0 ){
				this.use_key_bg.fillColor = 0xDCDCDC
			}
			// 展示正确答案
			UseKeyMessageBox.getInstance().showMessage();
			UseKeyMessageBox.getInstance().setSate(0, res.question.answer, res.question.analysis);
			UseKeyMessageBox.getInstance().once('onClose',async ()=>{
				this.showNextQuestion()
			})
		}else{
			alert(res.errmsg)
			// 使用失败 重新开始计时
			GameTimeout.startTimeOut(this.timeout,this.onTiemout.bind(this),this.timeoutHandle.bind(this));
		}
	}
	// 选择答案
	private async selectAnswer(index){

		const { questions } = Store.getInstance()[this.game_type]
		const { question_type }  = questions[this.current_quetion_index]
		const selectAnswer = answerOptions[index]
		const selected = this.question_answers[index]

		// 单选题类型
		if( question_type === 'option' ){
			if( this.player_selected ) return;
			this.player_selected = true;
			await this.tapAnswerAmin(selected)
			// 停止计时器
			GameTimeout.stopTimeOut()
			this.submit(selected,selectAnswer)
		}

		// 多选题类型
		if( question_type === 'check' ){
			if( this.checkSelectOptions.indexOf(selectAnswer) !== -1 ){
				this.checkSelectOptions.splice( this.checkSelectOptions.indexOf(selectAnswer),1 )
				this.SetunCheckAnswerSelected(selected);
				await this.tapAnswerAmin(selected)
				return
			}
			this.checkSelectOptions.push( selectAnswer )
			await this.tapAnswerAmin(selected)
			this.setCheckAnswerSelected(selected)
		}
		// 连线题选项
		else if( question_type === 'line' ){
			if( this.lineSelectOptions.indexOf(selectAnswer) !== -1 ) return
			this.lineSelectOptions.push( selectAnswer )
			await this.tapAnswerAmin(selected)
			this.question_title.textFlow = this.formatLineQuestionTitle()
			this.setOptionAnswerSelected(selected)
		}
	}
	// 选择图片答案
	private async selectImgAnswer(index){
		const { questions } = Store.getInstance()[this.game_type]
		const { question_type }  = questions[this.current_quetion_index]
		const selectAnswer = answerOptions[index]
		const selected = this.img_question_answers[index]

		// 单选题类型
		if( question_type === 'option' ){
			if( this.player_selected ) return;
			this.player_selected = true;
			await this.tapAnswerAmin(selected)
			// 停止计时器
			GameTimeout.stopTimeOut()
			this.submit(selected,selectAnswer)
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
			this.setCheckImgAnswerSelected(selected)
		}
		// 连线题选项
		else if( question_type === 'line' ){
			if( this.lineSelectOptions.indexOf(selectAnswer) !== -1 ) return
			this.lineSelectOptions.push( selectAnswer )
			await this.tapAnswerAmin(selected)
			this.question_title.textFlow = this.formatLineQuestionTitle()
			this.setOptionImgAnswerSelected(selected)
		}
	}
	// 设置单选选中样式
	private setOptionAnswerSelected(selected){
		selected.option.radio_checked.visible = true
		selected.option.radio_checked.alpha = 1
	}
	// 设置图片多选选中样式
	private setOptionImgAnswerSelected(selected){
		selected.border.fillColor = ANSWER_RADIO_COLORS[2]
	}
	// 设置多选选中样式
	private setCheckAnswerSelected(selected){
		selected.check.checked.visible = true
		selected.check.unchecked.visible = false
	}
	// 取消多选题选中
	private SetunCheckAnswerSelected(selected){
		selected.check.unchecked.visible = true
		selected.check.checked.visible = false
	}
	// 设置图片单选选中样式
	private setCheckImgAnswerSelected(selected){
		selected.border.fillColor = ANSWER_RADIO_COLORS[2]
		selected.check.checked.visible = 1
		selected.check.unchecked.visible = 0
	}
	// 取消图片多选题选中
	private SetunCheckImgAnswerSelected(selected){
		selected.border.fillColor = ANSWER_BORDER_COLOR
		selected.check.unchecked.visible = true
		selected.check.checked.visible = false
	}
	// 提交按钮
	private async submit(selected,selectAnswer){


		if( this.submited ) return;
		this.submited = true;

		const { questions } = Store.getInstance()[this.game_type]
		const { question_type }  = questions[this.current_quetion_index]

		// 停止计时器
		GameTimeout.stopTimeOut()

		// 因为多选和连线submit函数不会传answer参数 函数中自己判断获取
		if(  question_type === 'check'  ){
			selectAnswer = this.checkSelectOptions
		}else if( question_type === 'line' ){
			selectAnswer = this.lineSelectOptions
		}

		const right = await this.checkAnswer(selected,selectAnswer)
		const sounds = SoundManager.getInstance()
		ResultMessageBox.getInstance().showMessage();

		// 答题结果状态
		let state = 0
		if( question_type === 'option' ){
			state = selectAnswer === right ? 1 : 0;
		}else if(  question_type === 'check'  ){
			// console.log('check' ,selectAnswer ,'selectAnswer',  right , 'right')
			state = ( (right.length === selectAnswer.length) && (right as any).filter(i=> selectAnswer.indexOf(i) === -1).length === 0 )
			? 1 : 0
		}else if( question_type === 'line'  ){
			// console.log('line' ,selectAnswer.toString() ,'selectAnswer',  right , 'right')
			state = (Array.isArray(right) ? right.join() : right) === selectAnswer.join() ? 1 : 0
		}

		if( state === 1 ){
			sounds.playSuccessSound()
		}else{
			sounds.playErrorSound()
		}

		ResultMessageBox.getInstance().setSate(
			state,
			right,
			questions[this.current_quetion_index].analysis,
			Store.getInstance()[this.game_type].scores[this.current_quetion_index].credit,
			this.current_quetion_index === questions.length - 1
		);
		ResultMessageBox.getInstance().once('onClose',async ()=>{
			this.showNextQuestion()
		})
	}
	// 检查答案
	private async checkAnswer(selected,selectAnswer){

		const { round,record,id,questions } = Store.getInstance()[this.game_type]
		const { question_type,isimg_question }  = questions[this.current_quetion_index]

		SocketIO.getInstance().socket.emit(this.socket_event_name,{
			"user_id":Store.getInstance().user._id,
			"record": record, // 记录ID（从开始比赛接口获取）
			"round": round, // 场次（从开始比赛接口获取）
			"answer": selectAnswer , // 答案
			"id":  questions[this.current_quetion_index]._id, // 当前答题试题ID
			"type": "submit" // 消息类型：submit: 提交答案 finish: 结束答题
		})

		console.log( this.socket_event_name ,  {
			"user_id":Store.getInstance().user._id,
			"record": record, // 记录ID（从开始比赛接口获取）
			"round": round, // 场次（从开始比赛接口获取）
			"answer": selectAnswer , // 答案
			"id":  questions[this.current_quetion_index]._id, // 当前答题试题ID
			"type": "submit" // 消息类型：submit: 提交答案 finish: 结束答题
		})

		return new Promise<string | Array<string>>((resolve,reject)=>{
			SocketIO.getInstance().socket.once(this.socket_event_name, async (res)=>{
				if( res.errcode === 0 ){
					const { is_correct,answer,credit,gold, } = res
					// 记录因病系统得分
					if( res.type === "finish" && this.game_type === 'medinfo'){
						const store = Store.getInstance()
						store.medinfo.final_credit  = res.final_credit 
						store.medinfo.final_gold  = res.final_gold
						store.medinfo.correct_count = res.correct_count
						store.medinfo.wrong_count = res.wrong_count
					}
					Store.getInstance()[this.game_type].scores.push({ credit,gold: gold ? gold : 0 })
					if( !is_correct ) await this.errorAmin()

					if( question_type === 'option' ){
						if( isimg_question ){
							this.showImgAnswerStateAmin(selected,selectAnswer,answer)
						}else{
							await this.showAnswerStateAmin(selected,selectAnswer,answer)
						}
					}
					if( question_type === 'check' ){
						const arr = []
						for( let o of this.checkSelectOptions ){
							arr.push(this[isimg_question ? 'showImgAnswerStateAmin' : 'showAnswerStateAmin'](
								this[ isimg_question ?  'img_question_answers' : 'question_answers' ][ answerOptions.indexOf(o) ],
								o,
								answer.find(i=>o===i) )
							)
						}
						await Promise.all(arr)
					}
					if( question_type === 'line' ){
						const checkAnswer = Array.isArray(answer) ? answer : answer.split('')
						const arr = []
						for( let index in this.lineSelectOptions ){
							arr.push(this[isimg_question ? 'showImgAnswerStateAmin' : 'showAnswerStateAmin'](
								this[ isimg_question ?  'img_question_answers' : 'question_answers' ][index],
								this.lineSelectOptions[index],
								checkAnswer[index])
							)
						}
						await Promise.all(arr)
					}
					resolve(answer)
				}else{
					alert(res.errmsg)
				}
			})
		})
	}
	// 检查是否下个题目
	private async checkIsNext(){
		// 电脑与玩家在此题都选择过答案了
		// if( this.selectedNum === 2 ){
		// 	// 检查答案
		// 	this.checkAnswer();
		// 	this.selectedNum = 0;
		// 	// 之后判断答题结束 或者 进入下一题
		// 	if( GameManger.currentQuestionIndex == 5 ){
		// 		this.finishGame();
		// 		return;
		// 	}
		// 	this.showNextQuestion();
		// }
	}
	// 展示下一题
	private async showNextQuestion(){
		if(this.current_quetion_index === this.questions_num - 1){
			this.finishGame()
			return;
		}

		// 注意： reset 会把 current_quetion_index 加1
		await this.myPromise(this.reset(this.current_quetion_index + 1));
		// 把题目写入UI
		this.writeQuestion()
		await this.myPromise(this.showTranstions(
			this.current_quetion_index === this.questions_num - 1 ?
			`最后一题`
			:`第${ this.current_quetion_index + 1 }题`))
		await this.myPromise(this.showQuestion())
		// 重新开始计时
		GameTimeout.startTimeOut(this.timeout,this.onTiemout.bind(this),this.timeoutHandle.bind(this));
	}
	// 完成游戏
	private async finishGame(){
		// 停止计时器
		GameTimeout.stopTimeOut();
		await this.myPromise(this.hideQuestion())
		//await this.myPromise(this.showTranstions('答题结束'))
		const scene = RankingResultScene.getInstance()
		SceneManager.getInstance().changeScene(scene)
		scene.setScore(this.game_type);
 	}
	// 时间到事件
	private timeoutHandle(){
		const sounds = SoundManager.getInstance()
		const { round,record,id,questions } = Store.getInstance()[this.game_type]
		SocketIO.getInstance().socket.emit(this.socket_event_name,{
			"user_id":Store.getInstance().user._id,
			"record": record, // 记录ID（从开始比赛接口获取）
			"round": round, // 场次（从开始比赛接口获取）
			"answer": '' , // 答案
			"id":  questions[this.current_quetion_index]._id, // 当前答题试题ID
			"type": "submit" // 消息类型：submit: 提交答案 finish: 结束答题
		})

		return new Promise<string>((resolve,reject)=>{
			SocketIO.getInstance().socket.once(this.socket_event_name, async (res)=>{
				if( res.errcode === 0 ){
					const { answer,credit,gold } = res
					// 记录因病系统得分
					if( res.type === "finish" && this.game_type === 'medinfo'){
						const store = Store.getInstance()
						store.medinfo.bonus_credit = res.bonus_credit
						store.medinfo.bonus_gold = res.bonus_gold
						store.medinfo.correct_count = res.correct_count
						store.medinfo.wrong_count = res.wrong_count
					}
					sounds.playErrorSound()
					ResultMessageBox.getInstance().showMessage();
					Store.getInstance()[this.game_type].scores.push({ credit,gold: gold ? gold : 0 })
					// answerOptions.indexOf(answer)
					ResultMessageBox.getInstance().setSate(
						0,
						answer, questions[this.current_quetion_index].analysis,
						0,
						this.current_quetion_index === questions.length - 1);
						ResultMessageBox.getInstance().once('onClose',async ()=>{this.showNextQuestion()})
				}else{
					alert(res.errmsg)
				}
			})
		})
	}

}
