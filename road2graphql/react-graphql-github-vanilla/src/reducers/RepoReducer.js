import React from 'react'

const RepoReducer = (state, action) => {
  switch (action.type) {
    case "REPO_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "REPO_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        organization: action.payload.data.organization,
      };
    case "REPO_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
}

export default RepoReducer
