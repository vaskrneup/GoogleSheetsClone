import {BaseComponent} from "./baseComponent.js";


export class Modal extends BaseComponent {
    constructor(styles, child) {
        super(styles);

        this.modal = document.createElement('div');
        this.modal.classList.add('theme-modal');
        this.hide();

        if (typeof child === 'string') this.modal.innerHTML = child;
        else this.modal.classList.add('theme-modal');

        document.body.appendChild(this.modal);
    }

    compileStyles = () => {
        Object.keys(this.styles).forEach(style => {
            this.modal.style[style] = this.styles[style];
        });
    }

    show = () => this.modal.style.display = 'block';

    hide = () => this.modal.style.display = 'none';
}
