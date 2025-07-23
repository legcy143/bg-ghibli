import { useBgXGhibli } from '@/store/useBgXGhibli';
import { usePaggingStore } from '@/store/usePagging';
import { API_URL } from '@/utils/constant';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'
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
    <div>
      FinalOutput : {bgtaskId}
      {
        BgOutputImage && (
          <div className='flex flex-col items-center justify-center gap-4'>
            <img src={BgOutputImage} alt='Background Output size-[5rem]' className='max-w-full h-auto' />
          </div>
        )
      }
    </div>
  )
}
