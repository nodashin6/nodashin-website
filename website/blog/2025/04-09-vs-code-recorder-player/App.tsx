"use client";

import React, { useState, useEffect } from 'react';
import CodeBlock from '@theme/CodeBlock';


type Line = {
  id: number;
  time: number;
  file: string;
  rangeOffset: number;
  rangeLength: number;
  text: string;
  language: string;
  action: string;
}


const buildLines = (csvData: string): Line[] => {
  const lines: Line[] = [];
  
  csvData.split('\n').forEach((line, index) => {
    if (index === 0) return; // Skip header line
    
    // 最後の2つのカラム(language, type)を取得するため、最後からスプリット
    const parts = line.split(',');
    if (parts.length < 6) return; // 不正なデータをスキップ
    
    const action = parts.pop() || '';
    const language = parts.pop() || '';
    
    // 残りの部分を取り出す
    const id = parseInt(parts[0]) || 0;
    const time = parseInt(parts[1]) || 0;
    const file = parts[2] || '';
    const rangeOffset = parseInt(parts[3]) || 0;
    const rangeLength = parseInt(parts[4]) || 0;
    
    let text = parts.slice(5).join(',').slice(1, -1).replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    if (text === `""`) {
      text = `"`;
    }
    
    lines.push({
      id: index,
      time,
      file,
      rangeOffset,
      rangeLength,
      text,
      language,
      action
    });
  });
  
  return lines;
}

const applySignleLine = (prevCode: string, line: Line): string => {
  const { rangeOffset, rangeLength, text, action } = line;
  if (action === 'tab') {
    return text;
  } else {
    const start = prevCode.slice(0, rangeOffset);
    const end = prevCode.slice(rangeOffset + rangeLength);
    return `${start}${text}${end}`;
  }
}

const applyMultiLine = (prevCode: string, lines: Line[]): string => {
  let code = prevCode;
  lines.forEach((line) => {
    code = applySignleLine(code, line);
  });
  return code;
}

export const App = () => {
  const [csvData, setCsvData] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [code, setCode] = useState<string>("");
  const [renderedCode, setRenderedCode] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [currenctTime, setCurrentTime] = useState<any>({minutes: 0, seconds: 0});

  useEffect(() => {
    fetch('/csv/source.csv')
      .then((response) => response.text())
      .then((data) => setCsvData(data))
      .catch((error) => console.error('Error loading CSV:', error));
  }, []);

  useEffect(() => {
    if (csvData) {
      const parsedLines = buildLines(csvData);
      setLines(parsedLines);
    }
  }, [csvData]) // 依存配列を追加

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(500); // ミリ秒単位

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  }

  const changeSpeed = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying && targetIndex < lines.length) {
      timer = setTimeout(() => {
        setTargetIndex(prevIndex => prevIndex + 1);
      }, playbackSpeed);
    } else if (isPlaying && targetIndex >= lines.length) {
      // 最後まで再生したら停止
      setIsPlaying(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, targetIndex, lines.length, playbackSpeed]);

  const onClickPrev = () => {
    if (targetIndex > 0) {
      setTargetIndex(targetIndex - 1);
    }
  }

  const onClickNext = () => {
    if (targetIndex < lines.length) {
      setTargetIndex(targetIndex + 1);
    }
  }

  useEffect(() => {
    let this_index = currentIndex
    let this_code = code
    if (this_index < targetIndex) {
      while (this_index < targetIndex) {
        const line = lines[this_index];
        this_code = applySignleLine(this_code, line);
        this_index++;
      }
      setCurrentIndex(this_index);
      setCode(this_code);
    } else if (this_index > targetIndex) {
      this_index= 0;
      this_code = "";
      while (this_index < targetIndex) {
        const line = lines[this_index];
        this_code = applySignleLine(this_code, line);
        this_index++;
      }
      setCurrentIndex(this_index);
      setCode(this_code);
    }
    if (this_index == 0) {
      setCurrentTime({minutes: 0, seconds: 0});
    } else {
      const time = lines[this_index - 1].time / 1000;
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      setCurrentTime({minutes, seconds});
    }
  
  }, [targetIndex])

  useEffect(() => {
    let newCode = code;
    newCode = newCode.replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    setRenderedCode(newCode)
  }, [code])

  return (
    <div className="flex flex-col gap-y-4 w-full h-full">
      <div className='w-full h-12'>
        VSCode レコーダープレーヤー
      </div>
      <div className="flex gap-2 items-center">
        <button onClick={onClickPrev} className="bg-blue-500 text-white px-4 py-2 rounded">
          {`<--`}
        </button>
        
        <button 
          onClick={togglePlayback} 
          className={`${isPlaying ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded`}
        >
          {isPlaying ? '停止' : '再生'}
        </button>
        
        <button onClick={onClickNext} className="bg-blue-500 text-white px-4 py-2 rounded">
          {`-->`}
        </button>
        
        <div className="ml-4 flex gap-2 items-center">
          <span>速度:</span>
          <button onClick={() => changeSpeed(640)} className="bg-gray-300 px-2 py-1 rounded">遅い</button>
          <button onClick={() => changeSpeed(160)} className="bg-gray-300 px-2 py-1 rounded">普通</button>
          <button onClick={() => changeSpeed(40)} className="bg-gray-300 px-2 py-1 rounded">速い</button>
        </div>
      </div>
      <div className="flex flex-col gap-1 w-full min-h-64">

        <p>Coding Time: {String(currenctTime?.minutes || 0).padStart(2, '0')}:{String(currenctTime?.seconds || 0).padStart(2, '0')}</p>
        <CodeBlock language="python">
          {renderedCode}
        </CodeBlock>
      </div>
    </div>
  )
}