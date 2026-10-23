'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { shortcutGroups } from '@/config/shortcuts';
import { useModKeyLabel } from '@/hooks/use-mod-key';
import './index.css';

export default function ShortcutHelp({ open, onOpenChange }) {
  const modKey = useModKeyLabel();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="shortcut-help-overlay" />
        <Dialog.Content className="shortcut-help" aria-describedby={undefined}>
          <header className="shortcut-help-header">
            <Dialog.Title className="shortcut-help-title">键盘快捷键</Dialog.Title>
            <Dialog.Close className="shortcut-help-close" aria-label="关闭">
              <kbd>Esc</kbd>
            </Dialog.Close>
          </header>

          <div className="shortcut-help-body">
            {shortcutGroups.map((group) => (
              <section key={group.title} className="shortcut-help-group">
                <h3 className="shortcut-help-group-title meta">{group.title}</h3>
                <dl>
                  {group.items.map((item) => (
                    <div key={item.label + item.keys.join()} className="shortcut-help-row">
                      <dt>{item.label}</dt>
                      <dd>
                        {item.keys.map((key) => (
                          <kbd key={key}>{key === 'mod' ? modKey : key}</kbd>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
