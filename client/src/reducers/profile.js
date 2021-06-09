import {
    GET_PROFILE,
    PROFILE_ERROR,
    CLEAR__PROFILE,
    UPDATE_PROFILE,
    GET_PROFILES,
    GET_REPOS
} from '../actions/types';

const initialState = {
    profile: null,
    profiles: [],
    repos: [],
    loading: true,
    exist: true,
    error: {}
};

export default function(state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case GET_PROFILE:
        case UPDATE_PROFILE:
            return {
                ...state,
                profile: payload,
                loading: false,
                exist: true
            };
        case PROFILE_ERROR:
            return {
                ...state,
                error: payload,
                loading: false,
                profile: null,
                exist: false
            };
        case CLEAR__PROFILE:
            return {
                ...state,
                profile: null,
                repos: [],
                loading: false,
                exist: true
            };
        case GET_PROFILES:
            return {
                ...state,
                profiles: payload,
                loading: false
            };
        case GET_REPOS:
            return {
                ...state,
                repos: payload,
                loading: false,
                exist: true
            };
        default:
            return state;
    }
}