import React, { Component, useEffect, useCallback, useState } from "react";
import axios from "axios";

const TITLE = "React GraphQL GitHub Client";
const axiosGitHubGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`,
  },
});

const GET_ORGANIZATION = `
  {
    organization(login: "the-road-to-learn-react") {
      name
      url
    }
  }
`;

const App = () => {
  const [path, setPath] = useState(
    "the-road-to-learn-react/the-road-to-learn-react"
  );
  const [organization, setOrganization] = useState({ url: "", name: "" });

  const repoReducer = (state, action) => {
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
  };

  /***  Initializing Reducer ***/
  const [repo, dispatchRepo] = React.useReducer(repoReducer, {
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

      console.log(repo.organization);
    } catch {
      dispatchRepo({ type: "REPO_FETCH_FAILURE" });
    }
  });

  useEffect(() => {
    onFetchFromGitHub();
  }, [path, organization]);

  const onSubmit = (event) => {
    event.preventDefault();
  };

  const onChange = (event) => {
    setPath({ path: event.target.value });
  };

  const Organization = ({ organization }) => (
    <div>
      <p>
        <strong>Issues from Organization:</strong>
        <a href={organization.url}>{organization.name}</a>
      </p>
    </div>
  );

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
      {organization ? (
        <Organization organization={repo.organization} />
      ) : (
        <p>No information yet ...</p>
      )}
    </div>
  );
};

export default App;
