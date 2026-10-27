export const picuiImagePattern = {
  protocol: 'https',
  hostname: 'cdn.imgos.cn',
  port: '',
  pathname: '/vip/19936/**',
  search: '',
};

export function isPicuiImage(source) {
  try {
    const url = new URL(source);
    return url.protocol === `${picuiImagePattern.protocol}:`
      && url.hostname === picuiImagePattern.hostname
      && url.port === picuiImagePattern.port
      && url.pathname.startsWith(picuiImagePattern.pathname.slice(0, -2))
      && url.search === picuiImagePattern.search
      && !url.username && !url.password;
  } catch {
    return false;
  }
}
