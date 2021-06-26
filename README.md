# Node JS connector

This connector is meant to get used with the [petit_publipost_gateway](https://github.com/Plawn/petit_publipost_gateway)

It's a connector which can used in order to create a new publipost engine

As of now, it works using an HTTP interface, handled by an express server.

It implements the required endpoints needed to work with the [petit_publipost_gateway](https://github.com/Plawn/petit_publipost_gateway)

- POST /publipost
- POST /get_placeholders
- GET /list
- DELETE /remove_template
- POST /load_templates
- GET /live
- POST /configure

It is used by :

- [petit_pdf_engine](https://github.com/Plawn/petit_pdf_engine)
- [petit_xlsx_engine](https://github.com/Plawn/petit_xlsx_engine)
- [petit_pptx_engine](https://github.com/Plawn/petit_pptx_engine)

It exposes 2 things:

- makeConnector
- Template

Example:

```ts
// ...
import makeConnector,{ Template } from 'petit_nodejs_publipost_connector';

class PdfTemplate implements Template {
    data: any;
    placeholders: { [contentSide: string]:  /*real name side*/ string };

    constructor(data: any) {
        this.data = data;
    }

    async init() {
        const d = await PDFDocument.load(this.data);
        const form = d.getForm();
        const fields = form.getFields();
        this.placeholders = loadFields(fields);
    }

    private prepareFields(data: any) {
        const formData: { [k: string]: string } = {};
        Object.keys(data).forEach(key => {
            const val = data[key];
            formData[this.placeholders[key]] = val;
        });
        return formData;
    }

    async render(data: any, options?: string[]) {
        const fields = this.prepareFields(data);
        const res = pdftk
            .input(this.data)
            .fillForm(fields)
            .flatten()
            .output()
        return res;
    }

    getAllPlaceholders() {
        return Object.keys(this.placeholders);
    }

}

// Main wrapped for asyncness
const main = async () => {
    const port = Number(process.argv[2]);
    if (isNaN(port) || port > 65535) {
        throw new Error(`invalid port ${port}`)
    }
    const app = makeConnector(PDFTemplate);
    app.listen(port, () => {
        console.log(`Connector started on port ${port}`);
    });
};

main();
```
