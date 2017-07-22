import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from "jquery";

class Input extends React.Component {
    
    state = {
        value : ''
    }

    handleInput = this.handleInput.bind(this);
    handleSubmit = this.handleSubmit.bind(this);

    handleInput(event) {
        this.props.getTitles(event.target.value);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.submitSearch(this.input.value);
    }

    render() {
        return(
            <form onSubmit={this.handleSubmit}>
                <input type='text' ref={(input) => this.input = input} onInput={this.handleInput} placeholder="Search"></input>
                <input type='submit' value='Submit'></input>
            </form>
        );
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

const Results = (props) => {

    if (props.submit && props.searchResults) {
        return(
            <div>
                {props.searchResults.map((result) => {
                        const url = "http://www.wikipedia.org/wiki/" + result.title;
                        return <a href={url} target='_blank'>
                            <div>
                                <h1>{result.title}</h1>
                                <p dangerouslySetInnerHTML={{__html: result.snippet}}></p>
                            </div>
                        </a>
                })}
            </div>
        )
    }
    else {
        return null;
    }

}

const Article = (props) => {

    return(
        <div dangerouslySetInnerHTML={{__html : props.article}} />
    )

}


class Wiki extends React.Component {

    state = {
        searchResults : [],
        requestTime : 0,
        submit : false,
        submitResults : [],
        article : ''
    }

    // Gets list of articles for search suggestions
    getTitles = (input) => {
        let time = Date.now();
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
                    if (time > this.state.requestTime) {
                        this.setState(prevState => ({
                        searchResults : data.query.search,
                        requestTime : time
                    }))
                    }
                }
            });
        }
        else {
            if (time > this.state.requestTime) {
                this.state = {
                    searchResults : [],
                    requestTime : 0
                }
            }
        }
    }

    submitSearch = (input) => {
        this.setState(prevState => ({
            submit : true
        }), () => {
            $.when(this.getTitles(input)).then(() => {
                if (this.state.searchResults.length > 0) {
                    this.setState(prevState => ({
                        submitResults : this.state.searchResults
                    }))
                }
            })
        })
    }

    // getArticle = (input) => {
    //     if (input) {
    //         $.ajax({
    //             'url' : 'https://en.wikipedia.org/w/api.php',
    //             'data' : {
    //                 'action' : 'query',
    //                 'format' : 'json',
    //                 'origin' : '*',
    //                 'titles' : input,
    //                 'prop' : 'revisions',
    //                 'rvprop' : 'content'
    //             },
    //             'success' : (data) => {
    //                 this.setState(prevState => ({
    //                     article : data.query.pages[Object.keys(data.query.pages)[0]].revisions[0]['*']
    //                 }))
    //             }
    //         })
    //     }
    // }

    removeCharacters = (string) => {
        const characters = {
            " " : '%20',
            '"' : '%22',
            '-' : '%2D',
            '.' : '%2E',
        };
        let newString = string;
        Object.keys(characters).forEach((character) => {
            let regEx;
            if (character === '.') {
                regEx = new RegExp(/\./, 'g');
            }
            else {
                regEx = new RegExp(character, 'g');
            }
            newString = newString.replace(regEx, characters[character]);
        })
        return newString;
    }

    render() {
        return(
            <div>
                <Input getTitles={this.getTitles} submitSearch={this.submitSearch} />
                <Suggestions searchResults={this.state.searchResults} submitSearch={this.submitSearch} />
                <Results submit={this.state.submit} searchResults={this.state.submitResults} removeCharacters={this.removeCharacters} />
                <Article article={this.state.article} />
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