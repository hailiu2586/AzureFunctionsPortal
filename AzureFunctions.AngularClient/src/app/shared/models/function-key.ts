
export interface FunctionKey {
    name: string;
    value: string;
    show?: boolean;
    selected?: boolean;
    links?: Array<Links>
}

export interface FunctionKeys {
    keys: Array<FunctionKey>;
    links: Array<Links>;
}

export interface Links {
    rel: string;
    href: string;
}