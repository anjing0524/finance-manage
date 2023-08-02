'use client';

import { Pagination } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import merge from './mergeSearch';

const CustomPagination = ({ total, page, url = '/root-management' }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  return (
    <Pagination
      count={total}
      page={page}
      onChange={(event, value) => {
        toast(JSON.stringify(value));
        router.push(`${url}?${merge(searchParams, value)}`);
      }}
      showFirstButton
      showLastButton
      siblingCount={1}
      variant="outlined"
      shape="rounded"
    />
  );
};

export default CustomPagination;
