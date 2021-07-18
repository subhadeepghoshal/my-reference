import React, { Component, useEffect, useCallback, useState } from "react";
import axios from "axios";
import RepoReducer from "./reducers/RepoReducer"
import {GET_ORGANIZATION, GET_REPOSITORY_OF_ORGANIZATION,GET_ISSUES_OF_REPOSITORY} from "./gql/Query"
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

  const onFetchFromGitHub = useCallback(async (path) => {
    const [organization, repository] = path.split('/');

    dispatchRepo({ type: "REPO_FETCH_INIT" });

    try {
      const result = await axiosGitHubGraphQL.post("", {
        query: GET_ISSUES_OF_REPOSITORY(organization, repository)
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
    onFetchFromGitHub(path);
  }, [path]);

  const onSubmit = (event) => {
    onFetchFromGitHub(path);
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
