import type { PropsWithChildren } from 'react';

export function Callout({ children }: PropsWithChildren) {
  return <div className="callout">{children}</div>;
}
