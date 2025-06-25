import { mpengu, penguDab } from '@/assets';
import Image, { StaticImageData } from 'next/image';
import React, { useState } from 'react';

export const Loading = () => {
  const [src] = useState<StaticImageData>(
    [mpengu, penguDab][Math.floor(Math.random() * 2)]
  );

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="w-[360px] h-[360px] relative">
        <Image src={src} alt="" fill />
      </div>
      <span className="text-2xl">Carregando...</span>
    </div>
  );
};
