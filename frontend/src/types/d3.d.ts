declare module 'd3-selection' {
  export function select(selector: string | Element | Document): any;
  export function selectAll(selector: string): any;
}

declare module 'd3' {
  export * from 'd3-selection';
  export * from 'd3-scale';
  export * from 'd3-shape';
  export * from 'd3-array';
  export * from 'd3-axis';
  export * from 'd3-transition';
  export { select, selectAll } from 'd3-selection';
}

declare module 'd3-sankey' {
  export interface SankeyNode<T extends Record<string, any>> {
    index?: number;
    x0?: number;
    y0?: number;
    x1?: number;
    y1?: number;
    value?: number;
  }

  export interface SankeyLink<S extends Record<string, any>, T extends Record<string, any>> {
    source: number | S;
    target: number | T;
    value: number;
    index?: number;
    y0?: number;
    y1?: number;
  }

  export function sankey<N extends Record<string, any>, L extends Record<string, any>>(): any;
  export function linkHorizontal(): (d: any) => string;
}
