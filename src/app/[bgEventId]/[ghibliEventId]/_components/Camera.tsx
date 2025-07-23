'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
    Button,
    Card,
    CardBody,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from '@heroui/react';
import {
    Camera as CameraIcon,
    RotateCcw,
    ArrowRight,
    Settings,
    Timer,
    Check,
    FlipHorizontal,
} from 'lucide-react';
import { usePaggingStore } from '@/store/usePagging';
import { uploadSingleFile } from '@/utils/upload';
import { useBgXGhibli } from '@/store/useBgXGhibli';

export default function Camera() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerValue, setTimerValue] = useState(0); // default timer value
    const [countdown, setCountdown] = useState(0);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRetaking, setIsRetaking] = useState(false);
    const [isMirrored, setIsMirrored] = useState(true);
    const [isUploadLoading, setIsUploadLoading] = useState(false);
    const [videoDimensions, setVideoDimensions] = useState<{
        width: number;
        height: number;
    } | null>(null);
    // Add state for captured dimensions
    const [capturedDimensions, setCapturedDimensions] = useState<{
        width: number;
        height: number;
    } | null>(null);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const nextPage = usePaggingStore((state) => state.nextPage);
    const setUserImage = useBgXGhibli((state) => state.setUserImage);



    const timerOptions = [
        { value: 0, label: 'Instant', icon: '0' },
        { value: 3, label: '3 seconds', icon: '3' },
        { value: 5, label: '5 seconds', icon: '5' },
        { value: 10, label: '10 seconds', icon: '10' },
    ];

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []); 

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;

            const handleLoadedMetadata = () => {
                if (videoRef.current) {
                    setVideoDimensions({
                        width: videoRef.current.videoWidth,
                        height: videoRef.current.videoHeight,
                    });
                }
            };

            videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

            // Force video to load and play
            videoRef.current.load();
            videoRef.current.play().catch(console.error);

            // Cleanup function
            return () => {
                if (videoRef.current) {
                    videoRef.current.removeEventListener(
                        'loadedmetadata',
                        handleLoadedMetadata,
                    );
                }
            };
        }
    }, [stream]);

    const startCamera = async () => {
        setIsLoading(true);
        setCameraError(null);

        try {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 320 },
                    height: { ideal: 427 },
                    facingMode: 'user',
                    aspectRatio: { ideal: 3 / 4 },
                },
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setCameraError('Unable to access camera. Please check permissions.');
        } finally {
            setIsLoading(false);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if (context) {
            // Get the actual video dimensions
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            // Get the displayed video element dimensions
            const displayWidth = video.clientWidth;
            const displayHeight = video.clientHeight;

            // Calculate the aspect ratios
            const videoAspectRatio = videoWidth / videoHeight;
            const displayAspectRatio = 3 / 4;

            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = videoWidth;
            let sourceHeight = videoHeight;

            if (videoAspectRatio > displayAspectRatio) {
                // Video is wider than display, crop horizontally
                sourceWidth = videoHeight * displayAspectRatio;
                sourceX = (videoWidth - sourceWidth) / 2;
            } else {
                // Video is taller than display, crop vertically
                sourceHeight = videoWidth / displayAspectRatio;
                sourceY = (videoHeight - sourceHeight) / 2;
            }


            // Store captured dimensions
            canvas.width = Math.round(sourceWidth);
            canvas.height = Math.round(sourceHeight);
            setCapturedDimensions({
                width: Math.round(sourceWidth),
                height: Math.round(sourceHeight),
            });

            if (isMirrored) {
                context.save();
                context.scale(-1, 1);
                context.drawImage(
                    video,
                    sourceX,
                    sourceY,
                    sourceWidth,
                    sourceHeight,
                    -sourceWidth,
                    0,
                    sourceWidth,
                    sourceHeight,
                );
                context.restore();
            } else {
                context.drawImage(
                    video,
                    sourceX,
                    sourceY,
                    sourceWidth,
                    sourceHeight,
                    0,
                    0,
                    sourceWidth,
                    sourceHeight,
                );
            }

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        setCapturedBlob(blob);
                        const imageUrl = URL.createObjectURL(blob);
                        setCapturedImage(imageUrl);
                    }
                },
                'image/jpeg',
                0.8,
            );
        }
    };

    const startTimerCapture = () => {
        setIsTimerActive(true);
        setCountdown(timerValue);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsTimerActive(false);
                    capturePhoto();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const retakePhoto = async () => {
        setIsRetaking(true);
        setCapturedImage(null);
        setCapturedBlob(null);

        if (capturedImage) {
            URL.revokeObjectURL(capturedImage);
        }

        try {
            await startCamera();
        } catch (error) {
            console.error('Error restarting camera:', error);
        } finally {
            setIsRetaking(false);
        }
    };

    const handleNextPage = async () => {
        if (!capturedBlob) {
            console.log('No captured image to upload.');
            return;
        }
        try {
            setIsUploadLoading(true);
            const file = new File([capturedBlob], 'captured-photo.jpg', {
                type: 'image/jpeg',
            });
            let image = await uploadSingleFile(file);
            console.log('Image uploaded successfully:', image);
            setUserImage(image);

            if (stream) {
                console.log('Stopping camera stream...');
                stream.getTracks().forEach((track) => track.stop());
            }

            if (capturedImage) {
                URL.revokeObjectURL(capturedImage);
            }
            nextPage();
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploadLoading(false);
        }
    }

    if (cameraError) {
        return (
            <div className="container mx-auto px-4 max-w-2xl w-full">
                <div className="p-12 text-center">
                    <Card className="shadow-2xl bg-white/95 backdrop-blur-sm">
                        <CardBody className="p-8">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CameraIcon className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Camera Access Required
                                </h3>
                                <p className="text-red-500 text-base mb-4">{cameraError}</p>
                            </div>
                            <Button
                                color="primary"
                                className="bg-black text-white font-semibold hover:bg-gray-800"
                                size="lg"
                                onPress={startCamera}
                            >
                                Try Again
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 max-w-4xl w-full">
            <div className="p-3">
                {/* Header with Settings */}
                <div className="mb-4">
                    <div className="flex justify-end items-center mb-2">
                        {!capturedImage && (
                            <Button
                                isIconOnly
                                variant="bordered"
                                onPress={onOpen}
                                className="border-2 border-gray-600 hover:border-black"
                            >
                                <Settings size={20} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Camera/Preview Section */}
                <div className="mb-8">
                    <div
                        className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-sm border-4 border-gray-200"
                        style={{ aspectRatio: '3/4', width: '320px', height: '427px' }}
                    >
                        {(isLoading || isRetaking) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
                                <div className="text-center text-white">
                                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
                                    <p className="text-lg font-medium">
                                        {isRetaking
                                            ? 'Restarting camera...'
                                            : 'Preparing your camera...'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {isTimerActive && countdown > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                                <div className="text-center text-white">
                                    <div className="text-8xl font-bold mb-6">{countdown}</div>
                                    <p className="text-2xl font-medium">Get ready...</p>
                                </div>
                            </div>
                        )}

                        {capturedImage ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={capturedImage}
                                    alt="Your Amazing Photo"
                                    className="w-full h-full object-cover"
                                />
                                {capturedDimensions && (
                                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                                        {capturedDimensions.width} × {capturedDimensions.height}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                    style={{
                                        transform: isMirrored ? 'scaleX(-1)' : 'none',
                                    }}
                                />
                                {/* Display actual camera dimensions */}
                                {videoDimensions && (
                                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                                        {videoDimensions.width} × {videoDimensions.height}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!capturedImage && (
                        <div className="text-center mt-2">
                            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                                <CameraIcon size={16} className="text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    {videoDimensions
                                        ? `Camera: ${videoDimensions.width} × ${videoDimensions.height} (${((videoDimensions.width * videoDimensions.height) / 1000000).toFixed(1)}MP)`
                                        : 'Loading camera...'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Captured Image Dimensions Display */}
                    {capturedImage && capturedDimensions && (
                        <div className="text-center mt-2">
                            <div className="inline-flex items-center gap-2 bg-green-100 rounded-lg px-3 py-2">
                                <CameraIcon size={16} className="text-green-600" />
                                <span className="text-sm font-medium text-green-700">
                                    Captured: {capturedDimensions.width} ×{' '}
                                    {capturedDimensions.height} (
                                    {(
                                        (capturedDimensions.width * capturedDimensions.height) /
                                        1000000
                                    ).toFixed(2)}
                                    MP)
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-center gap-3">


                    <div className="flex justify-center gap-4">
                        {capturedImage ? (
                            <>
                                <Button
                                    variant="bordered"
                                    startContent={<RotateCcw size={20} />}
                                    onPress={retakePhoto}
                                    isLoading={isRetaking}
                                    size="lg"
                                    className="px-8 border-2 border-gray-600 text-gray-800 font-semibold hover:border-black hover:bg-gray-50"
                                >
                                    {isRetaking ? 'Restarting...' : 'Retake Photo'}
                                </Button>
                                <Button
                                    color="primary"
                                    endContent={<ArrowRight size={20} />}
                                    onPress={handleNextPage}
                                    isLoading={isUploadLoading}
                                    size="lg"
                                    className="px-8 bg-black text-white font-semibold hover:bg-gray-800"
                                >
                                    Continue
                                </Button>
                            </>
                        ) : (
                            <Button
                                isIconOnly
                                onPress={timerValue > 0 ? startTimerCapture : capturePhoto}
                                isDisabled={isTimerActive || isLoading}
                                size="lg"
                                className="w-20 h-20 bg-black text-white hover:bg-gray-800 disabled:opacity-50 rounded-full"
                            >
                                <CameraIcon size={32} />
                            </Button>
                        )}
                    </div>
                </div>

                <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Camera Settings
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Customize your photo experience
                                    </p>
                                </ModalHeader>
                                <ModalBody>
                                    <div className="space-y-6">
                                        {/* Mirror Toggle Section */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <FlipHorizontal size={20} />
                                                Camera View
                                                <span className="text-sm font-normal text-gray-500">
                                                    (Currently: {isMirrored ? 'Mirrored' : 'Normal'})
                                                </span>
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setIsMirrored(true)}
                                                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${isMirrored
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-400 text-gray-700'
                                                        }`}
                                                >
                                                    <div className="text-2xl mb-2">🪞</div>
                                                    <div className="font-medium">Mirrored</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Like a mirror
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => setIsMirrored(false)}
                                                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${!isMirrored
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-400 text-gray-700'
                                                        }`}
                                                >
                                                    <div className="text-2xl mb-2">📷</div>
                                                    <div className="font-medium">Normal</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Camera view
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Camera Dimensions Section */}
                                        {videoDimensions && (
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                    <CameraIcon size={20} />
                                                    Camera Details
                                                </h4>
                                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Resolution:</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {videoDimensions.width} × {videoDimensions.height}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Aspect Ratio:</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {(
                                                                videoDimensions.width / videoDimensions.height
                                                            ).toFixed(2)}
                                                            :1
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Total Pixels:</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {(
                                                                (videoDimensions.width *
                                                                    videoDimensions.height) /
                                                                1000000
                                                            ).toFixed(1)}
                                                            MP
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Timer Section */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <Timer size={20} />
                                                Timer Options
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {timerOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => setTimerValue(option.value)}
                                                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${timerValue === option.value
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                            : 'border-gray-200 hover:border-gray-400 text-gray-700'
                                                            }`}
                                                    >
                                                        <div className="text-2xl mb-2">{option.icon}</div>
                                                        <div className="font-medium">{option.label}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color="primary"
                                        onPress={onClose}
                                        className="bg-black text-white font-semibold hover:bg-gray-800"
                                    >
                                        Apply Settings
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
}
