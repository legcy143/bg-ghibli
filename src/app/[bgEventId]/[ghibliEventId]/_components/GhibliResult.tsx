import { useBgXGhibli } from '@/store/useBgXGhibli';
import { usePaggingStore } from '@/store/usePagging';
import { API_URL } from '@/utils/constant';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { io } from 'socket.io-client';
import ImageActions from './ImageActions';
import Stepper, { Step } from './Stepper';


const GhibliSocketurl = `${API_URL}/ghibli-photo-booth`;
const socket = io(GhibliSocketurl, {
    transports: ['websocket', 'polling'],
});

export default function GhibliResult() {

    const ghibliImage = useBgXGhibli((state) => state.ghibliImage) ;
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

    const steps: Step[] = [
        { label: 'Image captured', status: 'done' },
        { label: 'Removing background', status: 'done' },
        { label: 'Converting to Ghibli image', status: ghibliImage ? 'done' : 'active' },
    ];

    return (
        <div className="h-full grid place-items-center-safe p-5 gap-8 overflow-y-auto">
            {
                ghibliImage ? (
                    <div className='flex flex-col items-center justify-center gap-4 max-w-[20rem] p-2'>
                        <img src={ghibliImage} alt="Ghibli Result" className='w-full h-full rounded-lg shadow-md' />
                        <ImageActions imageUrl={ghibliImage} />
                    </div>
                ) : (
                    <div className="w-full max-w-lg mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Processing your image</h2>
                        <Stepper steps={steps} />
                    </div>
                )
            }

        </div>
    );
}
