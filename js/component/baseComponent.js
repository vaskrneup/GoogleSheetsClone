export class BaseComponent {
    /**
     * Base class for Components
     *
     * @param {{}} [styles]     Add styles to be used by component.
     * */
    constructor(styles) {
        this.styles = styles || {};
    }

    /**
     * Adds or reset the styles to previously applied styles.
     *
     * @param {{}} styles     Add styles to be used by component.
     */
    addStyles = (styles) => {
        this.styles = {...this.styles, ...styles};
    }
}
