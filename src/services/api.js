import toastr from 'toastr';

const baseUrl = "http://127.0.0.1:8000"

const urls = {
	listRooms: baseUrl + "/v1/rooms/",
	createRoom: baseUrl + "/v1/rooms/",
	roomInfo: baseUrl + "/v1/rooms/roomUid/info",
	joinRoom: baseUrl + "/v1/rooms/roomUid/join",
	getRoomParticipants: baseUrl + "/v1/rooms/roomUid/participants",
	getRoomIssues: baseUrl + "/v1/rooms/roomUid/issues",
	createIssue: baseUrl + "/v1/rooms/roomUid/issues",
	getRoomCurrentIssue: baseUrl + "/v1/rooms/roomUid/current_issue",
	setRoomCurrentIssue: baseUrl + "/v1/rooms/roomUid/current_issue",
	issue: baseUrl + "/v1/rooms/roomUid/issues/issueUid",
	getRoomIssueVotes: baseUrl + "/v1/rooms/roomUid/issues/issueUid/votes",
	submitRoomIssueVote: baseUrl + "/v1/rooms/roomUid/issues/issueUid/votes",
	removeIssueVotes: baseUrl + "/v1/rooms/roomUid/issues/issueUid/votes",
	flipIssueVoteCards: baseUrl + "/v1/rooms/roomUid/issues/issueUid/votes/flip",
}

const handleAuthError = (response) => {
	if (response.status === 401 || response.status === 403) {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('userUid');
		window.location.href = '/';
		return true;
	}
	return false;
}

// No auth — public endpoint
export const getRooms = () => {
	return fetch(urls.listRooms)
		.then(response => {
			if (response.status === 200) {
				return response.json().then(data => data.results ?? data);
			}
		})
		.catch(err => console.log(err))
}

// No auth — public endpoint
export const getRoomSummary = (roomUid) => {
	return fetch(baseUrl + `/v1/rooms/${roomUid}/summary`)
		.then(response => {
			if (response.status === 200) return response.json();
		})
		.catch(err => console.log(err))
}

// No auth — public endpoint
export const getRoomInfo = (roomUid) => {
	return fetch(urls.roomInfo.replace('roomUid', roomUid))
		.then(response => {
			if (response.status === 200) return response.json();
		})
		.catch(err => console.log(err))
}

// No auth — public endpoint
export const createRoom = (title, description, creator_name, is_private = false, password = '', card_set = 'standard') => {
	return fetch(urls.createRoom, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			title: title,
			description: description,
			creator_name: creator_name,
			is_private: is_private,
			password: password,
			card_set: card_set,
		})
	})
		.then(response => {
			if (response.status === 201) {
				return response.json();
			}
		})
		.catch(err => console.log(err))
}

// No auth — public endpoint
export const joinRoom = (roomUid, name, role = 'voter', password = '') => {
	return fetch(urls.joinRoom.replace('roomUid', roomUid), {
		method: 'POST',
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ name, role, password })
	})
		.then(response => {
			if (response.status === 201 || response.status === 200) {
				return response.json();
			}
			if (response.status === 403) {
				return response.json().then(data => Promise.reject(data.detail || 'Incorrect password.'));
			}
		})
		.catch(err => { throw err; })
}

export const getRoomParticipants = (roomUid) => {
	return fetch(urls.getRoomParticipants.replace('roomUid', roomUid), {
		method: 'GET',
		headers: {
			"Authorization": localStorage.getItem('accessToken')
		}
	})
		.then(response => {
			if (handleAuthError(response)) return;
			if (response.status === 200) {
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
			if (handleAuthError(response)) return;
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
			if (handleAuthError(response)) return;
			if (response.status === 201) {
				return response.json();
			}
		})
		.catch(err => console.log(err))
}

// No auth — public endpoints
export const getRoomCurrentIssue = (roomUid) => {
	return fetch(urls.getRoomCurrentIssue.replace('roomUid', roomUid), {
		method: 'GET',
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
			"Content-Type": "application/json"
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

export const getIssue = (roomUid, issueUid) => {
	return fetch(urls.issue
		.replace('roomUid', roomUid)
		.replace('issueUid', issueUid), {
			method: 'GET',
			headers: {
				"Authorization": localStorage.getItem('accessToken')
			}
		})
		.then(response => {
			if (handleAuthError(response)) return;
			if (response.status === 200) {
				return response.json();
			}
		})
		.catch(err => console.log(err))
}

// PATCH per OpenAPI spec (was incorrectly PUT)
export const updateIssue = (roomUid, issueUid, title, estimatedPoints) => {
	return fetch(urls.issue
		.replace('roomUid', roomUid)
		.replace('issueUid', issueUid), {
			method: 'PATCH',
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
			if (handleAuthError(response)) return;
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

export const renameParticipant = (roomUid, participantUid, name) => {
	return fetch(urls.getRoomParticipants.replace('roomUid', roomUid) + '/' + participantUid, {
		method: 'PATCH',
		headers: {
			"Content-Type": "application/json",
			"Authorization": localStorage.getItem('accessToken')
		},
		body: JSON.stringify({ name })
	})
		.then(response => {
			if (handleAuthError(response)) return;
			if (response.status === 200) return response.json();
		})
		.catch(err => console.log(err))
}

export const deleteIssue = (roomUid, issueUid) => {
	return fetch(urls.issue
		.replace('roomUid', roomUid)
		.replace('issueUid', issueUid), {
			method: 'DELETE',
			headers: {
				"Authorization": localStorage.getItem('accessToken')
			}
		})
		.then(response => {
			if (handleAuthError(response)) return;
			if (response.status === 204) {
				return "OK";
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
			if (handleAuthError(response)) return;
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
			if (handleAuthError(response)) return;
			if (response.status === 201 || response.status === 200) {
				return response.json();
			} else {
				return Promise.reject();
			}
		})
		.catch(err => console.log(err))
}

export const removeIssueVotes = (roomUid, issueUid) => {
	return fetch(urls.removeIssueVotes
		.replace('roomUid', roomUid)
		.replace('issueUid', issueUid), {
			method: 'DELETE',
			headers: {
				"Authorization": localStorage.getItem('accessToken')
			}
		})
		.then(response => {
			if (handleAuthError(response)) return;
			if (response.status === 204) {
				return "OK";
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
				"Authorization": localStorage.getItem('accessToken')
			}
		})
		.then(response => {
			if (handleAuthError(response)) return;
			if (response.status === 200) {
				return response.json();
			}
		})
		.catch(err => console.log(err))
}
