/// <reference types="react" />
import "./ColorPicker.scss";
export declare const ColorPicker: ({ type, color, onChange, label, }: {
    type: "canvasBackground" | "elementBackground" | "elementStroke";
    color: string | null;
    onChange: (color: string) => void;
    label: string;
}) => JSX.Element;
