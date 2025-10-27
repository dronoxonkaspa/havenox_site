// src/utils/basePath.js
export function normaliseBasePath(input) {
  if (!input) return "/";

  if (input === "." || input === "./") {
    return "/";
  }

  try {
    const url = new URL(input, "http://localhost");
    let path = url.pathname;
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    if (!path.endsWith("/")) {
      path = `${path}/`;
    }
    return path;
  } catch {
    let path = input.trim();
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    if (!path.endsWith("/")) {
      path = `${path}/`;
    }
    return path;
  }
}

export function deriveRouterBasename(input) {
  const normalised = normaliseBasePath(input);
  if (normalised === "/") return "/";
  return normalised.endsWith("/") ? normalised.slice(0, -1) : normalised;
}
