import type { CSSProperties } from "react";

type IconImgProps = {
    path: string;
    title: string;
    className?: string;
    size?: number;
    decorative?: boolean;
};

export function IconImg({
    path,
    title,
    className,
    size = 16,
    decorative = false,
}: IconImgProps) {
    const style: CSSProperties = {
        width: size,
        height: size,
    };

    return (
        <img
            src={path}
            alt={decorative ? "" : title}
            title={decorative ? undefined : title}
            aria-hidden={decorative ? true : undefined}
            className={className}
            style={style}
            loading="lazy"
            draggable={false}
        />
    );
}

