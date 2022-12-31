/// <reference types="node" />
/**
 * Callback/Mutator
 * * this: jsdom
 * * path: current file.path
 */
export type GulpDomCallback = (/** jsdom bind */ this: Document, /** current file path */ path: string) => any;
/**
 * gulpDom
 * @param mutator callback
 * @returns
 */
export default function gulpDom(mutator: GulpDomCallback): import("stream").Transform;
