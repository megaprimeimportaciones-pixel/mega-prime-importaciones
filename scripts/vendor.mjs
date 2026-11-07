// Descarga explícita de dependencias fijadas y registra sus hashes para revisión.
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir=new URL('../frontend/vendor/',import.meta.url);await mkdir(dir,{recursive:true});
const sources={
 'xlsx.full.min.js':'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
 'fflate.js':'https://cdn.jsdelivr.net/npm/fflate@0.8.2/esm/browser.js',
 'pdf.mjs':'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/build/pdf.min.mjs',
 'pdf.worker.mjs':'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/build/pdf.worker.min.mjs'
};
const manifest={};for(const [name,url]of Object.entries(sources)){const r=await fetch(url);if(!r.ok)throw Error(name+': '+r.status);const bytes=Buffer.from(await r.arrayBuffer());await writeFile(new URL(name,dir),bytes);manifest[name]={url,sha256:createHash('sha256').update(bytes).digest('hex')}}
await writeFile(new URL('manifest.json',dir),JSON.stringify(manifest,null,2));console.log('Dependencias descargadas. Revisar licencias y manifest.json antes de publicar.');
