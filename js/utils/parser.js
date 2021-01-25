export const parseMathSyntax = (text, operationType) => {
    let parsedText = text.replace(operationType, '').replace(')', '');
    let isTwoDigitSum = null;

    if (parsedText.includes(':')) {
        parsedText = parsedText.split(':');
        isTwoDigitSum = false;
    } else if (parsedText.includes(',')) {
        parsedText = parsedText.split(',');
        isTwoDigitSum = true;
    }

    if (isTwoDigitSum === null) {
        return null;
    } else {
        const finalCoordinates = [];

        parsedText.forEach(rawCoOrdinate => {
            rawCoOrdinate = rawCoOrdinate.toUpperCase().replaceAll(' ', '');
            let x = '';
            let y = '';

            for (let i = 0; i < rawCoOrdinate.length; i++) {
                if (isNaN(Number(rawCoOrdinate[i]))) {
                    x += (rawCoOrdinate[i].charCodeAt(0) - 65);
                } else {
                    y += rawCoOrdinate[i];
                }
            }

            finalCoordinates.push({x: parseInt(x), y: parseInt(y) - 1, isTwoDigitSum: isTwoDigitSum});
        });

        return finalCoordinates;
    }
}