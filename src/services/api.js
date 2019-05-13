const baseUrl = "http://127.0.0.1:8000"

const urls = {
    getRoom: baseUrl + "/v1/rooms/",
    createRoom: baseUrl + "/v1/rooms/",
    // joinRoom: baseUrl + `/v1/rooms/${room_uid}/join`,
}

export const getRooms = () => {
    return fetch(urls.getRoom)
    .then(response => response.json())
    .then(json => console.log(json))
}

export const createRoom = (title, description, creator_name) => {
    return fetch(urls.createRoom, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            description: description,
            creator_name: creator_name
        })
    })
    .then(response => response.json())
    .then(json => console.log(json))
}