import React from 'react';

export const PracticeContent = () => {
  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">Box 1</div>
          <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg">Box 2</div>
          <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">Box 3</div>
        </div>
        <div className="w-full h-[200px] grid grid-cols-3 gap-4 p-2 bg-gray-500 rounded-lg shadow-lg">
          <div className="bg-gray-600 flex items-center justify-center text-white p-4 rounded-lg shadow-lg">
            Grid Item1
          </div>
          <div className="bg-gray-600 flex items-center justify-center text-white p-4 rounded-lg shadow-lg">
            Grid Item2
          </div>
          <div className="bg-gray-600 flex items-center justify-center text-white p-4 rounded-lg shadow-lg">
            Grid Item3
          </div>
        </div>
      </div>
    </div>
  )
}