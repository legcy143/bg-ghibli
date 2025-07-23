import { useBgXGhibli } from '@/store/useBgXGhibli';
import { usePaggingStore } from '@/store/usePagging';
import { API_URL } from '@/utils/constant';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { io } from 'socket.io-client';


const GhibliSocketurl = `${API_URL}/ghibli-photo-booth`;
const socket = io(GhibliSocketurl, {
    transports: ['websocket', 'polling'],
});

export default function GhibliResult() {

    const ghibliImage = useBgXGhibli((state) => state.ghibliImage);
    const setGhibliImage = useBgXGhibli((state) => state.setGhibliImage);
    const ghibliTaskId = useBgXGhibli((state) => state.ghibliTaskId);
    const isGhibliImageProcessing = useBgXGhibli((state) => state.isGhibliImageProcessing);


    useEffect(() => {
        if (ghibliTaskId && !ghibliImage) {
            console.log('Subscribing to ghbili taskId:', ghibliTaskId, socket);
            socket.on(ghibliTaskId, (msg: { result_image: string }) => {
                console.log('response from socket for ghibli ', msg);
                setGhibliImage(msg.result_image);
            });
        }

        return () => {
            if (ghibliTaskId) {
                console.log('Unsubscribing from taskId:', ghibliTaskId, socket);
                socket.off(ghibliTaskId);
            }
        };

    }, [ghibliTaskId, ghibliImage]);
    return (
        <div>
            {
                ghibliImage ?(
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <h1 className='text-2xl font-bold'>Final Output</h1>
                        <img src={ghibliImage} alt="Ghibli Result" className='w-full max-w-[80rem] rounded-lg shadow-md' />
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <h1 className='text-2xl font-bold'>Processing Ghibli Image...</h1>
                        {isGhibliImageProcessing && <p>Please wait, your image is being processed.</p>}
                    </div>
                )
            }
        </div>
    )
}
