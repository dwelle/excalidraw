import "./TextInput.scss";
import { Component } from "react";
declare type Props = {
    value: string;
    onChange: (value: string) => void;
    label: string;
    isNameEditable: boolean;
};
declare type State = {
    fileName: string;
};
export declare class ProjectName extends Component<Props, State> {
    state: {
        fileName: string;
    };
    private handleBlur;
    private handleKeyDown;
    render(): JSX.Element;
}
export {};
