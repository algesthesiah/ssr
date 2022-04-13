import type { Request, Response } from 'express';
import type { RouterContext } from 'koa-router';
import type { ICookies, SetOption } from 'cookies';
export interface ExpressContext {
    request: Request;
    response: Response;
}
declare type IKoaContext = Omit<RouterContext, 'cookies' | 'router' | '_matchedRoute' | '_matchedRouteName'> & {
    cookies: Omit<Partial<ICookies>, 'set'> & {
        set?: (name: string, value?: string | null, opts?: SetOption) => IKoaContext['cookies'];
    };
};
export declare type ISSRContext<T = {}> = (ExpressContext | IKoaContext) & T;
export declare type ISSRNestContext<T = {}> = ExpressContext & T;
export declare type ISSRMidwayContext<T = {}> = IKoaContext & T;
export interface Options {
    mode?: string;
}
export interface IWindow {
    __USE_SSR__?: boolean;
    __INITIAL_DATA__?: any;
    STORE_CONTEXT?: any;
    __USE_VITE__?: boolean;
    __disableClientRender__?: boolean;
    prefix?: string;
    clientPrefix?: string;
    microApp?: any;
}
export {};
