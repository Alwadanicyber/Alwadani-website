import type {Metadata} from 'next';

export const SITE_URL='https://alwadani-website.jubranii45.workers.dev';
export const SITE_NAME='الودعاني';
export const SITE_ENGLISH_NAME='Alwadani Teaching Tools';
export const SITE_TITLE=SITE_ENGLISH_NAME;
export const SITE_DESCRIPTION='أدوات تعليمية لإنشاء كشوف متابعة الطلاب والشهادات، ودروس وتمارين تفاعلية مع تصحيح مفسر ونتائج مباشرة.';
export const publicSitePaths=['/','/tools','/tools/records','/tools/certificates'];
export function pageMetadata(title:string,description:string,path:string):Metadata{
  const url=new URL(path,SITE_URL).href;
  return {title,description,alternates:{canonical:url},robots:{index:true,follow:true},openGraph:{title,description,url,type:'website',locale:'ar_SA',siteName:SITE_NAME},twitter:{card:'summary',title,description}};
}
export const siteNameSchema={'@context':'https://schema.org','@type':'WebSite',name:SITE_NAME,alternateName:[SITE_ENGLISH_NAME,'Alwadani','الودعاني للتعليم'],url:SITE_URL+'/',description:SITE_DESCRIPTION,inLanguage:'ar'};
