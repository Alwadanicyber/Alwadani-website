import type {Metadata} from 'next';
import './globals.css';
import './site-atmosphere.css';
import Theme from './theme';
import SiteAtmosphere from './site-atmosphere';
import {SITE_URL,SITE_NAME,SITE_TITLE,SITE_DESCRIPTION,siteNameSchema} from '@/lib/site';
export const metadata:Metadata={metadataBase:new URL(SITE_URL),title:SITE_TITLE,description:SITE_DESCRIPTION,applicationName:SITE_NAME,robots:{index:true,follow:true},openGraph:{title:SITE_TITLE,description:SITE_DESCRIPTION,type:'website',locale:'ar_SA',siteName:SITE_NAME}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ar" dir="rtl" suppressHydrationWarning><head><meta name="google-site-verification" content="t8elB2NwK-beAeD6IJvhWhMjwuoiHr4BnSeZtWctFmg"/><meta property="og:site_name" content={SITE_NAME}/><meta name="application-name" content={SITE_NAME}/><link rel="icon" href="/favicon.png" type="image/png" sizes="96x96"/><link rel="shortcut icon" href="/favicon.ico" type="image/x-icon"/><link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180"/><script id="site-name-schema" type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(siteNameSchema).replace(/</g,'\\u003c')}}/></head><body><Theme/><SiteAtmosphere/><div className="site-content">{children}</div></body></html>;}
