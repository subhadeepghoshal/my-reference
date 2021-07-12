import React from "react";
const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {

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
    if (!searchTerm) return;

    dispatchStories({ type: "STORIES_FETCH_INIT" });

    fetch(`${API_ENDPOINT}${searchTerm}`) // B
      .then((response) => response.json()) // C
      .then((result) => {
        dispatchStories({
          type: "STORIES_FETCH_SUCCESS",
          payload: result.hits,
        });
      })
      .catch(() => dispatchStories({ type: "STORIES_FETCH_INIT" }));
  }, [searchTerm]);

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
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
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
    <span> {author} </span>
    <span>{num_comments}  </span>
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
