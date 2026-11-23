(() => {
  'use strict';
  const defaults={strokes:[],smooth:'standard',rate:1,seconds:0,delay:0,display:'play',
    x:50,y:50,width:70,height:100,angle:0,opacity:1,order:'front'};
  const styleDefaults={pen:'ball',tip:'pointed',color:'#181818',width:6,opacity:1};
  window.editAhakoDrawing=function(source,commit){
    const layer=Object.assign(structuredClone(defaults),structuredClone(source||{}));
    const brush=Object.assign({},styleDefaults,layer.brush);
    const dialog=document.createElement('dialog');
    dialog.className='draw-editor';
    dialog.setAttribute('aria-label','手書きレイヤー');
    dialog.innerHTML=`
      <header><strong>手書きレイヤー</strong><button data-action="cancel">キャンセル</button><button data-action="save">保存</button></header>
      <div class="draw-window"><div class="draw-sheet"><canvas aria-label="描画領域"></canvas></div></div>
      <div class="draw-scroll">
      <div class="draw-row"><button data-action="undo">一筆戻す</button><button data-action="redo">やり直す</button>
      <button data-action="preview">再生確認</button><button data-action="clear">全消去</button></div>
      <output aria-live="polite"></output>
      <div class="draw-row"><label>ペン<select name="pen"><option value="ball">ボールペン</option><option value="fountain">万年筆</option><option value="brush">筆ペン</option><option value="marker">マーカー</option><option value="crayon">クレヨン</option></select></label>
      <label data-nib>筆先<select name="tip"><option value="pointed">穂先（細入り）</option><option value="flat">平筆（斜め）</option><option value="round">丸筆</option></select></label>
      <label>色<input name="color" type="color"></label><label>太さ<input name="width" type="number" min="1" max="80"></label>
      <label>インク濃度<input name="opacity" type="number" min="0" max="1" step=".05"></label>
      <button data-action="restyle">全筆跡にペン設定を適用</button></div>
      <div class="draw-row"><label>手ブレ補正<select name="smooth"><option value="off">OFF</option><option value="standard">標準</option><option value="strong">強</option></select></label>
      <label>操作<select name="tool"><option value="draw">描く</option><option value="pan">用紙を動かす</option></select></label>
      <label>拡大<select name="zoom"><option>1</option><option>1.5</option><option>2</option><option>3</option></select></label>
      <label><input name="grid" type="checkbox" checked>ガイド</label></div>
      <details open><summary>再生</summary><div class="draw-row">
      <label>表示<select name="display"><option value="play">手書き再生</option><option value="still">完成形</option></select></label>
      <label>再生時間<select name="timing"><option value="0">記録どおり</option><option value="3">3秒</option><option value="5">5秒</option><option value="10">10秒</option><option value="custom">任意</option></select></label>
      <label>任意の秒数<input name="seconds" type="number" min=".1" max="300" step=".1"></label>
      <label>速度<select name="rate"><option>0.5</option><option>1</option><option>1.5</option><option>2</option><option>3</option></select></label>
      <label>開始まで（秒）<input name="delay" type="number" min="0" max="60" step=".1"></label></div></details>
      <details><summary>Scene上の配置</summary><div class="draw-map" aria-label="ドラッグで配置"><canvas></canvas></div><div class="draw-row draw-position"></div></details></div>`;
    const find=s=>dialog.querySelector(s), field=n=>find('[name="'+n+'"]');
    const sheet=find('.draw-sheet'),canvas=sheet.querySelector('canvas'), map=find('.draw-map'),small=map.querySelector('canvas');
    for(const [key,label,min,max,step] of [['x','中心X（%）',0,100,1],['y','中心Y（%）',0,100,1],['width','幅（%）',1,200,1],['height','縦倍率（%）',10,300,1],['angle','回転（度）',-180,180,1],['opacity','全体の不透明度',0,1,.05]]){
      const el=document.createElement('label');el.textContent=label;
      const input=document.createElement('input');Object.assign(input,{name:'pos-'+key,type:'number',min,max,step,value:layer[key]});el.append(input);find('.draw-position').append(el);
    }
    find('.draw-position').insertAdjacentHTML('beforeend','<label>重なり<select name="order"><option value="front">本文の手前</option><option value="behind">本文の奥</option></select></label>');
    for(const [k,v] of Object.entries(brush))if(field(k))field(k).value=v;
    for(const k of ['smooth','display','delay','rate','order'])field(k).value=layer[k];
    field('timing').value=[0,3,5,10].includes(layer.seconds)?layer.seconds:'custom';
    field('seconds').value=layer.seconds||5;
    let active=null,wallEnd=null,preview=0,panX=0,panY=0,pan=null,redo=[], count=0;
    const endTime=()=>layer.strokes.at(-1)?.points.at(-1)?.[2]||0;
    function redrawInk(target=canvas, strokes=layer.strokes){
      window.AhakoDraw.painter(target,{...layer,strokes}).render(Infinity);
    }
    function redraw(){
      cancelAnimationFrame(preview);
      redrawInk();
      small.width=canvas.width;small.height=canvas.height;small.getContext('2d').drawImage(canvas,0,0);
      Object.assign(small.style,{left:layer.x+'%',top:layer.y+'%',width:layer.width+'%',opacity:layer.opacity,
        transform:'translate(-50%,-50%) rotate('+layer.angle+'deg) scaleY('+layer.height/100+')'});
      find('[data-action="undo"]').disabled=!layer.strokes.length;
      find('[data-action="redo"]').disabled=!redo.length;
      field('rate').disabled=layer.seconds>0||layer.display==='still';
      field('seconds').disabled=field('timing').value!=='custom'||layer.display==='still';
      field('timing').disabled=layer.display==='still';
      count=layer.strokes.reduce((n,s)=>n+s.points.length,0);
    }
    function view(){
      find('[data-nib]').style.display=brush.pen==='brush'?'':'none';
      const zoom=Number(field('zoom').value);
      sheet.style.transform='translate('+panX+'px,'+panY+'px) scale('+zoom+')';
      sheet.classList.toggle('guided',field('grid').checked);
    }
    dialog.addEventListener('change',e=>{
      const input=e.target,n=input.name;
      if(!n)return;
      if(input.type==='number'&&(!input.value||!input.validity.valid)){input.reportValidity();return;}
      if(n.startsWith('pos-'))layer[n.slice(4)]=Number(input.value);
      else if(n in styleDefaults)brush[n]=input.type==='number'?Number(input.value):input.value;
      else if(n==='timing'||n==='seconds')layer.seconds=field('timing').value==='custom'?Number(field('seconds').value):Number(field('timing').value);
      else if(['smooth','display','order'].includes(n))layer[n]=input.value;
      else if(n==='delay'||n==='rate')layer[n]=Number(input.value);
      if(n==='zoom'){panX=0;panY=0;}
      view();redraw();
    });
    function point(e,t){
      const r=canvas.getBoundingClientRect(),unit=n=>Math.round(10000*Math.max(0,Math.min(1,n)))/10000;
      const p=[unit((e.clientX-r.left)/r.width),unit((e.clientY-r.top)/r.height),Math.min(300000,Math.round(t))];
      if(e.pointerType==='pen'&&e.pressure>0)p.push(unit(e.pressure));
      return p;
    }
    function finishStroke(){
      if(active){active=null;wallEnd=performance.now();redraw();}
      pan=null;
    }
    canvas.onpointerdown=e=>{
      if(active||pan||e.button!==0)return;
      cancelAnimationFrame(preview);e.preventDefault();canvas.setPointerCapture(e.pointerId);
      if(field('tool').value==='pan'){pan={id:e.pointerId,x:e.clientX-panX,y:e.clientY-panY};return;}
      if(!layer.strokes.length)wallEnd=null;
      const now=performance.now(),start=endTime()+(wallEnd===null?0:Math.min(2000,now-wallEnd));
      if(layer.strokes.length>=1000||count>=20000||start>=300000){find('output').textContent='記録上限（300秒・1,000筆・20,000点）に達しました。';return;}
      // Cache finished strokes once per gesture. Only the pen tip changes on move.
      redrawInk();
      const backing=document.createElement('canvas');
      backing.width=canvas.width;backing.height=canvas.height;
      backing.getContext('2d').drawImage(canvas,0,0);
      const tip=document.createElement('canvas');
      const stroke={...brush,points:[point(e,start)]};
      layer.strokes.push(stroke);redo=[];active={id:e.pointerId,stroke,start,now:e.timeStamp,backing,tip};count++;renderTip();
    };
    function renderTip(){
      if(!active)return;
      const {tip,stroke,backing}=active;
      redrawInk(tip,[stroke]);
      const ctx=canvas.getContext('2d');
      ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(backing,0,0);ctx.drawImage(tip,0,0,canvas.width,canvas.height);ctx.restore();
    }
    let paintFrame=0;
    function sample(e,last){
      if(!active||e.pointerId!==active.id)return;
      const t=active.start+Math.max(0,e.timeStamp-active.now),points=active.stroke.points,previous=points.at(-1);
      const p=point(e,t);
      if(count<20000&&(p[0]!==previous[0]||p[1]!==previous[1])&&(last||p[2]-previous[2]>=8)){
        points.push(p);count++;
        if(!paintFrame)paintFrame=requestAnimationFrame(()=>{paintFrame=0;if(dialog.open)renderTip();});
      }
      if(count>=20000||t>=300000){find('output').textContent='記録上限に達しました。';finishStroke();}
    }
    canvas.onpointermove=e=>{if(pan?.id===e.pointerId){panX=e.clientX-pan.x;panY=e.clientY-pan.y;view();}else sample(e,false);};
    canvas.onpointerup=e=>{if(active?.id===e.pointerId||pan?.id===e.pointerId){if(active)active.stroke.releasedAt=Math.min(300000,Math.round(active.start+Math.max(0,e.timeStamp-active.now)));
      sample(e,true);finishStroke();}};
    canvas.onlostpointercapture=e=>{if(active?.id===e.pointerId||pan?.id===e.pointerId)finishStroke();};
    // Time spent in controls is outside the drawing timeline.
    dialog.addEventListener('pointerdown',e=>{if(e.target!==canvas)wallEnd=null;});
    function place(e){
      const rect=map.getBoundingClientRect();
      for(const [key,v] of [['x',(e.clientX-rect.left)/rect.width],['y',(e.clientY-rect.top)/rect.height]]){
        layer[key]=Math.round(100*Math.min(1,Math.max(0,v)));field('pos-'+key).value=layer[key];
      }
      redraw();
    }
    map.onpointerdown=e=>{map.setPointerCapture(e.pointerId);place(e);};
    map.onpointermove=e=>{if(map.hasPointerCapture(e.pointerId))place(e);};
    dialog.onclick=e=>{
      const action=e.target.closest('button')?.dataset.action;
      if(!action)return;
      if(action==='cancel'){dialog.close();return;}
      if(action==='save'){
        for(const i of dialog.querySelectorAll('input[type=number]:enabled'))if(!i.value||!i.reportValidity())return;
        layer.brush={...brush};commit(layer.strokes.length?layer:null);dialog.close();return;
      }
      if(action==='undo'&&layer.strokes.length)redo.push(layer.strokes.pop());
      if(action==='redo'&&redo.length)layer.strokes.push(redo.pop());
      if(action==='clear'&&layer.strokes.length&&confirm('筆跡をすべて消しますか？')){redo=layer.strokes.slice().reverse();layer.strokes=[];}
      if(action==='restyle')for(const stroke of layer.strokes)Object.assign(stroke,brush);
      redraw();
      if(action==='preview'){
        const paint=window.AhakoDraw.painter(canvas,layer),start=performance.now();
        const frame=t=>{if(!paint.render(t-start))preview=requestAnimationFrame(frame);};
        preview=requestAnimationFrame(frame);
      }
    };
    dialog.onclose=()=>{cancelAnimationFrame(paintFrame);cancelAnimationFrame(preview);dialog.remove();};
    dialog.onkeydown=e=>{if(e.key!=='Escape')e.stopPropagation();};
    document.body.append(dialog);dialog.showModal();view();redraw();
  };
})();
