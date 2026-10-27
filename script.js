const form = document.querySelector("form");
const yInput = document.getElementById("coordinate-y");
let selectedR = null;
const availableR = [1, 1.5, 2, 2.5, 3];
const availableX = [-5, -4, -3, -2, -1, 0, 1, 2, 3];
const statusMessage = document.getElementById("status-messages");
const ruleTextY = new RegExp("^" + yInput.pattern + "$");
const historyArray = [];

const rInput = document.querySelectorAll(
    'fieldset[id="coordinate-r"] button'
);

// нажатие на кнопку R
for (const rButton of rInput) {
    rButton.addEventListener("click", () => {
        for (const button of rInput) {
            button.classList.remove("selected-r");
            button.setAttribute("aria-pressed", "false");
        }
        selectedR = Number(rButton.value);
        rButton.classList.add("selected-r");
        rButton.setAttribute("aria-pressed", "true");
    });
}

// обработка при нажатии кнопки "проверить"
form.addEventListener("submit", (event) => {
    statusMessage.textContent = "";
    const xInput = document.querySelectorAll(
        'input[name="x"]:checked'
    );
    const xNumbers = [];
    event.preventDefault();

    const yInputClear = yInput.value.trim();
    if (!yInputClear) {
        statusMessage.textContent = "В поле Y введено пустое значение";
    } else {
        if (!ruleTextY.test(yInputClear)) {
            statusMessage.textContent = "Неправильный формат числа";
            return;
        }
        const yInputNumber = Number(yInputClear);
        if (!Number.isFinite(yInputNumber)) {
            statusMessage.textContent = "В поле Y введено не число или не конечное число";
        } else if (yInputNumber <= -3 || yInputNumber >= 5) {
            statusMessage.textContent = "Число Y не подходит по условию, используйте интервал (-3, 5)";
        } else if (xInput.length === 0) {
            statusMessage.textContent = "Необходимо выбрать хотя бы 1 X";
        } else if (selectedR === null || !availableR.includes(selectedR)) {
            statusMessage.textContent = "R не выбрано или не соответствует допустимым значениям";
        } else {
            for (const checkbox of xInput) {
                const newX = Number(checkbox.value);
                if (!availableX.includes(newX)) {
                    statusMessage.textContent = "Выбран X, которого нет в списке допустимых";
                    return;
                }
                xNumbers.push(newX);
            }
            const createdAt = Date.now();
            for (const x of xNumbers) {
                const logicalResult = isInside(x, yInputNumber, selectedR);
                const resultObject = {
                    xCurrent: x,
                    yCurrent: yInputNumber,
                    rCurrent: selectedR,
                    logicalResult: logicalResult,
                    createdTime: createdAt
                };
                historyArray.push(resultObject);
                rowAppend(resultObject);
            }
            try {
                const historyArrayText = JSON.stringify(historyArray);
                localStorage.setItem("history", historyArrayText);
            } catch (error) {
                console.error(error);
                statusMessage.textContent = "Результаты отображены, но сохранить" +
                    " историю не удалось";
            }
        }
    }
});

// добавление данных в таблицу
const tableElement = document.getElementById("history-table");
function rowAppend(checkObject) {
    const tableRow = document.createElement("tr");
    const tableX = document.createElement("td");
    const tableY = document.createElement("td");
    const tableR = document.createElement("td");
    const tableCheck = document.createElement("td");
    const tableDate = document.createElement("td");
    tableX.textContent = checkObject.xCurrent;
    tableY.textContent = checkObject.yCurrent;
    tableR.textContent = checkObject.rCurrent;
    if (checkObject.logicalResult) {
        tableCheck.textContent = "Попадание";
    } else {
        tableCheck.textContent = "Промах";
    }
    tableDate.textContent = formatDateTime(checkObject.createdTime);
    tableRow.append(tableX);
    tableRow.append(tableY);
    tableRow.append(tableR);
    tableRow.append(tableCheck);
    tableRow.append(tableDate);
    tableElement.append(tableRow);
}

// восстановление данных из localStorage
try {
    const savedHistory = localStorage.getItem("history");
    if (savedHistory !== null) {
        const historyData = JSON.parse(savedHistory);
        if (Array.isArray(historyData)) {
            for (const historyObject of historyData) {
                if (checkSavedObject(historyObject)) {
                    historyArray.push(historyObject);
                    rowAppend(historyObject);
                } else {
                    statusMessage.textContent = "Часть истории не удалось восстановить";
                }
            }
        } else {
            statusMessage.textContent = "Сохранённая история имеет неверный формат";
        }
    }
} catch (error) {
    statusMessage.textContent = "Не удалось восстановить историю";
    console.error(error);
}

// проверка сохраненного объекта для восстановления
function checkSavedObject(savedObj) {
    if (savedObj === null || typeof savedObj !== "object") {
        return false;
    }
    return availableX.includes(savedObj.xCurrent)
        && availableR.includes(savedObj.rCurrent)
        && (Number.isFinite(savedObj.createdTime) && !isNaN((new Date(savedObj.createdTime)).getTime()))
        && (savedObj.yCurrent < 5 && savedObj.yCurrent > -3 && Number.isFinite(savedObj.yCurrent))
        && typeof savedObj.logicalResult === "boolean";

}

function isInsideRectangle(x, y, r) {
    return (y <= r / 2 && y >= 0) && (x >= -r && x <= 0);
}

function isInsideCircle(x, y, r) {
    return (x ** 2 + y ** 2 <= (r / 2) ** 2) && x <= 0 && y <= 0;
}

function isInsideTriangle(x, y, r) {
    return y <= 0 && (y >= 0.5 * x - r / 2) && x >= 0;
}

// проверка попадания точки
function isInside(x, y, r) {
    return isInsideRectangle(x, y, r) || isInsideCircle(x, y, r) || isInsideTriangle(x, y, r);
}

// преобразование временной метки в стандартное представление
function formatDateTime(createdAt) {
    const dateForOutput = new Date(createdAt);
    return dateForOutput.toLocaleString("ru-RU");
}


// отрисовка координатной плоскости и фигуры
const canvas = document.getElementById("coordinate-plane");
const context = canvas.getContext("2d");
context.strokeStyle = "black";
context.lineWidth = 2;
const centerWidth = canvas.width / 2;
const centerHeight = canvas.height / 2;
const canvasR = 140;

context.fillStyle = "#466ce4";
context.fillRect(centerWidth - canvasR, centerHeight - canvasR / 2, canvasR, canvasR / 2);

context.beginPath();
context.moveTo(centerWidth, centerHeight);
context.lineTo(centerWidth, centerHeight + canvasR / 2);
context.lineTo(centerWidth + canvasR, centerHeight);
context.closePath();
context.fill();

context.beginPath();
context.moveTo(centerWidth, centerHeight);
context.arc(centerWidth, centerHeight, canvasR / 2, Math.PI, Math.PI / 2, true);
context.closePath();
context.fill();

context.beginPath();
context.moveTo(10, centerHeight);
context.lineTo(canvas.width - 10, centerHeight);
context.stroke();

context.beginPath();
context.moveTo(centerWidth, 10);
context.lineTo(centerWidth, canvas.height - 10);
context.stroke();

context.beginPath();
context.moveTo(centerWidth, 10);
context.lineTo(centerWidth + 5, 20);
context.moveTo(centerWidth, 10);
context.lineTo(centerWidth - 5, 20);
context.stroke();

context.beginPath();
context.moveTo(canvas.width - 10, centerHeight);
context.lineTo(canvas.width - 20, centerHeight + 5);
context.moveTo(canvas.width - 10, centerHeight);
context.lineTo(canvas.width - 20, centerHeight - 5);
context.stroke();

context.font = "20px sans-serif";
context.fillStyle = "black";
context.fillText("y", centerWidth + 10, 20);
context.fillText("x", canvas.width - 20, centerHeight - 10);

context.beginPath();
context.moveTo(centerWidth - canvasR, centerHeight - 3);
context.lineTo(centerWidth - canvasR, centerHeight + 3);
context.moveTo(centerWidth - (canvasR / 2), centerHeight - 3);
context.lineTo(centerWidth - (canvasR / 2), centerHeight + 3);
context.stroke();

context.beginPath();
context.moveTo(centerWidth + canvasR, centerHeight - 3);
context.lineTo(centerWidth + canvasR, centerHeight + 3);
context.moveTo(centerWidth + (canvasR / 2), centerHeight - 3);
context.lineTo(centerWidth + (canvasR / 2), centerHeight + 3);
context.stroke();

context.beginPath();
context.moveTo(centerWidth + 3, centerHeight + canvasR);
context.lineTo(centerWidth - 3, centerHeight + canvasR);
context.moveTo(centerWidth + 3, centerHeight + (canvasR / 2));
context.lineTo(centerWidth - 3, centerHeight + (canvasR / 2));
context.stroke();

context.beginPath();
context.moveTo(centerWidth + 3, centerHeight - canvasR);
context.lineTo(centerWidth - 3, centerHeight - canvasR);
context.moveTo(centerWidth + 3, centerHeight - (canvasR / 2));
context.lineTo(centerWidth - 3, centerHeight - (canvasR / 2));
context.stroke();

context.textAlign = "left";
context.textBaseline = "middle";
context.fillText("R", centerWidth + 10, centerHeight - canvasR);
context.fillText("R/2", centerWidth + 10, centerHeight - canvasR / 2);
context.fillText("-R", centerWidth + 10, centerHeight + canvasR);
context.fillText("-R/2", centerWidth + 10, centerHeight + canvasR / 2);

context.textAlign = "center";
context.textBaseline = "alphabetic";
context.fillText("-R", centerWidth - canvasR, centerHeight - 10);
context.fillText("-R/2", centerWidth - canvasR / 2, centerHeight - 10);
context.fillText("R", centerWidth + canvasR, centerHeight - 10);
context.fillText("R/2", centerWidth + canvasR / 2, centerHeight - 10);







