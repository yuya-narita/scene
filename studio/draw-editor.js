(() => {
  'use strict';
  const defaults={strokes:[],smooth:'standard',rate:1,seconds:0,delay:0,display:'play',
    x:50,y:50,width:70,height:100,angle:0,opacity:1,order:'front'};
  const styleDefaults={pen:'ball',tip:'pointed',color:'#181818',width:6,opacity:1};
  window.editAhakoDrawing=function(source,commit){
    const layer=Object.assign(structuredClone(defaults),structuredClone(source||{}));
    const baseWidth=70;
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
      <details><summary>SMART TRACE（描画順序を指定）</summary><div class="draw-row"><button data-action="smart-start">筆跡をなぞる</button><button data-action="smart-finish" disabled>なぞった筆跡で確定</button><button data-action="smart-cancel" disabled>順序編集を中止</button></div><small>薄い線を大まかになぞります。下絵の連続経路に強制吸着します。ペンを離すまでが一筆です。</small></details>
      <details><summary>画像から筆跡を生成（試験版）</summary><div class="draw-row"><input name="traceFile" type="file" accept="image/png,image/jpeg,image/webp"><label>検出感度<input name="traceThreshold" type="number" min="20" max="245" value="150"></label><label>変換方式<select name="traceMode"><option value="natural">自然な線（Phase 2）</option><option value="legacy">従来（Phase 1）</option></select></label><button data-action="trace">筆跡を生成</button></div><small>白地の線画向け。生成すると現在の筆跡を置き換えます。</small></details>
      <div class="draw-row"><label>ペン<select name="pen"><option value="ball">ボールペン</option><option value="fountain">万年筆</option><option value="brush">筆ペン</option><option value="marker">マーカー</option><option value="crayon">クレヨン</option></select></label>
      <label data-nib>筆先<select name="tip"><option value="pointed">穂先（細入り）</option><option value="flat">平筆（斜め）</option><option value="round">丸筆</option></select></label>
      <label>色<input name="color" type="color"></label><label>太さ<input name="width" type="number" min="1" max="80"></label>
      <label>インク濃度<input name="opacity" type="number" min="0" max="1" step=".05"></label>
      <button data-action="restyle">全筆跡にペン設定を適用</button></div>
      <div class="draw-row"><label>手ブレ補正<select name="smooth"><option value="off">OFF</option><option value="standard">標準</option><option value="strong">強</option></select></label>
      <label>操作<select name="tool"><option value="draw">描く</option><option value="pan">用紙を動かす</option></select></label>
      <label>編集ズーム<select name="zoom"><option>1</option><option>1.5</option><option>2</option><option>3</option></select></label>
      <label>Scene表示倍率（標準幅70%基準）<select name="sceneZoom"><option value="1">1倍</option><option value="1.5">1.5倍</option><option value="2">2倍</option><option value="3">3倍</option><option value="custom">任意</option></select></label>
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
    for(const [key,label,min,max,step] of [['x','中心X（%）',0,100,1],['y','中心Y（%）',0,100,1],['width','幅（%）',1,600,1],['height','縦倍率（%）',10,300,1],['angle','回転（度）',-180,180,1],['opacity','全体の不透明度',0,1,.05]]){
      const el=document.createElement('label');el.textContent=label;
      const input=document.createElement('input');Object.assign(input,{name:'pos-'+key,type:'number',min,max,step,value:layer[key]});el.append(input);find('.draw-position').append(el);
    }
    find('.draw-position').insertAdjacentHTML('beforeend','<label>重なり<select name="order"><option value="front">本文の手前</option><option value="behind">本文の奥</option></select></label>');
    for(const [k,v] of Object.entries(brush))if(field(k))field(k).value=v;
    for(const k of ['smooth','display','delay','rate','order'])field(k).value=layer[k];
    field('timing').value=[0,3,5,10].includes(layer.seconds)?layer.seconds:'custom';
    field('seconds').value=layer.seconds||5;
    field('sceneZoom').value=[1,1.5,2,3].includes(layer.width/baseWidth)?String(layer.width/baseWidth):'custom';
    let traceWorker=null, traceBusy=false, smart=null, gesture=null;
    let active=null,wallEnd=null,preview=0,panX=0,panY=0,pan=null,redo=[], count=0;
    const endTime=()=>layer.strokes.at(-1)?.points.at(-1)?.[2]||0;
    function redrawInk(target=canvas, strokes=layer.strokes){
      window.AhakoDraw.painter(target,{...layer,strokes}).render(Infinity);
    }
    function redraw(){
      cancelAnimationFrame(preview);
      redrawInk();
      if(smart){
        const guide=document.createElement('canvas');
        redrawInk(guide,smart.pool);
        const ctx=canvas.getContext('2d');ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.23;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(guide,0,0,canvas.width,canvas.height);ctx.restore();
        const ink=document.createElement('canvas');redrawInk(ink,layer.strokes);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(ink,0,0,canvas.width,canvas.height);ctx.restore();
        find('output').textContent=`SMART TRACE：${smart.order.length} 筆確定（作者の筆数）`;
      }
      small.width=canvas.width;small.height=canvas.height;small.getContext('2d').drawImage(canvas,0,0);
      Object.assign(small.style,{left:layer.x+'%',top:layer.y+'%',width:layer.width+'%',opacity:layer.opacity,
        transform:'translate(-50%,-50%) rotate('+layer.angle+'deg) scaleY('+layer.height/100+')'});
      find('[data-action="undo"]').disabled=smart?!smart.order.length:!layer.strokes.length;
      find('[data-action="redo"]').disabled=smart?!smart.redo.length:!redo.length;
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
      if(!n||n.startsWith("trace"))return;
      if(input.type==='number'&&(!input.value||!input.validity.valid)){input.reportValidity();return;}
      if(n==='sceneZoom'){
        if(input.value==='custom'){find('details:last-child').open=true;field('pos-width').focus();return;}
        layer.width=Math.min(600,Math.max(1,Math.round(baseWidth*Number(input.value))));
        field('pos-width').value=layer.width;
      }else if(n.startsWith('pos-')){
        layer[n.slice(4)]=Number(input.value);
        if(n==='pos-width')field('sceneZoom').value='custom';
      }
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
    function smartControls(on){
      for(const a of ['smart-finish','smart-cancel'])find(`[data-action="${a}"]`).disabled=!on;
      for(const a of ['smart-start','trace','clear','restyle'])find(`[data-action="${a}"]`).disabled=on;
    }
    function smartRefresh(){
      let t=0;layer.strokes=smart.order.map(st=>{const points=st.points.map(p=>{const q=p.slice();q[2]=t;t+=8;return q;});const releasedAt=t;t+=12;return {...st,points,releasedAt};});redraw();
    }
    // Match the gesture to a connected graph of guide lines, never to raw input.
    function smartRoute(samples){
      const r=canvas.getBoundingClientRect(),sx=r.width,sy=r.height;
      const xy=p=>[p[0]*sx,p[1]*sy],dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
      const radius=Math.max(12,Math.min(42,sx*.085)),step=3;
      function resample(ps){const out=[ps[0]];for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],n=Math.ceil(dist(a,b)/step);for(let j=1;j<=n;j++)out.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);}return out;}
      if(!samples.length)return null;
      const g=resample(samples.map(xy)),nodes=[],grid=new Map(),cell=4;
      const key=(x,y)=>x+','+y;
      function near(p,rad){const out=[];for(let x=Math.floor((p[0]-rad)/cell);x<=Math.floor((p[0]+rad)/cell);x++)for(let y=Math.floor((p[1]-rad)/cell);y<=Math.floor((p[1]+rad)/cell);y++)for(const i of grid.get(key(x,y))||[])if(dist(nodes[i].p,p)<=rad)out.push(i);return out;}
      function link(a,b){if(a===b||nodes[a].adj.includes(b))return;nodes[a].adj.push(b);nodes[b].adj.push(a);}
      for(const st of smart.pool){if(!st.points.length)continue;let prev=-1;for(const p of resample(st.points.map(xy))){const i=nodes.length;nodes.push({p,st,adj:[]});if(prev>=0)link(prev,i);const k=key(Math.floor(p[0]/cell),Math.floor(p[1]/cell));if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i);prev=i;}}
      // Join only almost coincident guide points, not nearby parallel lines.
      const junction=Math.max(.65,Math.min(2,sx*.003));
      for(let i=0;i<nodes.length;i++)for(const j of near(nodes[i].p,junction))if(j<i&&nodes[i].st!==nodes[j].st)link(i,j);
      if(!nodes.length)return null;
      let beam=near(g[0],radius).map(i=>({i,c:dist(nodes[i].p,g[0])**2,prev:null,path:[i]})).sort((a,b)=>a.c-b.c).slice(0,32);
      for(let k=1;k<g.length&&beam.length;k++){
        const p=g[k],v=[p[0]-g[k-1][0],p[1]-g[k-1][1]],vl=Math.hypot(...v),next=new Map();
        for(const state of beam){
          const queue=[{i:state.i,path:[],len:0}],seen=new Map([[state.i,0]]),limit=Math.max(9,vl*3+3);
          for(let z=0;z<queue.length;z++){
            const q=queue[z],n=nodes[q.i],d=dist(n.p,p);
            if(d<=radius){const from=nodes[state.i].p,dx=n.p[0]-from[0],dy=n.p[1]-from[1],dl=Math.hypot(dx,dy),align=dl&&vl?(dx*v[0]+dy*v[1])/(dl*vl):0;
              const c=state.c+d*d*.12+(q.len-vl)**2*.65+(1-align)*vl*2;
              if(!next.has(q.i)||next.get(q.i).c>c)next.set(q.i,{i:q.i,c,prev:state,path:q.path});}
            for(const j of n.adj){const len=q.len+dist(n.p,nodes[j].p);if(len>limit||seen.has(j)&&seen.get(j)<=len)continue;seen.set(j,len);queue.push({i:j,path:[...q.path,j],len});}
          }
        }
        beam=[...next.values()].sort((a,b)=>a.c-b.c).slice(0,32);
      }
      if(!beam.length)return null;
      let best=beam.sort((a,b)=>(a.c+dist(nodes[a.i].p,g.at(-1))**2*3)-(b.c+dist(nodes[b.i].p,g.at(-1))**2*3))[0];
      if(dist(nodes[best.i].p,g.at(-1))>radius*.7)return null;
      const chunks=[];while(best){chunks.push(best.path);best=best.prev;}const ids=chunks.reverse().flat();
      const unit=v=>Math.round(Math.max(0,Math.min(1,v))*10000)/10000,points=[],widths=[];
      for(const i of ids){const n=nodes[i],p=[unit(n.p[0]/sx),unit(n.p[1]/sy),0];if(!points.length||p[0]!==points.at(-1)[0]||p[1]!==points.at(-1)[1]){points.push(p);widths.push(n.st.width);}}
      if(!points.length||g.length>3&&points.length<2)return null;
      return {...brush,width:widths.sort((a,b)=>a-b)[Math.floor(widths.length/2)]||brush.width,points};
    }
    function smartPick(samples){
      const stroke=smartRoute(samples);
      if(!stroke){redraw();find('output').textContent='経路を特定できません。もう一度なぞってください。';return;}
      if(smart.order.length>=1000||count+stroke.points.length>20000){find('output').textContent='記録上限に達しました。';return;}
      smart.order.push(stroke);smart.redo=[];smartRefresh();
    }
    function smartEnd(complete){
      if(complete){if(!smart.order.length){find('output').textContent='先になぞってください。';return;}smartRefresh();redo=[];}
      else layer.strokes=smart.pool;
      smart=null;gesture=null;wallEnd=null;smartControls(false);redraw();find('output').textContent=complete?`確定：${layer.strokes.length}筆`:'順序編集を中止しました。';
    }
    function finishStroke(){
      if(active){active=null;wallEnd=performance.now();redraw();}
      pan=null;
    }
    canvas.onpointerdown=e=>{
      if(traceBusy||active||pan||gesture||e.button!==0)return;
      cancelAnimationFrame(preview);e.preventDefault();canvas.setPointerCapture(e.pointerId);
      if(field('tool').value==='pan'){pan={id:e.pointerId,x:e.clientX-panX,y:e.clientY-panY};return;}
      if(smart){gesture={id:e.pointerId,points:[point(e,0)]};return;}
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
    canvas.onpointermove=e=>{if(pan?.id===e.pointerId){panX=e.clientX-pan.x;panY=e.clientY-pan.y;view();}else if(gesture?.id===e.pointerId){if(gesture.points.length<2000)gesture.points.push(point(e,0));}else sample(e,false);};
    canvas.onpointerup=e=>{if(gesture?.id===e.pointerId){const g=gesture;gesture=null;g.points.push(point(e,0));smartPick(g.points);return;}if(active?.id===e.pointerId||pan?.id===e.pointerId){if(active)active.stroke.releasedAt=Math.min(300000,Math.round(active.start+Math.max(0,e.timeStamp-active.now)));
      sample(e,true);finishStroke();}};
    canvas.onlostpointercapture=e=>{if(gesture?.id===e.pointerId)gesture=null;if(active?.id===e.pointerId||pan?.id===e.pointerId)finishStroke();};
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
    async function traceImage(){
      const file=field('traceFile').files[0], threshold=Number(field('traceThreshold').value), out=find('output');
      if(!file){out.textContent='画像を選択してください。';return;}
      if(!field('traceThreshold').reportValidity())return;
      if(layer.strokes.length&&!confirm('現在の筆跡を生成結果で置き換えますか？'))return;
      traceBusy=true;find('[data-action="trace"]').disabled=true;out.textContent='画像を解析中…';
      let url;
      try{
        url=URL.createObjectURL(file);const img=new Image();img.src=url;await img.decode();
        if(!dialog.open)return;
        const scale=Math.min(1,800/Math.max(img.naturalWidth,img.naturalHeight));
        const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*scale));c.height=Math.max(1,Math.round(img.naturalHeight*scale));
        const ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);const rgba=ctx.getImageData(0,0,c.width,c.height).data;
        traceWorker=new Worker('./auto-trace-worker.js?v=2');
        const result=await new Promise((resolve,reject)=>{traceWorker.onmessage=e=>resolve(e.data);traceWorker.onerror=e=>reject(new Error(e.message));traceWorker.postMessage({rgba,w:c.width,h:c.height,threshold,mode:field('traceMode').value},[rgba.buffer]);});
        if(!dialog.open)return;if(result.error)throw new Error(result.error);if(!result.strokes.length)throw new Error('線が見つかりません。検出感度を調整してください。');
        layer.strokes=result.strokes;redo=[];wallEnd=null;layer.smooth='off';field('smooth').value='off';panX=panY=0;field('zoom').value='1';view();redraw();
        out.textContent=`生成完了：${result.strokes.length}筆・${result.count}点`+(result.total>result.strokes.length?'（上限により一部省略）':'');
      }catch(e){out.textContent='変換できませんでした：'+e.message;}
      finally{if(url)URL.revokeObjectURL(url);traceWorker?.terminate();traceWorker=null;traceBusy=false;find('[data-action="trace"]').disabled=false;}
    }
    dialog.onclick=e=>{
      const action=e.target.closest('button')?.dataset.action;
      if(!action)return;
      if(action==='cancel'){dialog.close();return;}
      if(traceBusy)return;
      if(action==='smart-start'){
        if(!layer.strokes.length){find('output').textContent='先に筆跡を生成してください。';return;}
        smart={pool:layer.strokes,order:[],used:new Set(),redo:[]};field('tool').value='draw';smartControls(true);smartRefresh();return;
      }
      if(smart){
        if(action==='smart-finish'){smartEnd(true);return;}
        if(action==='smart-cancel'){smartEnd(false);return;}
        if(action==='undo'){const item=smart.order.pop();if(item){smart.redo.push(item);}smartRefresh();return;}
        if(action==='redo'){const item=smart.redo.pop();if(item){smart.order.push(item);}smartRefresh();return;}
        if(action==='save'){find('output').textContent='先にSMART TRACEを確定してください。';return;}
        if(action!=='preview')return;
      }
      if(action==='trace'){traceImage();return;}
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
    dialog.onclose=()=>{traceWorker?.terminate();cancelAnimationFrame(paintFrame);cancelAnimationFrame(preview);dialog.remove();};
    dialog.onkeydown=e=>{if(e.key!=='Escape')e.stopPropagation();};
    document.body.append(dialog);dialog.showModal();view();redraw();
  };
})();
