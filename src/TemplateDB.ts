import { SafeMap } from './utils';

export interface Template {
    getAllPlaceholders: () => string[];
    render: (data: any, options?: string[]) => Promise<Buffer>;
    init:() => Promise<void>;
}

export type TemplateConstructor<T extends Template> = new (file: Buffer, options?: any) => T;

class TemplateContainer<T extends Template> {
    pulled_at: number;
    template: T;
    placeHolders: string[];
    data: Buffer;

    constructor(pulled_at: number, template: T) {
        this.pulled_at = pulled_at;
        this.template = template;
        this.placeHolders = this.template.getAllPlaceholders();
    }

    async render(data: any, options?: string[]): Promise<Buffer> {
        return this.template.render(data, options);
    }

    getPlaceholders(): string[] {
        return this.placeHolders;
    }
};


class TemplateDB<T extends Template> {
    templates: SafeMap<string, TemplateContainer<T>>;
    templateClass: TemplateConstructor<T>;
    constructor(templateClass: TemplateConstructor<T>) {
        this.templateClass = templateClass;
        this.templates = new SafeMap();
    }

    addTemplate = async (name: string, data: Buffer) => {
        const now = new Date().getTime() / 1000; // we get the time in millis and we want it in seconds
        const template = new this.templateClass(data);
        await template.init();
        this.templates.set(name, new TemplateContainer(now, template));
    }

    removeTemplate = (name: string) => {
        this.templates.delete(name);
    }

    renderTemplate = (filename: string, data: any) => {
        return this.templates.get(filename).render(data);
    }

    getPlaceholder = (name: string) => {
        return this.templates.get(name).getPlaceholders();
    };
}

export default TemplateDB;