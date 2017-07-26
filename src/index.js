import React from 'react';
import ReactDOM from 'react-dom';
import $ from "jquery";
import './styles.css';

const Header = (props) => {

    if (!props.hide) {
        return(
            <h1>Wikipedia Search</h1>
        )
    }
    else {
        return null;
    }

}

class Input extends React.Component {

    handleInput = this.handleInput.bind(this);
    handleClick = this.handleClick.bind(this);
    handleSubmit = this.handleSubmit.bind(this);

    handleInput(event) {
        this.props.getTitles(event.target.value);
    }

    handleClick(event) {
        this.input.value = event;
        this.props.submitSearch(this.input.value);
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.input.value) {
            this.props.submitSearch(this.input.value);
        }
    }

    render() {
        let suggestions = null;
        if (this.props.suggest) {
            suggestions = <Suggestions searchResults={this.props.searchResults} handleClick={this.handleClick} />;
        }
        let submitStyle = null;
        if (this.props.submitResults.length > 0) {
            submitStyle = {
                'top' : '5%'
            }
        }
        return(
            <div className='search' style={submitStyle}>
                <form onSubmit={this.handleSubmit}>
                    <input type='text' ref={(input) => this.input = input} onInput={this.handleInput} placeholder="Search"></input>
                </form>
                {suggestions}
            </div>
        );
    }
    
}

const Suggestions = (props) => {

    return(
        <div className='suggestionsDiv'>
            <ul className='suggestions'>
                {props.searchResults.map((result, index) => <li 
                key={index}
                className='suggestion' 
                onClick={() => props.handleClick(result.title)}>
                {result.title}</li>)}
            </ul>
        </div>
    )
};

const Results = (props) => {

    if (props.submitResults) {
        return(
            <div className='results'>
                {props.submitResults.map((result) => {
                        const url = "http://en.wikipedia.org/wiki/" + result.title;
                        return <a href={url} target='_blank' className='result'>
                            <div className='resultBlock'>
                                <h2>{result.title}</h2>
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
        submitResults : [],
        requestTime : 0,
        suggest : false,
        submit : false,
    }

    // Gets list of articles for search suggestions or results
    getTitles = (input) => {
        let time = Date.now();
        if (input) {
            if (!this.state.suggest) {
                this.setState(prevState => ({
                    suggest : true
                }))
            }
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
                    if (this.state.submit === true) {
                        this.setState(prevState => ({
                            submitResults : data.query.search,
                            submit : false
                        }))
                    }
                },
                'error' : (xhr) => console.log('Error occured' + xhr)
            });
        }
        else {
            if (time > this.state.requestTime) {
                this.setState(prevState => ({
                    searchResults : [],
                    suggest : false
                }))
            }
        }
    }

    submitSearch = (input) => {
        this.setState(prevState => ({
            suggest : false,
            submit : true
        }), this.getTitles(input))
    }

    render() {
        return(
            <div>
                <Header hide={this.state.submitResults.length} />
                <Input 
                getTitles={this.getTitles} 
                submitSearch={this.submitSearch} 
                searchResults={this.state.searchResults} 
                suggest={this.state.suggest}
                submitResults={this.state.submitResults} />
                 <Results submit={this.state.submit} submitResults={this.state.submitResults} removeCharacters={this.removeCharacters} /> 
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