(()=>{
 const workspace=document.getElementById('workspace');if(!workspace)return;
 const tab=document.createElement('section');tab.className='tab';tab.id='calculatorTab';tab.hidden=true;const title=document.createElement('h1');title.textContent='Calculadora interna de materiales';const info=document.createElement('p');info.textContent='Herramienta para el equipo autorizado. Confirma las medidas y fichas técnicas antes de usar los resultados.';tab.append(title,info);workspace.append(tab);let frame;
 const content=()=>{document.querySelectorAll('#workspace .tab').forEach(t=>t.hidden=t.id!=='contentTab')};
 const buttonNode=button('▦ Calculadora interna',()=>{document.querySelectorAll('#workspace .tab').forEach(t=>t.hidden=t!==tab);if(!frame){frame=document.createElement('iframe');frame.title='Calculadora interna de materiales';frame.src='index.html?tool=calculator';frame.style.height='85vh';tab.append(frame)}});document.querySelector('#workspace nav').append(buttonNode);
 window.addEventListener('message',e=>{if(e.origin===location.origin&&frame&&e.source===frame.contentWindow&&e.data?.type==='mp:close-calculator'){content();frame.remove();frame=null}});
})();
