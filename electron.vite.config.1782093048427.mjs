// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
var __electron_vite_injected_dirname = "D:\\data\\jieShang";
var deciphonyRoot = path.resolve(__electron_vite_injected_dirname, "../deciphony/packages");
var rendererSrc = path.resolve(deciphonyRoot, "deciphony-renderer/src");
var playerSrc = path.resolve(deciphonyRoot, "deciphony-player/src");
var coreSrc = path.resolve(deciphonyRoot, "deciphony-core/src");
function buildRendererResolve(useLocalDeciphony) {
  const alias = {
    "@renderer": resolve("src/renderer/src")
  };
  if (useLocalDeciphony) {
    Object.assign(alias, {
      "deciphony-renderer": path.resolve(rendererSrc, "index.ts"),
      "deciphony-player": path.resolve(playerSrc, "index.ts"),
      "deciphony-core": path.resolve(coreSrc, "index.ts"),
      // 必须与 deciphony-renderer 指向同一份源码，否则 @/ 与包入口会被 Vite 当成两个模块实例
      "@": rendererSrc
    });
  }
  return {
    alias,
    ...useLocalDeciphony ? {
      dedupe: ["vue"]
    } : {}
  };
}
var electron_vite_config_default = defineConfig(({ mode }) => {
  const useLocalDeciphony = mode === "deciphony";
  return {
    main: {
      plugins: [externalizeDepsPlugin()]
    },
    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      resolve: buildRendererResolve(useLocalDeciphony),
      ...useLocalDeciphony ? {
        optimizeDeps: {
          exclude: ["deciphony-renderer", "deciphony-player", "deciphony-core"]
        }
      } : {},
      plugins: [vue(), tailwindcss()]
    }
  };
});
export {
  electron_vite_config_default as default
};
