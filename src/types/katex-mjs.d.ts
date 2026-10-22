// The real KaTeX ESM build, imported by src/lib/katex-lazy.ts (the `katex` id is aliased to that shim)
declare module 'katex/dist/katex.mjs' {
  import katex from 'katex'

  export default katex
}
