import {BaseComponent} from "./baseComponent.js";


export class Modal extends BaseComponent {
    constructor(styles, child) {
        super(styles);

        this.modal = document.createElement('div');
        this.closeBtn = document.createElement('span');

        this.modal.classList.add('theme-modal');
        this.closeBtn.classList.add('theme-model-close-btn');

        this.hide();

        if (child) this.addModelBody(child);
        document.body.appendChild(this.modal);

        this.addEventListeners();
    }

    addEventListeners = () => {
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display !== 'none' && e.code === 'Escape') {
                e.preventDefault();
                this.hide();
            }
        });
    }

    addModelBody = (body, reset) => {
        if (reset) this.modal.innerHTML = '';

        if (typeof body === 'string') this.modal.innerHTML += body;
        else this.modal.appendChild(body);
    }

    compileStyles = () => {
        Object.keys(this.styles).forEach(style => {
            this.modal.style[style] = this.styles[style];
        });
    }

    show = () => this.modal.style.display = 'block';

    hide = () => this.modal.style.display = 'none';
}
