export * from './ctx';
export * from './config';
export * from './yargs';
export declare type Mode = 'development' | 'production';
export declare type ESMFeRouteItem<T = {}> = {
    path: string;
    webpackChunkName: string;
} & T;
export interface ParseFeRouteItem {
    path: string;
    fetch?: string;
    component?: string;
    webpackChunkName: string;
}
