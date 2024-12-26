const cloudinary = require("cloudinary").v2
const sanitizeHtml = require("sanitize-html")
const getDbClient = require("../../our-library/getDbClient")
const isAdmin = require("../../our-library/isAdmin")

const cloudinaryConfig = cloudinary.config({
    cloud_name: "dm67vzo15",
    api_key: "592632761547989",
    api_secret: process.env.CLOUDINARYSECRET,
    secure: true
})

function cleanUp(x) {
    return sanitizeHtml(x, {
        allowedTags: [],
        allowedAttributes: {}
    })
}

const handler = async event => {
    const body = JSON.parse(event.body)
    if (typeof body.name != "string") {
        body.name = ""
    }

    if (typeof body.description != "string") {
        body.description = ""
    }
    let pet = {
        name: cleanUp(body.name),
        species: cleanUp(body.species),
        description: cleanUp(body.description),
        birthYear: new Date().getFullYear()
    }

    if (body.birthYear > 999 && body.birthYear < 9999) {
        pet.birthYear = body.birthYear
    }

    if (pet.species != "cat" && pet.species != "dog") {
        pet.species = "dog"
    }

    const expectedSignature = cloudinary.utils.api_sign_request({ public_id: body.public_id, version: body.version }, cloudinaryConfig.api_secret)
    if (expectedSignature === body.signature) {
        pet.photo = body.public_id
    }

    if (isAdmin(event)) {
        // actually save into database
        const client = await getDbClient()
        await client.db().collection("pets").insertOne(pet)
        client.close()

        return {
            statusCode: 200,
            header: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: true })
        }
    }

    // no permission
    return {
        statusCode: 200,
        header: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: false })
    }
}

module.exports = { handler }