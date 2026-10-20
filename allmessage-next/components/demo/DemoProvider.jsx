'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import DemoModal from './DemoModal';

// Fallback target when JavaScript is unavailable.
const DEMO_URL = 'https://allmessage.chat/richiedi-demo';
const DemoContext = createContext({ open: () => {} });

export function DemoProvider({ children }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => {
    setOpen(false);
    if (location.hash === '#richiedi-demo') history.replaceState(null, '', location.pathname + location.search);
  }, []);

  // Links to /#richiedi-demo open the form straight away.
  useEffect(() => { if (location.hash === '#richiedi-demo') setOpen(true); }, []);

  const value = useMemo(() => ({ open }), [open]);
  return (
    <DemoContext.Provider value={value}>
      {children}
      <DemoModal open={isOpen} onClose={close} />
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}

// Any "Richiedi Demo" / "Contattaci" link: opens the form instead of navigating.
export function DemoLink({ onClick, children, ...props }) {
  const { open } = useDemo();
  return (
    <a
      href={DEMO_URL}
      {...props}
      onClick={e => { e.preventDefault(); onClick?.(e); open(); }}
    >
      {children}
    </a>
  );
}
