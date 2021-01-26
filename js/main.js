import {Excel, getGridFromJson} from "./component/excel.js";
import {downloadData, readFile} from "./utils/DOM.js";

// Selectors !!
const documentNameDOM = document.getElementById('current-doc-name-input');
const saveDataDOM = document.getElementById('save-data-btn');
const uploadDataDOM = document.getElementById('upload-data-btn');

// END Selectors !!

const changeInputSizeOnInput = (e) => {
    e.target.style.width = ((e.target.value.length + 1) * 9) + 'px';
}

const functionHandleEvents = () => {
    documentNameDOM.addEventListener('input', changeInputSizeOnInput)
}

const main = () => {
    const excel = new Excel(
        100, 26, 'excel-table',
        'background-color-picker', 'text-color-picker', 'font-size-input',
        'make-text-bold', 'make-text-italic', 'make-text-strikethrough',
        'current-cell', 'formula-input', 'font-selector'
    );
    excel.render();

    saveDataDOM.addEventListener('click', () => {
        downloadData('json', documentNameDOM.value + '.json', JSON.stringify(excel.serialize()));
    });

    uploadDataDOM.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        readFile(file, (fileData) => {
            const spreadsheetJsonData = JSON.parse(fileData);
            const data = getGridFromJson(spreadsheetJsonData);

            excel.resetGrid(data);
            documentNameDOM.value = spreadsheetJsonData.name;
        });
    });
}

main();
functionHandleEvents();
