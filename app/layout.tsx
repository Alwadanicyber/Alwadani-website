import type {Metadata} from 'next';
import './globals.css';
import Theme from './theme';
import {SITE_URL,SITE_NAME,SITE_TITLE,SITE_DESCRIPTION,SITE_ENGLISH_NAME} from '@/lib/site';
export const metadata:Metadata={metadataBase:new URL(SITE_URL),title:SITE_TITLE,description:SITE_DESCRIPTION,applicationName:SITE_ENGLISH_NAME,robots:{index:true,follow:true},openGraph:{title:SITE_TITLE,description:SITE_DESCRIPTION,siteName:SITE_NAME,type:'website',locale:'ar_SA'},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ar" dir="rtl" suppressHydrationWarning><head><meta name="google-site-verification" content="t8elB2NwK-beAeD6IJvhWhMjwuoiHr4BnSeZtWctFmg"/></head><body><Theme/>{children}</body></html>;}
