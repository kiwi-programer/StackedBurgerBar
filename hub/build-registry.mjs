import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const require=createRequire('/home/kiwi-programer/Documents/rua-labs-platform/dashboard/package.json');
const {chromium}=require('@playwright/test');
const server=http.createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep))throw Error();const ext=path.extname(file);res.setHeader('Content-Type',({'.css':'text/css','.js':'application/javascript','.html':'text/html','.svg':'image/svg+xml'})[ext]||'text/plain');res.end(await fs.readFile(file))}catch{res.statusCode=404;res.end()}});
await new Promise(r=>server.listen(5194,'127.0.0.1',r));
const browser=await chromium.launch({headless:true});const page=await browser.newPage();
await page.route("**/public/rua-hub.js",route=>route.abort());
const manifest={schemaVersion:1,registryId:'stacked-burger-bar@1.0.0',projectSlug:'stacked-burger-bar',adapter:'html-template',repository:'https://github.com/kiwi-programer/StackedBurgerBar',websiteUrl:'https://stacked-burger-bar.vercel.app',sourceCommit:'cc3798b2c3253a72e4297bc0a974016ca8512495',root:{fields:{}},assets:[],components:{},pages:[]};
const templates={};
try{
for(const key of ['home','our-story','initiatives-and-partners','events','venue-hire','contact-us']){
 const file=key==='home'?'index':key;
 await page.goto('http://127.0.0.1:5194/templates/'+file+'.html');
 await page.waitForFunction(()=>{const e=document.querySelector('[data-source]');return !e||e.childNodes.length>0});
 const result=await page.evaluate(()=>{
  const bindings=[];
  function selector(el){if(el===document.documentElement)return 'html';const parent=el.parentElement;const siblings=Array.from(parent.children).filter(x=>x.tagName===el.tagName);return selector(parent)+' > '+el.tagName.toLowerCase()+':nth-of-type('+(siblings.indexOf(el)+1)+')'}
  const elements=Array.from(document.querySelectorAll('title,meta[name="description"],meta[property="og:title"],meta[property="og:description"],body h1,body h2,body h3,body h4,body h5,body p,body a,body span,body dt,body dd,body img,body li'));
  for(const el of elements){
   if(el.closest('script,style,svg,select'))continue;
   const base=selector(el);
   const attr=el.tagName==='IMG'?['src','alt']:el.tagName==='A'?['href']:el.tagName==='META'?['content']:[];
   for(const name of attr){const value=el.getAttribute(name);if(value!==null&&value.length<20000)bindings.push({selector:base,attribute:name,value,label:el.tagName.toLowerCase()+' '+name+' '+value.slice(0,45)})}
   if(el.tagName!=='META'&&el.tagName!=='IMG')Array.from(el.childNodes).forEach((n,index)=>{if(n.nodeType===3&&n.textContent.trim())bindings.push({selector:base,textIndex:index,value:n.textContent,label:el.tagName.toLowerCase()+' '+n.textContent.trim().slice(0,55)})});
  }
  const seen=new Set();const unique=bindings.filter(b=>{const k=b.selector+':'+(b.attribute??b.textIndex);if(seen.has(k))return false;seen.add(k);return true});
  unique.forEach((b,i)=>b.key='region'+i);
  document.querySelectorAll('script').forEach(n=>n.remove());
  document.querySelectorAll('iframe').forEach(n=>{const p=document.createElement('p');p.textContent='External embed retained on the public website';n.replaceWith(p)});
  document.querySelectorAll('*').forEach(el=>{for(const a of [...el.attributes])if(a.name.startsWith('on'))el.removeAttribute(a.name)});
  return {html:'<!doctype html>'+document.documentElement.outerHTML,bindings:unique,title:document.title};
 });
 const css=await fs.readFile(path.join(root,'styles/main.css'),'utf8');
 result.html=result.html.replace(/<link[^>]+href="\.\.\/styles\/main.css"[^>]*>/,'<style>'+css+'</style>').replace('<head>','<head><base href="https://stacked-burger-bar.vercel.app/templates/">');
 const type='Template'+key.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join('');
 const values=Object.fromEntries(result.bindings.map(b=>[b.key,b.value]));
 manifest.components[type]={label:result.title,fields:{values:{type:'object',objectFields:Object.fromEntries(result.bindings.map(b=>[b.key,{type:b.value.length>160?'textarea':'text',label:b.label,...(b.attribute==='src'?{format:'asset'}:b.attribute==='href'?{format:'url'}:{})}]))}},defaultProps:{values}};
 manifest.pages.push({key,path:key==='home'?'/':'/templates/'+file+'.html',title:result.title,components:[type],defaultData:{root:{props:{}},content:[{type,props:{id:'stacked-'+key,values}}]}});
 templates[key]={...result,sourceSha256:crypto.createHash('sha256').update(await fs.readFile(path.join(root,'templates',file+'.html'))).digest('hex')};
}
await fs.writeFile(root+'/hub/manifest.json',JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(root+'/hub/templates.json',JSON.stringify(templates,null,2)+'\n');
await fs.writeFile('/home/kiwi-programer/Documents/rua-labs-platform/backend/src/cms/stacked-manifest.json',JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(root+'/hub/package.json',JSON.stringify({name:'@rua-labs/stacked-website',version:'1.0.0',type:'module',exports:{'./templates':'./templates.json','./manifest':'./manifest.json'}},null,2));
console.log(JSON.stringify({pages:manifest.pages.length,regions:Object.values(templates).reduce((n,t)=>n+t.bindings.length,0)}));
}finally{await browser.close();await new Promise(r=>server.close(r))}
