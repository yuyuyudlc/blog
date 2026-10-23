/**
 * Keyboard shortcuts listed in the `?` help dialog. `mod` is replaced
 * with ⌘ or Ctrl depending on the platform.
 */
export const shortcutGroups = [
  {
    title: '全局',
    items: [
      { keys: ['mod', 'K'], label: '打开命令面板' },
      { keys: ['/'], label: '打开命令面板' },
      { keys: ['R'], label: '随机一篇文章' },
      { keys: ['H'], label: '回到首页' },
      { keys: ['T'], label: '切换深色 / 浅色主题' },
      { keys: ['?'], label: '显示快捷键' },
    ],
  },
  {
    title: '列表',
    items: [
      { keys: ['J'], label: '下一项' },
      { keys: ['K'], label: '上一项' },
      { keys: ['↵'], label: '打开选中的文章' },
    ],
  },
  {
    title: '文章',
    items: [
      { keys: ['['], label: '上一篇（更早）' },
      { keys: [']'], label: '下一篇（更新）' },
    ],
  },
];
