import {readFile,writeFile} from 'node:fs/promises';
const domain=new URL(process.argv[2]);if(domain.protocol!=='https:')throw Error('Usa dominio HTTPS');
const root=new URL('../frontend/',import.meta.url),escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for(const [file,title,description]of [['index.html','Mega Prime Importaciones | Cubiertas y acabados','Catálogo de cubiertas, acabados y materiales. Revisa productos y prepara tu cotización.'],['catalogo-digital.html','Catálogo digital | Mega Prime Importaciones','Consulta el catálogo digital de Mega Prime Importaciones.']]){
 const url=new URL(file==='index.html'?'/':'/'+file,domain).href;
 let s=await readFile(new URL(file,root),'utf8');s=s.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+title+'</title>');s=s.replace(/<meta name="robots"[^>]*>/i,'<meta name="robots" content="index,follow">');s=s.replace(/<link rel="canonical"[^>]*>|<meta (?:name="description"|property="og:[^"]+")[^>]*>/gi,'');
 s=s.replace('</head>','<meta name="description" content="'+escape(description)+'"><link rel="canonical" href="'+escape(url)+'"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+description+'"><meta property="og:url" content="'+escape(url)+'"><meta property="og:type" content="website"><script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'Mega Prime Importaciones',url:domain.origin}).replaceAll('<','\\u003c')+'</script></head>');await writeFile(new URL(file,root),s);
}
await writeFile(new URL('robots.txt',root),'User-agent: *\nAllow: /\nDisallow: /panel.html\nSitemap: '+domain.origin+'/sitemap.xml\n');
await writeFile(new URL('sitemap.xml',root),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['/','/catalogo-digital.html'].map(p=>'<url><loc>'+escape(domain.origin+p)+'</loc></url>').join('')+'</urlset>');
console.log('SEO preparado. Verifica dominio y datos antes de publicar.');
