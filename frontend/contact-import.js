// Lectura local: los documentos no se envían a un servidor ni se ejecutan macros.
window.MP_importContacts=async file=>{
 if(!file||file.size>10*1024*1024)throw Error('Selecciona un archivo de hasta 10 MB.');
 const ext=file.name.split('.').pop().toLowerCase(),data=await file.arrayBuffer();let text='';
 if(['xlsx','xls'].includes(ext)){
  if(!window.XLSX)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='vendor/xlsx.full.min.js';s.onload=resolve;s.onerror=()=>reject(Error('Falta vendor/xlsx.full.min.js. Ejecuta scripts/vendor.mjs.'));document.head.append(s)});
  const book=XLSX.read(data,{type:'array',cellFormula:false,cellHTML:false,sheetRows:20000});text=book.SheetNames.map(n=>XLSX.utils.sheet_to_csv(book.Sheets[n])).join('\n');
 }else if(ext==='docx'){
  const {unzipSync}=await import('./vendor/fflate.js');const files=unzipSync(new Uint8Array(data),{filter:f=>f.name==='word/document.xml'&&f.originalSize<10000000});if(!files['word/document.xml'])throw Error('DOCX inválido o demasiado grande');const xml=new DOMParser().parseFromString(new TextDecoder().decode(files['word/document.xml']),'application/xml');text=[...xml.getElementsByTagName('w:p')].map(p=>p.textContent).join('\n');
 }else if(ext==='pdf'){
  const pdfjs=await import('./vendor/pdf.mjs');pdfjs.GlobalWorkerOptions.workerSrc='./vendor/pdf.worker.mjs';const doc=await pdfjs.getDocument({data,isEvalSupported:false}).promise;if(doc.numPages>100)throw Error('Máximo 100 páginas');for(let p=1;p<=doc.numPages;p++){const page=await doc.getPage(p);text+=(await page.getTextContent()).items.map(i=>i.str).join(' ')+'\n'}await doc.destroy();if(text.trim().length<20)throw Error('PDF escaneado: requiere OCR. Convierte a texto y vuelve a importar.');
 }else if(['txt','csv'].includes(ext))text=new TextDecoder().decode(data);else throw Error('Admite DOCX, XLS, XLSX, PDF, TXT y CSV.');
 const candidates=text.match(/(?:\+|00)?\d[\d\s().-]{6,25}\d/g)||[];
 return [...new Set(candidates.map(n=>n.trim().replace(/[\s().-]/g,'').replace(/^00/,'+')))];
};
