import type {Metadata} from 'next';
import './globals.css';
import Theme from './theme';
import {SITE_URL,SITE_NAME,SITE_TITLE,SITE_DESCRIPTION,SITE_ENGLISH_NAME,siteNameSchema} from '@/lib/site';
export const metadata:Metadata={metadataBase:new URL(SITE_URL),title:SITE_TITLE,description:SITE_DESCRIPTION,applicationName:SITE_ENGLISH_NAME,robots:{index:true,follow:true},openGraph:{title:SITE_TITLE,description:SITE_DESCRIPTION,type:'website',locale:'ar_SA'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ar" dir="rtl" suppressHydrationWarning><head><meta name="google-site-verification" content="t8elB2NwK-beAeD6IJvhWhMjwuoiHr4BnSeZtWctFmg"/><meta property="og:site_name" content={SITE_NAME}/><link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any"/><script id="site-name-schema" type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(siteNameSchema).replace(/</g,'\\u003c')}}/></head><body><Theme/>{children}</body></html>;}
