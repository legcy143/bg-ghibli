import { Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@heroui/react';
import React from 'react';
import { Download, QrCode, Share2, Plus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ImageActions({ imageUrl }: { imageUrl: string }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'ghibli-image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Ghibli Image',
                    url: imageUrl,
                });
            } catch (err) {
                alert('Share cancelled or failed.');
            }
        } else {
            alert('Web Share API not supported.');
        }
    };

    // New image (reload page)
    const handleNewImage = () => {
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex  gap-3 flex-col">
                <div className='flex gap-3'>
                    <Button color="primary" startContent={<QrCode size={18} />} onPress={onOpen} className="font-semibold">
                        QR
                    </Button>
                    <Button color="primary" startContent={<Share2 size={18} />} onPress={handleShare} className="font-semibold">
                        Share
                    </Button>
                </div>
                <Button color="primary" startContent={<Download size={18} />} onPress={handleDownload} className="font-semibold">
                    Download
                </Button>
                <Button color="danger" variant='flat' onPress={handleNewImage} className="font-semibold">
                    Regenrate
                </Button>
            </div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
                <ModalContent>
                    <ModalHeader>QR Code</ModalHeader>
                    <ModalBody className="flex flex-col items-center justify-center">
                        <QRCodeSVG value={imageUrl} size={180} />
                        <p className="mt-4 text-gray-600 text-sm">Scan to view or share the image</p>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}
