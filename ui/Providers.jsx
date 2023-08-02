'use client';

import { Toaster } from 'react-hot-toast';

import { SessionProvider } from 'next-auth/react';
import StyledComponentsRegistry from './AntdRegistry';

/**
 * 提供一个弹出窗口
 * @param {import('react').ReactNode} children
 * @returns
 */
const Providers = ({ children }) => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <SessionProvider>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </SessionProvider>
    </>
  );
};

export default Providers;
