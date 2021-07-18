import React, { Component, useEffect, useCallback, useState } from "react";
import axios from "axios";
import RepoReducer from "./reducers/RepoReducer"
import {GET_ORGANIZATION} from "./gql/Query"
import Organization from "./components/Organization";

const TITLE = "React GraphQL GitHub Client";
const axiosGitHubGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`,
  },
});

const App = () => {
  const [path, setPath] = useState(
    "the-road-to-learn-react/the-road-to-learn-react"
  );
  
  /***  Initializing Reducer ***/
  const [repo, dispatchRepo] = React.useReducer(RepoReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  const onFetchFromGitHub = useCallback(async () => {
    dispatchRepo({ type: "REPO_FETCH_INIT" });

    try {
      const result = await axiosGitHubGraphQL.post("", {
        query: GET_ORGANIZATION,
      });

      dispatchRepo({
        type: "REPO_FETCH_SUCCESS",
        payload: result.data,
      });
     
     } catch {
      dispatchRepo({ type: "REPO_FETCH_FAILURE" });
    }
  });

  useEffect(() => {
    onFetchFromGitHub();
  }, [path]);

  const onSubmit = (event) => {
    event.preventDefault();
  };

  const onChange = (event) => {
    setPath({ path: event.target.value });
  };

  return (
    <div>
      <h1>{TITLE}</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="url">Show open issues for https://github.com/</label>
        <input
          id="url"
          type="text"
          value={path}
          onChange={onChange}
          style={{ width: "300px" }}
        />
        <button type="submit">Search</button>
      </form>
      <hr />
      {repo.organization ? (
        <Organization organization={repo.organization} />
      ) : (
        <p>No information yet ...</p>
      )}
    </div>
  );
};

export default App;
