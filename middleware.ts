import {NextResponse} from 'next/server';
export function middleware(){const response=NextResponse.next();response.headers.set('Cache-Control','no-store, max-age=0');return response;}
export const config={matcher:['/','/teacher/:path*','/tools/:path*']};
