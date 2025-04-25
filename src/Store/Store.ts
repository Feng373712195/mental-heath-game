class Store{
    
    private static shared:Store;
	public static getInstance(){
		if( !Store.shared){
			Store.shared = new Store();
		}
		return Store.shared;
	}

    public ranking = {} as any

	public medinfo = {} as any

	public battle = {
		roomid:'',
		current_question:null,
		totle:0,
		result:null,
		share:false,
	}
	// 分享的房间id
	public share = '' 


	public user = {} as any

	public rival = {} as any

	public resetBattle(){
		this.battle = {
			roomid:'',
			current_question:null,
			totle:0,
			result:null,
			share:false
		}
	}
}