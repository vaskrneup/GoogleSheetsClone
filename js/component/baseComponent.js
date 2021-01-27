export class BaseComponent {
    constructor(styles) {
        this.styles = styles || {};
    }

    addStyles = (styles) => {
        this.styles = {...this.styles, ...styles};
    }

    render = () => {

    }
}