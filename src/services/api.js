import toastr from 'toastr';

const baseUrl = "http://127.0.0.1:8000"

const urls = {
	getRoom: baseUrl + "/v1/rooms/",
	createRoom: baseUrl + "/v1/rooms/",
	getRoomIssues: baseUrl + "/v1/rooms/roomUid/issues",
	getRoomCurrentIssue: baseUrl + "/v1/rooms/roomUid/current_issue",
	setRoomCurrentIssue: baseUrl + "/v1/rooms/roomUid/current_issue",
	getRoomIssueVotes: baseUrl + "/v1/rooms/roomUid/issues/issueUid/votes",
	submitRoomIssueVote: baseUrl + "/v1/rooms/roomUid/issues/issueUid/votes",
	getRoomParticipants: baseUrl + "/v1/rooms/roomUid/participants",
	createIssue: baseUrl + "/v1/rooms/roomUid/issues",
	updateIssue: baseUrl + "/v1/rooms/roomUid/issues/issueUid",
	flipIssueVoteCards: baseUrl + "/v1/rooms/roomUid/issues/issueUid/votes/flip",
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

export const getRoomCurrentIssue = (roomUid) => {
	return fetch(urls.getRoomCurrentIssue.replace('roomUid', roomUid), {
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

export const setRoomCurrentIssue = (roomUid, issueUid) => {
	return fetch(urls.setRoomCurrentIssue.replace('roomUid', roomUid), {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Authorization": localStorage.getItem('accessToken')
		},
		body: JSON.stringify({
			issue_uid: issueUid,
		})
	})
		.then(response => {
			if (response.status === 200) {
				return response.json();
			}
		})
		.catch(err => console.log(err))
}

export const getRoomIssueVotes = (roomUid, issueUid) => {
	return fetch(urls.getRoomIssueVotes
		.replace('roomUid', roomUid)
		.replace('issueUid', issueUid), {
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

export const submitRoomIssueVote = (roomUid, issueUid, storyPoint) => {
	return fetch(urls.submitRoomIssueVote
		.replace('roomUid', roomUid)
		.replace('issueUid', issueUid), {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
				"Authorization": localStorage.getItem('accessToken')
			},
			body: JSON.stringify({
				estimated_points: storyPoint,
			})
		})
		.then(response => {
			if (response.status === 201 || response.status === 200) {
				return response.json();
			} else {
				return Promise.reject();
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

export const updateIssue = (roomUid, issueUid, title, estimatedPoints) => {
	return fetch(urls.updateIssue
		.replace('roomUid', roomUid)
		.replace('issueUid', issueUid), {
			method: 'PUT',
			headers: {
				"Content-Type": "application/json",
				"Authorization": localStorage.getItem('accessToken')
			},
			body: JSON.stringify({
				estimated_points: estimatedPoints,
				title: title
			})
		})
		.then(response => {
			if (response.status === 200) {
				return response.json();
			} else {
				response.json()
					.then(data => {
						for (let field in data) {
							for (let message of data[field]) {
								toastr.error(message);
							}
						}
					})
			}
		})
		.catch(err => console.log(err))
}

export const flipIssueVoteCards = (roomUid, issueUid) => {
	return fetch(urls.flipIssueVoteCards
		.replace('roomUid', roomUid)
		.replace('issueUid', issueUid), {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
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