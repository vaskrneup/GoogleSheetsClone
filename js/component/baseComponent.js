export class BaseComponent {
    constructor(styles) {
        this.styles = styles || {};
    }

    addStyles = (styles) => {
        this.styles = {...this.styles, ...styles};
    }

    removeStyles = (styles) => {
        styles.forEach(style => delete this.styles[style]);
    }

    setState = (cb) => {
        if (cb) cb();
        this.render();
    }

    render = () => {

    }
}