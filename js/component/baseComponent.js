export class BaseComponent {
    constructor(styles) {
        this.styles = styles || {};
        if (styles) this.compileStyles();
    }

    compileStyles = () => {
        this.renderedStyles = JSON.stringify(this.styles.replace('{', '').replace('}', '').replaceAll(',', ';').replaceAll('"', ''));
    }

    addStyles = (styles) => {
        this.styles = {...this.styles, ...styles};
        this.compileStyles();
    }

    setState = (cb) => {
        if (cb) cb();
        this.render();
    }

    render = () => {

    }
}