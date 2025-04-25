class RankItem extends eui.ItemRenderer{
	private item_group:eui.Group;
	private item_name_label:eui.Label
	private credit:eui.Label
	private rank:eui.Label

	private rank_num:eui.Label
	private rank1:eui.Image
	private rank2:eui.Image
	private rank3:eui.Image
	
	private user_avatar:eui.Image
	private user_name:eui.Label


	public constructor() {
		super();
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}
	protected childrenCreated():void
	{
		super.childrenCreated();
	}
	protected dataChanged(...arg):void{
		
		// if( this.data.isloading ){
		// 	this.item_name_label.text = '加载中'
		// }
		// 开启 useVirtualLayout 后回到索引一恢复宽度

		console.log( this.data.credit , 'this.data.credit ',
		this.data.rank, 'rank',  this.data )

		if( this.data.rank ){
			this.data.rank = parseInt(this.data.rank);
			if( this.data.rank === -1 ){
				this.credit.text = '无排名'
				this.rank_num.text = '99+'
				this.rank_num.alpha = 1
			}else{
				if( this.data.rank === 1 ){
					this.rank1.alpha = 1
				}
				if( this.data.rank === 2 ){
					this.rank2.alpha = 1
				}
				if( this.data.rank === 3 ){
					this.rank3.alpha = 1
				}
				this.rank_num.alpha = 1
				this.rank_num.text = this.data.rank < 10 ? `0${this.data.rank}` : this.data.rank
			}
		}else{
			this.rank_num.text = this.data.rank
		}

		console.log( this.data.nickname , 'nickname' )
		this.user_name.text = this.data.nickname.length > 5 ?  
			this.data.nickname.slice(0,5) + '...' : 
			this.data.nickname
		this.rank.text = this.data.rank_name
		Utils.ImageLoader(this.data.avatar).then(res=>{
			this.user_avatar.source = res
		})

    }
	
}