import {Excel} from "./component/excel.js";

function main() {
    const excel = new Excel(100, 26, 'excel-table');
    excel.render()
}

main();
