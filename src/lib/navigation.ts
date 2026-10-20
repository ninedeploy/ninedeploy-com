/** Static exports use trailing slashes; active links must accept either form. */
export function matchesPathname(pathname: string, href: string) {
  const normalize = (path: string) => path.replace(/\/+$/, "") || "/";
  return normalize(pathname) === normalize(href);
}
