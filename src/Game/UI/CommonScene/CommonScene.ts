class CommonScene extends eui.Component implements  eui.UIComponent{
    protected childrenCreated():void
	{
		super.childrenCreated();
		
		this.top = 0;
		this.left = 0;
		this.right = 0;
		this.bottom = 0;
    }

    setBackBtn(onBack?:()=>void){
        const img = new eui.Image();
        img.source = 'back_png';
        img.width = 97;
        img.height = 86;
        img.top = 38;
        this.addChild(img);
        
        img.addEventListener(egret.TouchEvent.TOUCH_TAP,()=>{
            onBack && onBack()
            SceneManager.getInstance().popScene()
        },this);
    }


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
}