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
        this.props.handleData(event.target.value);
    }

    handleClick(event) {
        this.input.value = event;
        const option = this.input.form.children[1].value;
        this.props.submitSearch(this.input.value, option);
    }

    handleSubmit(event) {
        event.preventDefault();
        const option = this.input.form.children[1].value;
        if (this.input.value) {
            this.props.submitSearch(this.input.value, option);
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
                    <Options />
                </form>
                {suggestions}
            </div>
        );
    }
    
}

// Select box for images or articles
const Options = () => {

    return(
        <select>
            <option value='articles'>Articles</option>
            <option value='images'>Images</option>
        </select>
    )

}

// Displays search suggestions underneath box
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

// Displays results of search, either images or articles
const Results = (props) => {

    // Displays article results
    if (props.submitResults.length > 0) {
        return(
            <div className='results'>
                {props.submitResults.map((result, index) => {
                        const url = "http://en.wikipedia.org/wiki/" + result.title;
                        return <a href={url} target='_blank' className='result' key={index}>
                            <div className='resultBlock'>
                                <h2>{result.title}</h2>
                                <p dangerouslySetInnerHTML={{__html: result.snippet}}></p>
                            </div>
                        </a>
                })}
            </div>
        )
    }
    // Displays picture results
    else if (props.picResults.length > 0) {
        return(
            <div>
                {props.picResults.map((pic, index) => {
                        return <div key={index}>
                            <img src={pic} />
                        </div>
                })}
            </div>
        )
    }
    else {
        return null;
    }

}

// Not yet implemented. May use to display more information on a particular search result
const Article = (props) => {

    return(
        <div dangerouslySetInnerHTML={{__html : props.article}} />
    )

}


class Wiki extends React.Component {

    state = {
        searchResults : [],
        submitResults : [],
        picResults : [],
        requestTime : 0,
        suggest : false,
        submit : false,
    }

    submitSearch = (input, option) => {
        this.setState(prevState => ({
            suggest : false,
            submit : true
        }), this.handleData(input, option))
    }

    // Gets list of articles for search suggestions or results
    handleData = (input, option) => {
        // Each call has a time variable which is compared with state variable to ensure that only the most 
        // recent API call will change state
        let time = Date.now();
        if (input) {
            // If suggest variable is not true, enable it to show search suggestions
            if (!this.state.suggest) {
                this.setState(prevState => ({
                    suggest : true
                }))
            }
            if (option === 'articles') {
                this.getTitles(input, time);
            }
            else if (option === 'images') {
                this.getImages(input);
            }
            else {
                this.getTitles(input, time);
            }
        }
        else {
            // Hide suggestions and empty results if no input
            if (time > this.state.requestTime) {
                this.setState(prevState => ({
                    searchResults : [],
                    suggest : false
                }))
            }
        }
    }

    getTitles = (input, time) => {
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
        });
    }

    getImages = (input) => {
        $.ajax({
            'url' : 'https://en.wikipedia.org/w/api.php',
            'data' : {
                'action' : 'query',
                'format' : 'json',
                'origin' : '*',
                'list' : 'allimages',
                'ailimit' : 20,
                'aifrom' : input
            },
            'success' : (data) => {
                const imageArray = data.query.allimages.map((obj) => obj.url);
                this.setState(prevState => ({
                    submitResults : [],
                    picResults : imageArray,
                    submit : false
                }))
            }
        })
    }

    render() {
        return(
            <div>
                <Header hide={this.state.submitResults.length} />
                <Input 
                handleData={this.handleData} 
                submitSearch={this.submitSearch} 
                searchResults={this.state.searchResults} 
                suggest={this.state.suggest}
                submitResults={this.state.submitResults} />
                 <Results 
                 submit={this.state.submit} 
                 submitResults={this.state.submitResults} 
                 removeCharacters={this.removeCharacters}
                 picResults={this.state.picResults} /> 
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