import React from "react";

const App = () => {
  /***  Stories Data ***/
  const initialStories = [
    {
      title: "React ",
      url: "https://reactjs.org/",
      author: " Jordan Walke",
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: "Redux ",
      url: "https://redux.js.org/",
      author: "Dan Abramov, Andrew Clark",
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  /***  Simulator function for fetching stories from a remote store ***/
  const getAsyncStories = () =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ data: { stories: initialStories } }), 2000)
    );

  /***  Custom Hook extending useState, manages state syncronyzed with local storage, used for SerachTerm ***/
  const useSemiPersistentState = (key, initialState) => {
    const [value, setValue] = React.useState(
      localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
      localStorage.setItem(key, value);
    }, [value, key]);

    return [value, setValue];
  };

  /***  Reducer function for handling events - used in usedReducer  hook for managing state for stories ***/

  const storiesReducer = (state, action) => {
    switch (action.type) {
      case "STORIES_FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case "STORIES_FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case "STORIES_FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      case "REMOVE_STORY":
        return {
          ...state,
          data: state.data.filter(
            (story) => action.payload.id !== story.objectID
          ),
        };

      default:
        throw new Error();
    }
  };

  /***  Initializing Reducer ***/
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  /***  Initializing States ***/
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "");

  /*** Side effect - Loading stories asyncronously with loading and error flag handling ***/
  React.useEffect(() => {
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    getAsyncStories()
      .then((result) => {
        dispatchStories({
          type: "STORIES_FETCH_SUCCESS",
          payload: result.data.stories,
        });
      })
      .catch(() => dispatchStories({ type: "STORIES_FETCH_INIT" }));
  }, []);

  /***  Event Handlers - Search and Remove ***/

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRemoveStory = (id) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: {id},
    });
  };

  /***  Helper function - Filtering Stories simulating search ***/
  const searchedStories = stories.data.filter(function (story) {
    return story.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  /***  RENDERER MAIN ***/
  return (
    <div>
      <h1>My Hacker Stories</h1>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        Search
      </InputWithLabel>
      <hr />
      {stories.isError && <p>Something went wrong ...</p>}
      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

/*** RENDERER LIST (Parent - Main ) ***/

const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item key={item.objectID} onRemoveItem={onRemoveItem} {...item} />
    ))}
  </ul>
);

/*** RENDERER - ITEM (Parent - LIST) ***/
const Item = ({
  onRemoveItem,
  url,
  title,
  author,
  num_comments,
  points,
  objectID,
}) => (
  <li>
    <span>
      <a href={url}>{title}</a>
    </span>
    <span>{author}</span>
    <span>{num_comments}</span>
    <span>{points} </span>
    <span>
      <button type="button" onClick={() => onRemoveItem(objectID)}>
        Dismiss
      </button>
    </span>
  </li>
);

/*** RENDERER - InputWithLabel (Parent - Main) ***/

const InputWithLabel = ({
  id,
  value,
  type = "text",
  onInputChange,
  isFocused,
  children,
}) => (
  <>
    <label htmlFor={id}>{children}</label>
    &nbsp;
    <input
      id={id}
      type={type}
      value={value}
      autoFocus={isFocused}
      onChange={onInputChange}
    />
  </>
);

export default App;
