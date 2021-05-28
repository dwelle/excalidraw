/// <reference types="react" />
import "./ColorPicker.scss";
export declare const ColorPicker: ({ type, color, onChange, label, isActive, setActive, }: {
    type: "canvasBackground" | "elementBackground" | "elementStroke";
    color: string | null;
    onChange: (color: string) => void;
    label: string;
    isActive: boolean;
    setActive: (active: boolean) => void;
}) => JSX.Element;
