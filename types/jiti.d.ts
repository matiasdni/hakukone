declare module "jiti" {
  type JitiRequire = (id: string) => unknown;

  /**
   * Create a jiti require function.
   * The real `jiti` has more options; this minimal typing is enough
   * for importing TS files from build-time config files like `next.config`.
   */
  export default function createJiti(cwd?: string): JitiRequire;
}
