'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Lock, MailIcon } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import * as yup from 'yup';
import { Button } from './Button';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const UserLoginForm = async () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const signInWithPassword = async (data) => {
    setLoading(true);
    try {
      await signIn('credentials', {
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      toast.error('some things wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit(signInWithPassword)}>
      <div className="relative mb-4 flex flex-col items-center">
        <label htmlFor="email" className="sr-only">
          邮箱
        </label>
        <input
          type="email"
          id="email"
          className="w-full rounded border border-gray-300 px-4 py-2 pl-8"
          placeholder="请输入邮箱"
          {...register('email')}
        />
        <MailIcon
          size={16}
          className="absolute left-2 top-3 hover:text-indigo-500 "
        />
        {errors.email && (
          <p className="w-full text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="relative mb-4 flex flex-col items-center">
        <label htmlFor="password" className="sr-only">
          密码
        </label>
        <input
          type="password"
          id="password"
          className="w-full rounded border border-gray-300 px-4 py-2 pl-8"
          placeholder="请输入密码"
          autoComplete="off"
          {...register('password')}
        />
        <Lock
          size={16}
          className="absolute left-2 top-3 hover:text-indigo-500"
        />
        {errors.password && (
          <p className="w-full text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        isLoading={loading}
        disabled={loading}
        className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        登录
      </Button>
    </form>
  );
};
