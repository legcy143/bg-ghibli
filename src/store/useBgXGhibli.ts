import { BackgroundReplacerEventData } from '@/types/BackgroundReplacer';
import api from '@/utils/api';
import { create } from 'zustand';

interface BgXGhibliState {
    fetchBackgroundEventData: (_id: string) => Promise<void>;
    isFetchBackgroundEventLoading: boolean;
    backgroundEventData: BackgroundReplacerEventData | null;
    userImage: string | null;
    setUserImage: (image: string | null) => void;
    resetUserImage: () => void;
    BgOutputImage: string | null;
    setBgOutputImage: (image: string | null) => void;
    BackgroundImageId: string | null;
    setSelectedBackgroundImageId: (id: string | null) => void;
    ghibliImage: string | null;
    setGhibliImage: (image: string | null) => void;

    processBgImage: () => Promise<void>;
    processGhibliImage: (image: string, ghibiliEventId: string) => Promise<void>;

    bgTaskId: string | null;
    setBgTaskId: (taskId: string | null) => void;

    ghibliTaskId: string | null;
    setGhibliTaskId: (taskId: string | null) => void;

    isGhibliImageProcessing: boolean;
}

export const useBgXGhibli = create<BgXGhibliState>((set) => ({
    isFetchBackgroundEventLoading: true,
    backgroundEventData: null,
    fetchBackgroundEventData: async (_id) => {
        set({ isFetchBackgroundEventLoading: true });
        try {
            const response = await api.get(`/background-remove-booth/${_id}`);
            set({ backgroundEventData: response.data.data });
        } catch (error) {
            console.error('Error fetching background event data:', error);
            set({ backgroundEventData: null });
        } finally {
            set({ isFetchBackgroundEventLoading: false });
        }
    },



    processBgImage: async () => {
        try {
            let userImage = useBgXGhibli.getState().userImage;
            const backgroundImageId = useBgXGhibli.getState().BackgroundImageId
            const response = await api.post('/background-remove-booth/generate', {
                backgroundImageId,
                eventId: useBgXGhibli.getState().backgroundEventData?._id,
                templateId: "",
                userImage,
                userName: "",
            });
            set({ bgTaskId: response.data.data.task_id });
        } catch (error) {
            console.error('Error processing background image:', error);
        }
    },

    isGhibliImageProcessing:false,
    processGhibliImage: async (image, ghibiliEventId) => {
        try {
            set({ isGhibliImageProcessing: true });
            const response = await api.post('/ghibli-photo-booth/processImage',
                {
                    eventId: ghibiliEventId,
                    userImage: image,
                }
            );
            set({ ghibliTaskId: response.data.data.task_id });
        } catch (error) {
            console.error('Error processing final image:', error);
        }
        finally{
            set({ isGhibliImageProcessing: false });
        }
    },

    BackgroundImageId: null,
    setSelectedBackgroundImageId: (id) => {
        set({ BackgroundImageId: id });
    },
    userImage: null,
    setUserImage: (image) => {
        set({ userImage: image });
    },
    resetUserImage: () => {
        set({ userImage: null });
    },
    BgOutputImage: null,
    setBgOutputImage: (image) => {
        set({ BgOutputImage: image });
    },
    ghibliImage: null,
    setGhibliImage: (image) => {
        set({ ghibliImage: image });
    },

    bgTaskId: null,
    setBgTaskId: (taskId) => {
        set({ bgTaskId: taskId });
    },

    ghibliTaskId: null,
    setGhibliTaskId: (taskId) => {
        set({ ghibliTaskId: taskId });
    }

}));