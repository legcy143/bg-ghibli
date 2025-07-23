import { useBgXGhibli } from '@/store/useBgXGhibli';
import { usePaggingStore } from '@/store/usePagging';
import { Button, cn } from '@heroui/react';
import React, { useState } from 'react'

export default function ChooseBackgroundImage() {
    const backgroundEventData = useBgXGhibli((state) => state.backgroundEventData);
    const setSelectedBackgroundImageId = useBgXGhibli((state) => state.setSelectedBackgroundImageId);
    const BackgroundImageId = useBgXGhibli((state) => state.BackgroundImageId);
    const processBgImage = useBgXGhibli((state) => state.processBgImage);
    const nextPage = usePaggingStore((state) => state.nextPage);
    const [isBgProcessLoading, setIsBgProcessLoading] = useState(false);

    const handleContinue = async () => {
        if (BackgroundImageId) {
            setIsBgProcessLoading(true);
            await processBgImage();
            nextPage();
            setIsBgProcessLoading(false);
        }
    }

    return (
        <section className='h-full w-full flex flex-col items-center overflow-y-auto'>
            <h1 className=' p-5 text-4xl font-bold'>Choose Backgorund Image</h1>
            <div className='flex flex-row items-center justify-center flex-wrap gap-4 p-10  w-full max-w-[80rem]'>
                {
                    backgroundEventData?.backgroundImages.map((e) => (
                        <div key={e._id} className={cn("bg-gray-200 p-2 rounded-lg shadow-md mb-4 max-w-[15rem]", BackgroundImageId === e._id ? "border-2 border-blue-500" : "")}
                            onClick={() => setSelectedBackgroundImageId(e._id)}>
                            <img src={e.backgroundImageUrl} alt={"bg-image"} className="w-full h-auto rounded-lg mb-2" />
                        </div>
                    ))
                }
            </div>
            <div className='p-5 flex flex-col items-center gap-2'>
                <Button isLoading={isBgProcessLoading} onPress={handleContinue} color='primary' isDisabled={!BackgroundImageId}>Continue</Button>
                {
                    !BackgroundImageId && (
                        <small>Please choose background image to Continue</small>
                    )
                }
            </div>
        </section>
    )
}
