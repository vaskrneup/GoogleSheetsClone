import {BaseComponent} from "./baseComponent.js";

export class RightClickMenu extends BaseComponent {
    constructor(styles) {
        super(styles);

        this.rightClickMenu = document.createElement('div');
    }

    addDefaultStyles = () => {
        this.addStyles({
            position: 'absolute',
            display: 'none',
        });
        this.compileStyles();
    }

    compileStyles = () => {
        Object.keys(this.styles).forEach(style => {
            this.rightClickMenu.style[style] = this.styles[style];
        });
    }

    addBody = (body, reset = false) => {
        if (reset) this.rightClickMenu.innerHTML = '';

        if (typeof body === 'string') {
            this.rightClickMenu.innerHTML = body;
        } else {
            if (Array.isArray(body)) {
                body.forEach(bodyChild => {
                    this.rightClickMenu.appendChild(bodyChild);
                });
            } else {
                this.rightClickMenu.appendChild(body);
            }
        }
    }

    show = (x, y) => {
        this.addStyles({
            top: x + 'px',
            left: y + 'px',
            display: 'block',
        });
        this.compileStyles();
    }

    hide = () => {
        this.rightClickMenu.style.display = 'none';
    }

    render = () => {
        document.body.appendChild(this.rightClickMenu);
        this.addDefaultStyles();
    }
}
