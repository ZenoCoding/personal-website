import PhotosClient from './PhotosClient';

export const metadata = {
    title: "Through the Lens | Tycho Young",
    description: "A collection of photos by Tycho Young from robotics competitions, late-night coding sessions, and everything in between.",
};

export default function PhotosPage() {
    return <PhotosClient />;
}
