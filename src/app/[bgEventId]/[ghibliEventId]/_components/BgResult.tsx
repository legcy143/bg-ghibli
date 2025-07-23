import { useBgXGhibli } from '@/store/useBgXGhibli';
import { usePaggingStore } from '@/store/usePagging';
import { API_URL } from '@/utils/constant';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'
import Stepper, { Step } from './Stepper';
import { io } from 'socket.io-client';

const url = `${API_URL}`;
const socket = io(url, {
  transports: ['websocket', 'polling'],
});



export default function BgResult() {
  const bgtaskId = useBgXGhibli((state) => state.bgTaskId);
  const setBgOutputImage = useBgXGhibli((state) => state.setBgOutputImage);
  const BgOutputImage = useBgXGhibli((state) => state.BgOutputImage);
  const processGhibliImage = useBgXGhibli((state) => state.processGhibliImage);
  const ghibliTaskId = useBgXGhibli((state) => state.ghibliTaskId);
  const isGhibliImageProcessing = useBgXGhibli((state) => state.isGhibliImageProcessing);

  const nextPage = usePaggingStore((state) => state.nextPage);
  const ghibliEventId = useParams().ghibliEventId as string;

  useEffect(() => {
    if (bgtaskId && !BgOutputImage) {
      console.log('Subscribing to taskId:', bgtaskId, socket);
      socket.on(bgtaskId, (msg: { final_image: string }) => {
        console.log('response from socket for bg', msg);
        setBgOutputImage(msg.final_image);
        if (!isGhibliImageProcessing && !ghibliTaskId) {
          processGhibliImage(msg.final_image, ghibliEventId);
        }
        nextPage()
      });
    }

    return () => {
      if (bgtaskId) {
        console.log('Unsubscribing from taskId:', bgtaskId, socket);
        socket.off(bgtaskId);
      }
    };
  }, [bgtaskId]);




  return (
    <div className="flex flex-col items-center justify-center h-[60vh] w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Processing your image</h2>
        <div className="flex flex-col gap-6 items-center">
          <Stepper
            steps={[
              { label: 'Image captured', status: 'done' },
              { label: 'Removing background', status: BgOutputImage ? 'done' : 'active' },
              { label: 'Converting to Ghibli image', status: BgOutputImage ? 'active' : 'pending' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
