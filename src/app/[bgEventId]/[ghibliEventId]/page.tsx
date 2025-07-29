"use client"
import React, { useEffect } from 'react'
import Camera from './_components/Camera';
import { usePaggingStore } from '@/store/usePagging';
import ChooseBackgroundImage from './_components/ChooseBackgroundImage';
import { useParams, useSearchParams } from 'next/navigation';
import { useBgXGhibli } from '@/store/useBgXGhibli';
import GhibliResult from './_components/GhibliResult';
import BgResult from './_components/BgResult';
const pages = [
    <Camera />,
    <ChooseBackgroundImage />,
    <BgResult />,
    <GhibliResult />,
]

export default function page() {

    const currentPage = usePaggingStore((state) => state.currentPage);
    const fetchBackgroundEventData = useBgXGhibli((state) => state.fetchBackgroundEventData);
    const backgroundEventData = useBgXGhibli((state) => state.backgroundEventData);
    const isFetchBackgroundEventLoading = useBgXGhibli((state) => state.isFetchBackgroundEventLoading);

    let bgEventId = useParams().bgEventId as string;
    let ghibliEventId = useParams().ghibliEventId as string;

    useEffect(() => {
        fetchBackgroundEventData(bgEventId)
    }, [])

    if (isFetchBackgroundEventLoading) {
        return (
            <section className="h-[100dvh] w-full flex flex-col items-center justify-center bg-white/80">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-lg font-semibold text-gray-700">Loading, please wait...</p>
                </div>
            </section>
        );
    }

    if (!backgroundEventData) {
        return (
            <section className="h-[100dvh] w-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Event not found</h2>
                    <p className="text-gray-600">Please check the event ID or try again later.</p>
                </div>
            </section>
        );
    }



    return (
        <section className='h-[100dvh] w-full flex items-center justify-center'>
            {backgroundEventData?.background && <img src={backgroundEventData.background} alt="Background" className="fixed -z-1 w-full h-full object-cover rounded-lg mb-2" />}
            {pages[currentPage]}
        </section>
    );
}
