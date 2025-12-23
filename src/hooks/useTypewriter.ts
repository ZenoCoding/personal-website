import { useState, useEffect } from 'react';

export const useTypewriter = (textArray: string[], typingSpeed = 150, deletingSpeed = 100, pauseDuration = 2000) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeedState, setTypingSpeedState] = useState(typingSpeed);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const handleType = () => {
            const i = loopNum % textArray.length;
            const fullText = textArray[i];

            setDisplayedText(
                isDeleting
                    ? fullText.substring(0, displayedText.length - 1)
                    : fullText.substring(0, displayedText.length + 1)
            );

            setTypingSpeedState(isDeleting ? deletingSpeed : typingSpeed);

            if (!isDeleting && displayedText === fullText) {
                setTimeout(() => setIsDeleting(true), pauseDuration);
            } else if (isDeleting && displayedText === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
                setTypingSpeedState(500);
            }
        };

        timer = setTimeout(handleType, typingSpeedState);

        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, loopNum, typingSpeedState, textArray, typingSpeed, deletingSpeed, pauseDuration]);

    return displayedText;
};
