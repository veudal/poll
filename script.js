let selectedId = 0;

document.addEventListener('DOMContentLoaded', function () {
    
    const button = createButton();
    const div = document.getElementById("mainDiv"); 
    const mode = localStorage.getItem('mode');
    if (mode !== null) { 
        document.body.className = mode;
    }
    div.appendChild(button);

    button.addEventListener('click', buttonClick);
    options.addEventListener('change', handleOptionChange);

    const modeToggle = document.getElementById("modeToggle");

    if (document.body.classList.contains('light')) {
        document.getElementById('sun').style.display = 'block';
        document.getElementById('moon').style.display = 'none';
    } else {
        document.getElementById('sun').style.display = 'none';
        document.getElementById('moon').style.display = 'block';
    }

    modeToggle.addEventListener("click", function () {
        const body = document.body;
        body.classList.toggle("dark");
        body.classList.toggle("light");
        localStorage.setItem('mode', body.classList[0]);

        if (document.body.classList.contains('light')) {
            document.getElementById('sun').style.display = 'block';
            document.getElementById('moon').style.display = 'none';
        } else {
            document.getElementById('sun').style.display = 'none';
            document.getElementById('moon').style.display = 'block';
        }
    });
    getPoll();
});

function createButton() {
    const button = document.createElement('button');
    button.id = 'submitButton';
    button.innerText = "Submit";
    button.style.marginTop = "50px";
    button.hidden = true;
    button.disabled = true;

    return button;
}

function buttonClick() {
    const button = document.getElementById('submitButton');
    button.disabled = true;
    button.hidden = true;

    fetch('https://pollapi.azurewebsites.net/Poll/SubmitAnswer?option=' + selectedId)
        .then(response => response.json())
        .then(data => {
                showResult(data.answers, data.options);
        });

    options.style.opacity = "0";
    options.style.transition = "opacity 0.5s ease";
}

function showResult(result, options) {
    setTimeout(function () {
        const colors = ['#AC92EB', '#4FC1E8', '#ED5564', '#A0D568', '#FFCE54'];
        const container = document.getElementById('progress-bars-container');
        let total = result.reduce((sum, value) => sum + value, 0);
        const pollArea = document.getElementById("pollArea");
        const paragraph = document.createElement('p');
        const text = document.createTextNode('You have successfully voted today.');
        paragraph.appendChild(text);
        pollArea.appendChild(paragraph);

        function createBar(value, color, option) {
            const percent = value / total;
            const spacing = 10;
            const div = document.createElement('div')
            div.className = 'bar-container'

            const name = document.createElement('span')
            name.className = 'option-name'
            name.textContent = option;
            div.appendChild(name)

            const bg_bar = document.createElement('div')
            bg_bar.className = 'bg-bar'
            div.appendChild(bg_bar);

            const bar = document.createElement('div')
            bar.className = 'bar'
            bar.style.width = percent * 100 + '%'
            bar.style.backgroundColor = color
            bg_bar.appendChild(bar);

            container.appendChild(div);


            const percentDiv = document.createElement('div')
            percentDiv.className = 'percent-div'

            const percentInfo = document.createElement('span')
            percentInfo.className = 'percent-info'
            percentInfo.textContent = Math.round(percent * 100) + '%'

            function setValues() {
                const rect = name.getBoundingClientRect()
                const startX = rect.right + spacing * 2
                const startY = rect.top;
                const barLength = percent * div.getBoundingClientRect().width;
                const shiftRight = 4.25 * spacing * percent * percent
                const endX = Math.max(startX, bar.getBoundingClientRect().left + barLength - shiftRight)

                percentDiv.style.left = startX + 'px';
                percentDiv.style.top = startY + 'px';
                percentInfo.style.left = (endX - startX) + 'px';
            }

            setValues()
            percentDiv.appendChild(percentInfo)
            div.appendChild(percentDiv)
            window.addEventListener('resize', setValues)
        }

        for (let i = 0; i < result.length; i++) {
            createBar(result[i], colors[i], options[i]);
        }
    }, 700);
}

function handleOptionChange(event) {
    selectedId = event.target.id.substring(4);
    const button = document.getElementById('submitButton');
    button.disabled = false;
}

function getPoll() {
    fetch('https://pollapi.azurewebsites.net/Poll/GetDailyPoll')
        .then(response => response.json())
        .then(data => {
            const questionParagraph = document.getElementById('QuestionParagraph');
            questionParagraph.style.fontSize = "20px";
            questionParagraph.textContent = data.question;

            const button = document.getElementById('submitButton');
            const options = document.getElementById('options');

            if (data.duplicate) {
                button.disabled = true;
                button.hidden = true;

                showResult(data.answers, data.options);
                options.style.opacity = "0";
                options.style.transition = "opacity 0.5s ease";
            } else {
                button.hidden = false;

                for (let i = 0; i < data.options.length; i++) {
                    const radioButton = document.createElement('input');
                    radioButton.type = 'radio';
                    radioButton.id = `opt-${i}`;
                    radioButton.name = 'poll-option';

                    const label = document.createElement('label');
                    label.textContent = data.options[i];
                    label.setAttribute('for', `opt-${i}`);

                    options.appendChild(radioButton);
                    options.appendChild(label);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}