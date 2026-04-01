import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PageMeta {
  name?: string;
  title?: string;
  layout?: string;
}

interface PageMetaContextValue {
  meta: PageMeta;
  setMeta: (_meta: PageMeta) => void;
}

const PageMetaContext = createContext<PageMetaContextValue | undefined>(undefined);

export const PageMetaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [meta, setMeta] = useState<PageMeta>({});
  return <PageMetaContext.Provider value={{ meta, setMeta }}>{children}</PageMetaContext.Provider>;
};

export const usePageMetaContext = () => {
  const context = useContext(PageMetaContext);
  if (!context) {
    throw new Error('usePageMetaContext must be used within a PageMetaProvider');
  }
  return context;
};
