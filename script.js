let selectedId = 0;
let intervalId = 0;
let pollData = null;

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
    if (!hasVoted()) {
        fetch('https://pollapi.azurewebsites.net/Poll/SubmitAnswer?option=' + selectedId)
        localStorage.setItem("lastVote", new Date());
    }
    pollData.answers[selectedId]++;
    showResult(pollData.answers, pollData.options);
}

function showResult(result, options) {
    let total = result.reduce((sum, value) => sum + value, 0);
    p1.textContent = 'You have successfully voted today.';
    remainingTime();
    setInterval(remainingTime, 1000);
    setTimeout(function () {
        const colors = ['#AC92EB', '#4FC1E8', '#ED5564', '#A0D568', '#FFCE54', "#FE20FE"];
        const container = document.getElementById('progress-bars-container');
        var button = document.createElement("button");
        button.type = "submit";
        button.style.marginBottom = '6vh';
        button.textContent = "Submit a new question";
        button.addEventListener('click', function () {
            window.location = 'submit.html';
        });
        document.body.appendChild(button);

        function createBar(value, color, option) {
            const p = value / total;
            const barContainer = document.createElement('div')
            barContainer.className = 'bar-container'

            const textContainer = document.createElement('div')
            textContainer.className = 'text-container'
            barContainer.appendChild(textContainer)

            const barTitle = document.createElement('span')
            barTitle.className = 'bar-title'
            barTitle.textContent = option;
            barTitle.style.color = color;
            textContainer.appendChild(barTitle)

            const percentHolder = document.createElement('div')
            percentHolder.className = 'percent-holder'
            textContainer.appendChild(percentHolder)

            const percent = document.createElement('span')
            percent.className = 'percent'
            percent.textContent = Math.round(p * 100) + '%'
            percent.style.zIndex = 10
            percentHolder.appendChild(percent)

            const percent_invisible = document.createElement('span')
            percent_invisible.className = percent.className
            percent_invisible.textContent = percent.textContent
            percent_invisible.style.opacity = 0
            percent_invisible.style.pointerEvents = 'none';
            textContainer.appendChild(percent_invisible)

            const barFill = document.createElement('div')
            barFill.className = 'bar-fill'
            barContainer.appendChild(barFill)

            const barBg = document.createElement('div')
            barBg.className = 'bar-bg'
            barFill.appendChild(barBg)

            const barColor = document.createElement('div')
            barColor.className = 'bar-color'
            barColor.style.width = p * 100 + '%'
            barColor.style.backgroundColor = color
            barBg.appendChild(barColor)

            container.appendChild(barContainer)

            function offsetPercent() {
                const bw = barFill.getBoundingClientRect().width * p
                const bt = barTitle.getBoundingClientRect().width + 12
                if (bw > bt) {
                    const pw = percent.getBoundingClientRect().width
                    percent.style.left = `calc(clamp(0%, ${bw - bt - pw / 2}px, 100%))`
                }
            }

            offsetPercent()
            window.addEventListener("resize", offsetPercent)
        }

        for (let i = 0; i < result.length; i++) {
            createBar(result[i], colors[i], options[i])
        }

        const div = document.getElementById("mainDiv")
        const p = document.createElement('p')
        p.style.textAlign = 'center'
        p.textContent = "Votes: " + total
        div.appendChild(p)
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
        .then(response => {
            if (response.status >= 200 && response.status < 300) {
                return response.json();
            } else {
                throw new Error("Bad response status code")
            }
        })
        .then(data => {
            pollData = data;
            clearInterval(intervalId);
            const diffInMilliseconds = new Date().setHours(0, 0, 0, 0) - new Date(2023, 6, 1);
            const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)) + 1;
            question.textContent = 'Question #' + diffInDays;
            questionParagraph.textContent = data.question;

            if (data.duplicate) {
                showResult(pollData.answers, pollData.options);
            } else {
                showOptions(pollData);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setTimeout(function () {
                getPoll();
            }, 5000);
        });
}

function hasVoted() {

    const date = localStorage.getItem("lastVote");
    console.log(date)
    if (areDatesOnSameDay(new Date(date), new Date())) {
        return true;
    }
    else {
        return false;
    }
}

function areDatesOnSameDay(date1, date2) {
    return date1.getUTCFullYear() === date2.getUTCFullYear() && date1.getUTCMonth() === date2.getUTCMonth() && date1.getUTCDate() === date2.getUTCDate();
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