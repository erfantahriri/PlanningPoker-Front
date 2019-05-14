const baseUrl = "http://127.0.0.1:8000"

const urls = {
	getRoom: baseUrl + "/v1/rooms/",
	createRoom: baseUrl + "/v1/rooms/",
	getRoomIssues: baseUrl + "/v1/rooms/roomUid/issues",
	getRoomParticipants: baseUrl + "/v1/rooms/roomUid/participants",
	createIssue: baseUrl + "/v1/rooms/roomUid/issues",
	joinRoom: baseUrl + "/v1/rooms/roomUid/join",
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
		.then(response => {
			if (response.status === 201) {
				return response.json();
			}
		})
		.catch(err => console.log(err))
}

export const getRoomIssues = (roomUid) => {
	return fetch(urls.getRoomIssues.replace('roomUid', roomUid), {
		method: 'GET',
		headers: {
			"Authorization": localStorage.getItem('accessToken')
		}
	})
		.then(response => {
			if (response.status === 200) {
				return response.json();
			}
		})
		.catch(err => console.log(err))
}

export const getRoomParticipants = (roomUid) => {
	return fetch(urls.getRoomParticipants.replace('roomUid', roomUid), {
		method: 'GET',
		headers: {
			"Authorization": localStorage.getItem('accessToken')
		}
	})
		.then(response => {
			if (response.status === 200) {
				return response.json();
			}
		})
		.catch(err => console.log(err))
}

export const createIssue = (roomUid, title) => {
	return fetch(urls.createIssue.replace('roomUid', roomUid), {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Authorization": localStorage.getItem('accessToken')
		},
		body: JSON.stringify({
			title: title,
		})
	})
		.then(response => {
			if (response.status === 201) {
				return response.json();
			}
		})
		.catch(err => console.log(err))
}

export const joinRoom = (roomUid, name) => {
	return fetch(urls.joinRoom.replace('roomUid', roomUid), {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Authorization": localStorage.getItem('accessToken')
		},
		body: JSON.stringify({
			name: name,
		})
	})
		.then(response => {
			if (response.status === 201 || response.status === 200) {
				return response.json();
			}
		})
		.catch(err => console.log(err))
}