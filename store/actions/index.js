import { SETUSER, SETVOICESTATE, SETSOCKETINSTANCE , SETREFRESHSTATE, SETNOTIFICATIONID, SETMESSAGECOUNT, SETVISIBLEONE, SETFEEDVISIBLEONE, SETCREATEDAT, SETUSED, SETREQUESTCOUNT, SETREDIRECT } from '../constants';
export function setUser(user) {
    return {
        type: SETUSER,
        payload: user
    }
}

export function setRedirect(redirect) {
    return {
        type: SETREDIRECT,
        payload: redirect
    }
}

export function setVoiceState(voiceState) {
    return {
        type: SETVOICESTATE,
        payload: voiceState
    }
}

export function setSocketInstance(socketIns) {
    return {
        type: SETSOCKETINSTANCE,
        payload: socketIns
    }
}

export function setRefreshState(refreshState) {
    return {
        type: SETREFRESHSTATE,
        payload: refreshState
    }
}

export function setNotificationId(notificationId) {
    return {
        type: SETNOTIFICATIONID,
        payload: notificationId
    }
}

export function setMessageCount(messageCount) {
    return {
        type: SETMESSAGECOUNT,
        payload: messageCount
    }
}

export function setRequestCount(requestCount) {
    return {
        type: SETREQUESTCOUNT,
        payload: requestCount
    }
}

export function setVisibleOne(visibleOne) {
    return {
        type: SETVISIBLEONE,
        payload: visibleOne
    }
}

export function setFeedVisibleOne(visibleOne) {
    return {
        type: SETFEEDVISIBLEONE,
        payload: visibleOne
    }
}

export function setCreatedAt(createdAt) {
    return {
        type: SETCREATEDAT,
        payload: createdAt
    }
}

export function setUsed() {
    return {
        type: SETUSED
    }
}