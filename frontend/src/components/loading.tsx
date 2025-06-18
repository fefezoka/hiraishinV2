import { mpengu } from '@/assets';
import Image from 'next/image';
import React from 'react';

export const Loading = () => {
  return (
    <div className="flex items-center justify-center flex-col">
      <div className="w-[360px] h-[360px] relative">
        <Image src={mpengu} alt="" fill />
      </div>
      <span className="text-2xl">Carregando...</span>
    </div>
  );
};
