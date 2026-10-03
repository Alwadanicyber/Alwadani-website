import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Alwadani | منصة الدروس',description:'دروس وتمارين تفاعلية للطلاب مع تصحيح مفسر ولوحة نتائج وشهادة إتمام، ومساحة خاصة للمعلم.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ar" dir="rtl"><body>{children}</body></html>;}
