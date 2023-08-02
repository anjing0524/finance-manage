'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from './Button';
import { toast } from 'react-hot-toast';

/**
 * NextJS does not allow to pass function from server -> client components,
 * hence this unreusable component.
 */

const SignOutButton = ({}) => {
  const [isLoading, setIsLoading] = useState(false);

  const signUserOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      toast.error('some errors happend,please wait a time.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={signUserOut} isLoading={isLoading}>
      Sign out
    </Button>
  );
};

export default SignOutButton;
