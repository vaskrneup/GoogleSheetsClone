import {BaseComponent} from "./baseComponent.js";


export class Modal extends BaseComponent {
    /**
     * Class for creating modals.
     *
     * @param {{}} [styles]                 Add styles to be used by model.
     * @param {String|HTMLElement} child    Body of the Modal, can be `String` or `HTMLElement`.
     */
    constructor(styles, child) {
        super(styles);

        this.modal = document.createElement('div');
        this.closeBtn = document.createElement('span');

        this.modal.classList.add('theme-modal');
        this.closeBtn.classList.add('theme-model-close-btn');

        this.hide();

        if (child) this.addModelBody(child);
        document.body.appendChild(this.modal);

        this.addDefaultStyles();
        this.addEventListeners();
    }

    /**
     *  Adds default styles to modal, is used internally.
     */
    addDefaultStyles = () => {
        this.addStyles({
            backgroundColor: 'white',
            border: '1px solid black',
            boxShadow: '3px 3px 10px black',
        });
    }

    /**
     *  Event listeners will be added here, is used internally.
     */
    addEventListeners = () => {
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display !== 'none' && e.code === 'Escape') {
                e.preventDefault();
                this.hide();
            }
        });
    }

    /**
     * @param {String|HTMLElement} body      Body of the Modal, can be `String` or `HTMLElement`, will be appended to current body if reset is not provided.
     * @param {boolean} [reset]              If set true current body will be removed and new body will be added, defaults to true.
     * */
    addModelBody = (body, reset = false) => {
        if (reset) this.modal.innerHTML = '';

        if (typeof body === 'string') this.modal.innerHTML += body;
        else this.modal.appendChild(body);
    }

    /**
     * Replaces current style with new styles and updates to DOM.
     * New styles can be set using `addStyles`.
     * */
    compileStyles = () => {
        Object.keys(this.styles).forEach(style => {
            this.modal.style[style] = this.styles[style];
        });
    }

    /**
     * By default modal will be hidden, it will show the modal.
     * */
    show = () => this.modal.style.display = 'block';

    /**
     * It will hide the modal.
     */
    hide = () => this.modal.style.display = 'none';
}
