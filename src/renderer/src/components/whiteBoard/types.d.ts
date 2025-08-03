import {whiteBoardState} from "@/applications/ChuangKeApplication/components/whiteBoard/enum.ts";

export declare type AddElementOptions = {
    left: number;
    top: number;
    center?: 'vertical' | 'horizontal' | 'center';
    cloneNode?: true | false
} | {
    left?: number;
    top?: number;
    center: 'vertical' | 'horizontal' | 'center';
    cloneNode?: true | false
}

export declare interface WBElement extends HTMLElement {
    play: () => void;
    pause: () => void;
    stop: () => void;
    addElement: (options: AddElementOptions, key: string) => void;
    cacheElement: (element: Element, key: string) => void;
    delCacheElement: (key: string) => void;
    switchState: (param: whiteBoardState) => void;
}


declare global {
    interface HTMLElement {
        _dragData?: {
            onMouseDown: (e: MouseEvent) => void;
        };
    }
}