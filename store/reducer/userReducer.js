import { setMessageCount, setNotificationId } from '../actions';
import { SETUSER, SETREDIRECT, SETVOICESTATE, SETSOCKETINSTANCE, SETREFRESHSTATE, SETNOTIFICATIONID, SETMESSAGECOUNT, SETVISIBLEONE, SETFEEDVISIBLEONE, SETCREATEDAT, SETUSED, SETREQUESTCOUNT } from '../constants';
const initialState = {
    user: null,
    voiceState: 0,
    socketInstance: null,
    refreshState: false,
    notificationId: null,
    messageCount: 0,
    requestCount: 0,
    visibleOne: 0,
    feedVisibleOne: 0,
    createdAt: '',
    redirect: null,
    isUsed: false
};
const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case SETUSER:
            return {
                ...state,
                user: action.payload
            };
        case SETREDIRECT:
            return {
                ...state,
                redirect: action.payload
            };
        case SETFEEDVISIBLEONE:
            return {
                ...state,
                feedVisibleOne: action.payload
            }
        case SETVISIBLEONE:
            return {
                ...state,
                visibleOne: action.payload
            };
        case SETVOICESTATE:
            return {
                ...state,
                voiceState: action.payload
            };
        case SETSOCKETINSTANCE:
            return {
                ...state,
                socketInstance: action.payload
            };
        case SETREFRESHSTATE:
            return {
                ...state,
                refreshState: action.payload
            };
        case SETNOTIFICATIONID:
            return {
                ...state,
                notificationId: action.payload
            };
        case SETMESSAGECOUNT:
            return {
                ...state,
                messageCount: action.payload
            };
        case SETREQUESTCOUNT:
            return {
                ...state,
                requestCount: action.payload
            };
        case SETCREATEDAT:
            return {
                ...state,
                createdAt: action.payload,
                isUsed: false
            }
        case SETUSED:
            return {
                ...state,
                isUsed: true
            }
        default:
            return state;
    }
}
export default userReducer;