import TopBar from './TopBar';

import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <TopBar />
      <main>{children}</main>
      {/* Footer si nécessaire */}
    </>
  );
};

export default Layout;
