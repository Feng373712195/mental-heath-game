class RankingResultScene extends CommonScene{
	
	private bg:eui.Rect;
	private back_btn:eui.Group;
	private play_btn:eui.Group;
	private play_btn_text:eui.Label
	private ranking_top:eui.Image
	
	private score1:eui.Label
	private score2:eui.Label
	private score3:eui.Label
	private score4:eui.Label
	private score5:eui.Label
	private score6:eui.Label

	private credit:eui.Label
	private s_credit:eui.Label;
	private money:eui.Label
	private s_money:eui.Label

	private score_box:eui.Group
	private message_box:eui.Group

	// 是否通过
	private pass:boolean = false

	// 游戏类型
	private game_type = ''

	public constructor() {
		super();
	}

	private static shared:RankingResultScene;
	public static getInstance(){
		if( !RankingResultScene.shared){
			RankingResultScene.shared = new RankingResultScene();
		}
		return RankingResultScene.shared;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}
	
	public reset(){
		this.ranking_top.visible = false;
		[1,1,1,1,1,1].forEach((v,i)=>{
			this['score' + (i+1)].text = '0'
		});
		this.credit.text = '0'
		this.money.text = '0'
		this.s_credit.text = ''
		this.s_money.text = ''
	}

	protected childrenCreated():void
	{
		super.childrenCreated();
		this.setBackground()
		this.back_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,()=>{
			SceneManager.getInstance().changeScene( StartScene.getInstance() )
			this.reset();
		},this)
		this.play_btn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.again,this)
	}

	public setScore(type){

		// 游戏类型
		this.game_type = type
		const { round,record,scores } = Store.getInstance()[type];

		if(this.game_type === 'ranking'){

			this.score_box.visible = true
			this.message_box.height = 812

			Loading.getInstance().show()

			SocketIO.getInstance().socket.emit('contest',{
				"user_id":Store.getInstance().user._id,
				"record": record, // 记录ID（从开始比赛接口获取）
				"round": round, // 场次（从开始比赛接口获取）
				"type": "finish"
			})
			SocketIO.getInstance().socket.once('contest',(res)=>{

				console.log( res, 'finish' );
				
				if(res.errcode === 0){
					const { credit, money , contest_result, next_level, bonus_credit, bonus_gold } = res;
					// 判断是否通过
					this.pass = contest_result === 'success' ? true : false;
					RES.getResAsync( this.pass ? 'ranking_s_png' : 'ranking_l_png' )
					.then(source=>{ this.ranking_top.source = source })
					this.ranking_top.visible = true;
					this.play_btn_text.text = this.pass ? '挑战下一关' : '继续挑战';
					// 设置系统奖励
					console.log( bonus_credit , 'bonus_credit' , bonus_gold ,'bonus_gold' )
					this.s_credit.text = '系统奖励 +' + bonus_credit;
					this.s_money.text = '系统奖励 +' + bonus_gold;
					if( this.pass ){
						Store.getInstance().ranking.next_id = next_level
					}
					// 设置奖励
					[1,1,1,1,1,1].forEach((v,i)=>{
						if(scores[i]){
							this['score' + (i+1)].text = scores[i] ? `+${scores[i].credit}` : 0
						}
					})
					this.credit.text = `+${ Utils.formatNum(credit) }`
					this.money.text = `+${  Utils.formatNum(money) }`
				}else{
					alert(res.errmsg)
				}
			})
			Loading.getInstance().hide()
		}
		
		if( this.game_type === 'medinfo' ){

			this.score_box.visible = false
			this.message_box.height = 450

			RES.getResAsync('ranking_n_png' ).then(res=>{
				this.ranking_top.source = res
			});
			this.ranking_top.visible = true;

			this.play_btn_text.text = '再次挑战'

			let credit = 0;
			let money = 0;
			const store = Store.getInstance()
			console.log( store.medinfo , 'store.medinfo' )
			this.s_credit.text = '答对题数:' + store.medinfo.correct_count;
			this.s_money.text = '答错题数:' + store.medinfo.wrong_count;
			this.credit.text = `+${store.medinfo.final_credit}`
			this.money.text = `+${store.medinfo.final_gold}`
		}
	}

	public async again(){
		const store = Store.getInstance()

		if( this.game_type === 'ranking' && this.pass && !store.ranking.next_id ){
			Utils.showToast('已经是最后一关了',500)
			return
		}
		Loading.getInstance().show()

		

		const id = this.game_type === 'ranking' ? 
			( this.pass ? store.ranking.next_id : store.ranking.id) : 
			store.medinfo.id;

		console.log(id , store.ranking.next_id )
		const res = await Http.PostRequest<{
			errcode:number
			errmsg:string,
			contest:{
				questions:any[],
				round:string,
				record:string,
				_id:string,
				gold: number
			}
		}>( {
			 ranking:'/level/contest',
			 medinfo:'/medinfo/practice'
		}[this.game_type],{
			[{ ranking:'level',
			   medinfo:'medinfo'
			}[this.game_type]]:id
		})

		if( res.errcode === 0 ){
			console.log( res.contest , 'contest' )
			const { record,round,questions,_id, gold } = res.contest;

			if( this.game_type ===  'ranking' ){
				store['ranking'].record = record 
				store['ranking'].round = round 
				Utils.showToast('消耗' + gold + '金币',500)
			}

			if( this.game_type ===  'medinfo' ){
				store['medinfo'].record = _id
			}

			store[this.game_type].scores = []
			store[this.game_type].questions = questions

			Loading.getInstance().hide()
			SceneManager.getInstance().changeScene( GameScene.getInstance() );
			this.reset();
			GameScene.getInstance().startGame(this.game_type);
		}else{
			alert(res.errmsg)
		}
	}
	
	private setBackground(){
		const width = this.stage.stageWidth;
		const height = this.stage.stageHeight;
		const gradient = new egret.Shape();
        var matrix = new egret.Matrix();
        matrix.createGradientBox(width, height, Math.PI * 0.5, 0, 0);
        gradient.graphics.beginGradientFill(egret.GradientType.LINEAR, [0x16D1D3,0x72F6C6], [1, 1], [0, 255], matrix);
        gradient.graphics.drawRect(0, 0, width, height);
        gradient.graphics.endFill();
        this.bg.addChild(gradient)
	}
}