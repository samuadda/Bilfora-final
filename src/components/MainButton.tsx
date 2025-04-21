import React from "react";
import { cn } from "@/lib/utils"; // Or use clsx if you prefer

interface MainButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    bgColor?: string;
    textColor?: string;
    shadowColor?: string;
    className?: string;
}

const MainButton: React.FC<MainButtonProps> = ({
    text = "هات العلم",
    rightIcon = (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transition-all duration-300 group-hover:-translate-x-1 rotate-180">
            <path d="M12 4L10.6 5.4L16.2 11H4V13H16.2L10.6 18.6L12 20L20 12L12 4Z" />
        </svg>
    ),
    bgColor = "bg-zinc-900",
    textColor = "text-amber-300",
    shadowColor = "rgba(251,191,36", // Tailwind amber-400 base
    className,
    ...props
}) => {
    return (
        <button
            className={cn(
                "group relative px-6 py-2 rounded-4xl font-bold border-b-4 transition-all duration-300 ease-in-out shadow-[0_10px_20px_var(--shadow)] hover:shadow-[0_15px_30px_var(--shadow-deep)] active:translate-y-1",
                bgColor,
                textColor,
                className
            )}
            style={
                {
                    "--shadow": `${shadowColor},0.15)`,
                    "--shadow-deep": `${shadowColor},0.25)`,
                } as React.CSSProperties
            }
            {...props}
        >
            <span className="flex items-center gap-3 relative z-10">
                {text}
                {rightIcon}
            </span>
        </button>
    );
};

export default MainButton;
