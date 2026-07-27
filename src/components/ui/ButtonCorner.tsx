import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

const ButtonCorner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercentage = (scrollPosition / totalHeight) * 100;

            setIsVisible(scrollPercentage > 40); 
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed bottom-4 right-4 z-40 bg-[#EF4444] text-white p-4 rounded-full shadow-lg shadow-[#EF4444]/30 hover:bg-[#DC2626] hover:cursor-pointer transition-all duration-300 transform ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
        >
            <FontAwesomeIcon icon={faArrowUp} className="text-xl" />
        </button>
    );
};

export default ButtonCorner;
