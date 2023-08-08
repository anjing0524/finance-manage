'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from './Button';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

const SignInButton = ({ ...props }) => {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signIn('github');
    } catch (error) {
      toast.error('Failed with Github');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={signInWithGoogle} isLoading={isLoading} {...props}>
      <GitHubLogoIcon className="mr-4" />
      Sign In with Github
    </Button>
  );
};

export default SignInButton;
