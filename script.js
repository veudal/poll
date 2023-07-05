let selectedId = 0;
let intervalId = 0;
document.addEventListener('DOMContentLoaded', function () {

    const theme = localStorage.getItem('theme');
    if (theme !== null) {
        document.body.className = theme;
    }

    const button = createButton();
    const div = document.getElementById("mainDiv");
    div.appendChild(button);

    button.addEventListener('click', buttonClick);
    options.addEventListener('change', handleOptionChange);


    if (document.body.classList.contains('light')) {
        document.getElementById('sun').style.display = 'block';
        document.getElementById('moon').style.display = 'none';
    } else {
        document.getElementById('sun').style.display = 'none';
        document.getElementById('moon').style.display = 'block';
    }

    var loadingStates = [
        'Loading.',
        'Loading..',
        'Loading...'
    ];

    var currentStateIndex = 0;
    questionParagraph.textContent = loadingStates[currentStateIndex];

    function updateLoadingState() {
        // Increment the state index
        currentStateIndex = (currentStateIndex + 1) % loadingStates.length;
        // Update the text content of the paragraph
        questionParagraph.textContent = loadingStates[currentStateIndex];
    }

    intervalId = setInterval(updateLoadingState, 250);

    const themeToggle = document.getElementById("themeToggle");
    themeToggle.addEventListener("click", function () {
        const body = document.body;
        body.classList.toggle("dark");
        body.classList.toggle("light");
        localStorage.setItem('theme', body.classList[0]);

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
    button.style.display = "none";
    button.disabled = true;
    return button;
}

function buttonClick() {

    const button = document.getElementById('submitButton');
    button.disabled = true;
    button.style.display = "none";
    options.style.opacity = "0";
    options.style.transition = "opacity 0.5s ease";
    pollArea.removeChild(options);
    fetch('https://pollapi.azurewebsites.net/Poll/SubmitAnswer?option=' + selectedId)
        .then(response => response.json())
        .then(data => {
                showResult(data.answers, data.options);
        });
}

function showResult(result, options) {
    p1.textContent = 'You have successfully voted today.';
    remainingTime();
    setInterval(remainingTime, 1000);
    setTimeout(function () {
        const colors = ['#AC92EB', '#4FC1E8', '#ED5564', '#A0D568', '#FFCE54'];
        const container = document.getElementById('progress-bars-container');
        let total = result.reduce((sum, value) => sum + value, 0);

        var button = document.createElement("button");
        button.type = "submit";
        button.style.marginBottom = '6vh';
        button.textContent = "Submit a new question";
        button.addEventListener('click', function () {
            window.location = 'submit.html';
        });
        document.body.appendChild(button);

        function createBar(value, color, option) {
            const percent = value / total;
            const spacing = 10;
            const div = document.createElement('div')
            div.className = 'bar-container'

            const name = document.createElement('span')
            name.className = 'option-name'
            name.textContent = option;
            name.style.color = color;
            name.style.fontWeight = '800'

            const bg_bar = document.createElement('div')
            bg_bar.className = 'bg-bar'
            bg_bar.style.marginBottom = '1rem';

            const bar = document.createElement('div')
            bar.className = 'bar'
            bar.style.width = percent * 100 + '%'
            bar.style.backgroundColor = color

            const percentDiv = document.createElement('div')
            percentDiv.className = 'percent-div'

            const percentInfo = document.createElement('span')
            percentInfo.className = 'percent-info'
            percentInfo.textContent = Math.round(percent * 100) + '%'

            function setValues() {
                const rect = name.getBoundingClientRect()
                const startX = rect.right + spacing * 2
                const barLength = percent * div.getBoundingClientRect().width;
                const shiftRight = 4.25 * spacing * percent * percent
                const endX = Math.max(startX, bar.getBoundingClientRect().left + barLength - shiftRight)

                percentDiv.style.left = startX + 'px';
                percentInfo.style.left = (endX - startX) + 'px';

            }
            div.appendChild(bg_bar);
            div.appendChild(name)
            bg_bar.appendChild(bar);
            container.appendChild(div);

            setValues()

            percentDiv.appendChild(percentInfo)
            div.appendChild(percentDiv)

            window.addEventListener('resize', setValues)
        }

        for (let i = 0; i < result.length; i++) {
            createBar(result[i], colors[i], options[i]);
        }
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 700);
}

function remainingTime() {

    const currentTime = new Date();
    const nextUTCDay = new Date(currentTime);
    nextUTCDay.setUTCDate(nextUTCDay.getUTCDate() + 1);
    nextUTCDay.setUTCHours(0, 0, 0, 0);

    const distance = nextUTCDay - currentTime;

    if (distance <= 1000) {

        window.location.reload();
    }

    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    p2.textContent = "Next poll: " + hours + "h " + minutes + "m " + seconds + "s ";

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

            clearInterval(intervalId);
            const diffInMilliseconds = new Date() - new Date(2023, 6, 1);
            const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)) + 1;
            question.textContent = 'Question #' + diffInDays;
            questionParagraph.textContent = data.question;


            if (data.duplicate) {
                showResult(data.answers, data.options);
            }
            else {
                showOptions(data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function showOptions(data) {

    const button = document.getElementById('submitButton');

    button.style.display = "flex";
    for (let i = 0; i < data.options.length; i++) {
        const radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.id = `opt-${i}`;
        radioButton.name = 'poll-option';

        const label = document.createElement('label');
        label.textContent = data.options[i];
        label.className = 'radio';
        label.setAttribute('for', `opt-${i}`);

        options.appendChild(radioButton);
        options.appendChild(label);
    }
}