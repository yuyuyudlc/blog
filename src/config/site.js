export const siteConfig = {
  name: "四叠半日志",
  title: "四叠半日志",
  description: "在无数次的试错中抵达彼端",
  tagline: "在无数次的试错中抵达彼端",
  // One plain sentence on the home page: who writes here and about what.
  // Left empty for now; nothing is rendered while it is empty.
  intro: "",
  author: "yuyuyudlc",
  authorAvatar: "/author-yuyuyudlc.png",
  copyright: "© 2026 四叠半日志",
  themeStorageKey: "dev-log-theme",
  toastId: "dev-log-toast",
  nav: [
    { label: "首页", href: "/" },
    { label: "归档", href: "/archive" },
  ],
  categories: [
    { label: "前端", slug: "frontend", numeral: "壱", mat: "one", orient: "h" },
    { label: "后端", slug: "backend", numeral: "弐", mat: "two", orient: "v" },
    { label: "AI", slug: "ai", numeral: "参", mat: "three", orient: "h" },
    { label: "随记", slug: "notes", numeral: "肆", mat: "four", orient: "v" },
    {
      label: "photos",
      slug: "photos",
      numeral: "半",
      mat: "half",
      orient: "square",
    },
  ],
};
