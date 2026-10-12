const form = document.querySelector("form");
const yInput = document.getElementById("coordinate-y");
let selectedR = null;
const availableR = [1, 1.5, 2, 2.5, 3];
const availableX = [-5, -4, -3, -2, -1, 0, 1, 2, 3];
const statusMessage = document.getElementById("status-messages");
const ruleTextY = new RegExp("^" + yInput.pattern + "$");

const rInput = document.querySelectorAll(
    'fieldset[id="coordinate-r"] button'
);

for (const rButton of rInput) {
    rButton.addEventListener("click", () => {
        selectedR = Number(rButton.value);
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

        }
    }
});

