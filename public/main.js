
const tempalte = document.querySelector("#pet-card-template")
const wrapper = document.createDocumentFragment()


async function start() {
    const weatherPromise = await fetch("https://api.weather.gov/gridpoints/MFL/110,50/forecast")
    const weatherData = await weatherPromise.json()
    const ourTemp = weatherData.properties.periods[0].temperature
    document.querySelector("#tempOutput").textContent = ourTemp
}

start()

async function petsArea() {
    const petsPromise = await fetch("/.netlify/functions/pets")
    const petsData = await petsPromise.json()
    petsData.forEach(pet => {
        const clone = tempalte.content.cloneNode(true)
        // for filter later
        clone.querySelector(".pet-card").dataset.species = pet.species

        clone.querySelector("h3").textContent = pet.name
        clone.querySelector(".pet-description").textContent = pet.description
        clone.querySelector(".pet-age").textContent = createAgeText(pet.birthYear)

        if (!pet.photo) {
            pet.photo = "/Images/fallback.jpg"
        }
        else {
            pet.photo = `https://res.cloudinary.com/dm67vzo15/image/upload/w_330,h_392,c_fill/${pet.photo}.jpg`
        }
        clone.querySelector(".pet-card-photo img").src = pet.photo
        clone.querySelector(".pet-card-photo img").alt = `A ${pet.species} named ${pet.name}.`

        wrapper.appendChild(clone)
    });
    document.querySelector(".list-of-pets").appendChild(wrapper)
}

petsArea()

function createAgeText(birthyear) {
    const current = new Date().getFullYear()
    const age = current - birthyear

    if (age == 1) return "1 year old"
    if (age == 0) return "Less than a year old"

    return `${age} years old`
}


// Pet Filter Button Code
const allButtons = document.querySelectorAll(".pet-filter button")
allButtons.forEach(ele => {
    ele.addEventListener("click", handleButtonClick)
})

function handleButtonClick(event) {
    // Remove Active Class from any and all buttons
    allButtons.forEach(ele => ele.classList.remove("active"))

    // Add Active Class to the specific function
    event.target.classList.add("active")

    // Actually Filter
    const currentFilter = event.target.dataset.filter
    document.querySelectorAll(".pet-card").forEach(ele => {
        if (currentFilter == ele.dataset.species || currentFilter == "all") {
            ele.style.display = "grid"
        }
        else {
            ele.style.display = "none"
        }
    })

}