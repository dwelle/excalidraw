import React from "react";
import { Language } from "../i18n";
interface Props {
    langCode: Language["code"];
}
interface State {
    isLoading: boolean;
}
export declare class InitializeApp extends React.Component<Props, State> {
    state: {
        isLoading: boolean;
    };
    componentDidMount(): Promise<void>;
    render(): React.ReactNode;
}
export {};
