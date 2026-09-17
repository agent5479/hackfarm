import {
  useEffect,
  useRef,
  type ElementType,
  type FormEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { useCms } from './ContentProvider';
import type { CmsDocId } from './docs';
import { getContentPath } from './merge';

type EditableTextProps = {
  path: string;
  doc?: CmsDocId;
  as?: ElementType;
  className?: string;
  quote?: boolean;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'contentEditable' | 'onInput' | 'suppressContentEditableWarning'>;

export default function EditableText({
  path,
  doc = 'home',
  as: Tag = 'p',
  className,
  quote = false,
  ...rest
}: EditableTextProps) {
  const { getDoc, isEditor, setField } = useCms();
  const root = getDoc(doc);
  const value = getContentPath(root, path);
  const display = quote ? `"${value}"` : value;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isEditor || !ref.current) return;
    if (document.activeElement === ref.current) return;
    if (ref.current.textContent !== display) {
      ref.current.textContent = display;
    }
  }, [display, isEditor]);

  if (!isEditor) {
    return (
      <Tag className={className} {...rest}>
        {display}
      </Tag>
    );
  }

  return (
    <Tag
      {...rest}
      ref={ref}
      className={[className, 'cms-editable'].filter(Boolean).join(' ')}
      contentEditable
      suppressContentEditableWarning
      data-cms-doc={doc}
      data-cms-path={path}
      onInput={(e: FormEvent<HTMLElement>) => {
        let next = e.currentTarget.textContent ?? '';
        if (quote) {
          next = next.replace(/^["“]|["”]$/g, '').trim();
        }
        setField(doc, path, next);
      }}
      onClick={(e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        rest.onClick?.(e);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' && Tag !== 'textarea') {
          e.preventDefault();
        }
        rest.onKeyDown?.(e);
      }}
    >
      {display}
    </Tag>
  );
}
