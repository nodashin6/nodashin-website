import React, {type ReactNode, useState} from 'react';
import clsx from 'clsx';
import type {Props} from '@theme/Footer/Layout';


export default function FooterLayout({
  style,
  links,
  logo,
  copyright,
}: Props): ReactNode {
  const [hideCharacter, setHideCharacter] = useState(false);
  const handleClick = () => {
    setHideCharacter(!hideCharacter);
  };
  return (
    <footer
      className={clsx('footer', {
        'footer--dark': style === 'dark',
      }, "h-16 flex justify-center overflow-hidden")}
      style={{
        color: 'var(--ifm-color-emphasis-500)',
        
      }}
    >
      {(logo || copyright) && (
        <div className="text-center">
          {copyright}
        </div>
      )}
      <div className={`
        absolute h-32 w-full flex justify-end items-center -translate-y-1/4 overflow-y-hidden
      `}>
        <img 
          src="/img/purple-python-with-cap.png" 
          alt="Character" 
          className={`
            h-32 w-32 cursor-pointer duration-300 transition-transform
            ${hideCharacter ? 'translate-y-[70%]' : 'translate-y-[15%]'}
          `}
          onClick={handleClick}
        />
      </div>
    </footer>
  );
}
