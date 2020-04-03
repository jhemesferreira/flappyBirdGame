function newElement(tagName, className) {
    const element = document.createElement(tagName)
    element.classList.add(className)
    return element
}

function barrier(reverse = false) {
    this.element = newElement('div', 'barrier')

    const edge = newElement('div', 'edge')
    const body = newElement('div', 'body')
    this.element.appendChild(reverse ? body : edge)
    this.element.appendChild(reverse ? edge : body)

    this.setHeight = height => body.style.height = `${height}px`
}


function pairBarriers(height, gap, x) {
    this.element = newElement('div', 'pair-barriers')

    this.higher = new barrier(true)
    this.bottom = new barrier(false)

    this.element.appendChild(this.higher.element)
    this.element.appendChild(this.bottom.element)

    this.randomGap = () => {
        const heightHigher = Math.random() * (height - gap)
        const heightBottom = height - gap - heightHigher
        this.higher.setHeight(heightHigher)
        this.bottom.setHeight(heightBottom)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.randomGap()
    this.setX(x)
}

// const b = new pairBarriers(700, 300, 800)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function barriers(height, width, gap, distance, punctuation) {
    this.pairs = [
        new pairBarriers(height, gap, width),
        new pairBarriers(height, gap, width + distance),
        new pairBarriers(height, gap, width + distance * 2),
        new pairBarriers(height, gap, width + distance * 3)
    ]

    const displacement = 3
    this.animation = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            // when the element leaves the game area
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + distance * this.pairs.length)
                pair.randomGap()
            }

            const middle = width / 2
            const crossedMiddle = pair.getX() + displacement >= middle
                && pair.getX() < middle
            if (crossedMiddle) punctuation()
        })
    }
}

function bird(heightGame) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'img/bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.animation = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const heightMax = heightGame - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= heightMax) {
            this.setY(heightMax)
        } else {
            this.setY(newY)
        }
    }

    this.setY(heightGame / 2)
}


function progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = point => {
        this.element.innerHTML = point
    }
    this.updatePoints(0)
}

function overlap(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function crashed(bird, barriers) {
    let crashed = false
    barriers.pairs.forEach(pairBarriers => {
        if (!crashed) {
            const higher = pairBarriers.higher.element
            const bottom = pairBarriers.bottom.element
            crashed = overlap(bird.element, higher)
                || overlap(bird.element, bottom)
        }
    })
    return crashed
}

function flappyBird() {
    let point = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const newProgress = new progress()
    const newBarriers = new barriers(height, width, 200, 400,
        () => newProgress.updatePoints(++point))
    const newBird = new bird(height)

    gameArea.appendChild(newProgress.element)
    gameArea.appendChild(newBird.element)
    newBarriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        // loop game
        const timer = setInterval(() => {
            newBarriers.animation()
            newBird.animation()

            if (crashed(newBird, newBarriers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

new flappyBird().start()