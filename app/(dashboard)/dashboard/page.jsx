import LargeHeading from '@/ui/LargeHeading';
import DrawTest from '@/ui/main-page/DrawTest';

export default function Page({}) {
  return (
    <div className="container mx-auto w-full ">
      <div className="flex w-full justify-center">
        <LargeHeading size="md" className="mt-2">
          主页界面
        </LargeHeading>
      </div>
      <div className="w-full pt-2">
        <DrawTest />
      </div>
    </div>
  );
}
