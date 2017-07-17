import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from "jquery";

class Input extends React.Component {
    
    state = {
        value : ''
    }

    handleInput = this.handleInput.bind(this);

    handleInput(event) {
        this.props.getData(event.target.value);
    }

    render() {
        return(
            <input type='text' onInput={this.handleInput} placeholder="Search"></input>
        )
    }
    
}

const Suggestions = (props) => {
    return(
        <div>
            <ul>
                {props.searchResults.map((result) => <li>{result.title}</li>)}
            </ul>
        </div>
    )
};

const Button = (props) => {
    return(
        <button>Search</button>
    )
}

const Results = (props) => {
    return(
        <div>
        </div>
    )
}


class Wiki extends React.Component {

    state = {
        searchResults : []
    }

    getData = (input) => {
        if (input) {
            $.ajax({

                'url': 'https://en.wikipedia.org/w/api.php',
                'data': {
                    'action' : 'query',
                    'format' : 'json',
                    'origin' : '*',
                    'list' : 'search',
                    'srsearch' : input,
                    'limit' : 20
                },
                'success' : (data) => {
                    this.setState(prevState => ({
                        searchResults : data.query.search
                    }))
                }
            });
        }
        else {
            this.setState(prevState => ({
                searchResults : []
            }))
        }
    }

    render() {
        return(
            <div>
                <Input getData={this.getData} />
                <Button />
                <Suggestions searchResults={this.state.searchResults} />
            </div>
        )
    }
}

class App extends React.Component {

  render() {
    return(
        <Wiki />
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));