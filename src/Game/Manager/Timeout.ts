class Timeout {
	public seconds:number = 0;
	// 游戏中的计时器ID
	public timer = null;
	public time = 0;
	public progress:{ [x: string]: number }[] = [];
	public setSeconds(seconds){
		this.seconds = seconds
		this.progress = { 
			[`${seconds / 4 * 3}`]:3,
			[`${seconds / 4 * 2}`]:2,
			[`${seconds / 4 * 1}`]:1,
			[`${seconds / 4 * 0}`]:0,
		} as any
	}
	// 重置
	public  restTimeout(view){
		clearTimeout(this.timer);
		this.time = this.seconds;
		view.text = this.time + 'S';
	}
	// 倒计时
	public startTimeOut(view,callback,emit){
		this.timer = setTimeout(()=>{
			if( this.time !== 0){
				view.text = (--this.time) + 'S';
				callback(this.progress,this.time)
				if( this.time === 0 ){
						emit && emit();
						return;
				}
				this.startTimeOut(view,callback,emit)
			}
		},1000)
	}
	// 停止计时
	public stopTimeOut(){
		clearTimeout(this.timer);
	}
}