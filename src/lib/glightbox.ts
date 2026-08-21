import type GLightboxFactory from "glightbox";

export type LightboxInstance = ReturnType<typeof GLightboxFactory>;
export type LightboxOptions = Parameters<typeof GLightboxFactory>[0];

type LightboxModule = { default: typeof GLightboxFactory };

let modulePromise: Promise<LightboxModule> | null = null;

export function preloadGLightbox() {
  modulePromise ??= import("glightbox") as Promise<LightboxModule>;
  return modulePromise;
}

export async function loadGLightbox() {
  const { default: factory } = await preloadGLightbox();
  return factory;
}
