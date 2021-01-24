import {Excel} from "./component/excel.js";

// Selectors !!
const documentNameDOM = document.getElementById('current-doc-name-input');

// END Selectors !!

const changeInputSizeOnInput = (e) => {
    e.target.style.width = ((e.target.value.length + 1) * 9) + 'px';
}

const functionHandleEvents = () => {
    documentNameDOM.addEventListener('input', changeInputSizeOnInput)
}

const main = () => {
    const excel = new Excel(100, 26, 'excel-table');
    excel.render()
}

main();
functionHandleEvents();
