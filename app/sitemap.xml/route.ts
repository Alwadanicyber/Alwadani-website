import {listCourses} from '@/lib/courses';
import {SITE_URL,publicSitePaths} from '@/lib/site';
export const dynamic='force-dynamic';
const escape=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]!));
export async function GET(){
  const urls=publicSitePaths.map(path=>new URL(path,SITE_URL).href);
  try{for(const course of await listCourses())urls.push(new URL('/?course='+encodeURIComponent(course.id),SITE_URL).href);}catch{/* Public tools remain discoverable while the lesson database is unavailable. */}
  const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...new Set(urls)].map(url=>'<url><loc>'+escape(url)+'</loc></url>').join('')+'</urlset>';
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300'}});
}
