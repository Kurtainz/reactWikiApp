import React from 'react';
import ReactDOM from 'react-dom';
import $ from "jquery";
import './styles.css';

// Main header. Hides when search has been made
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

// Main input component. Contains input box, search type and random button
class Input extends React.Component {

    state = {
        random : ''
    }

    // Gets random article for random button
    componentWillMount() {
        this.props.getRandomArticle.then((answer) => {
            this.setState(prevState => ({
                random : answer.query.random['0'].title
            }), console.log(this.state))
        })
    }

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
        // Makes search suggestions appear if text in box
        let suggestions = null;
        if (this.props.suggest) {
            suggestions = <Suggestions searchResults={this.props.searchResults} handleClick={this.handleClick} />;
        }
        // Moves search bar to top of screen if search has been made
        let submitStyle = null;
        if (this.props.hide) {
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
                <div>
                    <RandomButton random={this.state.random} />
                </div>
                {suggestions}
            </div>
        );
    }
    
}

// Select box for images or articles
const Options = () => {

    return(
        <select className='button'>
            <option value='articles'>Articles</option>
            <option value='images'>Images</option>
        </select>
    )

}

const RandomButton = (props) => {

    if (props.random) {
        return(
            <div className='randomButton'>
                <p className='randomText'>Feeling lucky? Try a random article</p>
                <a href={'http://en.wikipedia.org/wiki/' + props.random}>
                    <button className='button'>Random</button>
                </a>
            </div>
        )
    }
    else {
        return null;
    }

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
            <div className='picResults'>
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

class Wiki extends React.Component {

    state = {
        searchResults : [],
        submitResults : [],
        picResults : [],
        requestTime : 0,
        suggest : false,
        submit : false,
        hide : false
    }

    getRandomArticle = new Promise(
        (resolve, reject) => {
            $.ajax({
                'url': 'https://en.wikipedia.org/w/api.php',
                'data': {
                    'action' : 'query',
                    'format' : 'json',
                    'origin' : '*',
                    'list' : 'random',
                    'rnnamespace' : 0
                },
            }).done((data) => {
                resolve(data);
            })
        }
    )

    submitSearch = (input, option) => {
        this.setState(prevState => ({
            suggest : false,
            submit : true,
            hide : true
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
                <Header hide={this.state.hide} />
                <Input 
                getRandomArticle={this.getRandomArticle}
                handleData={this.handleData} 
                submitSearch={this.submitSearch} 
                searchResults={this.state.searchResults} 
                suggest={this.state.suggest}
                submitResults={this.state.submitResults}
                hide={this.state.hide} />
                 <Results 
                 submit={this.state.submit} 
                 submitResults={this.state.submitResults} 
                 removeCharacters={this.removeCharacters}
                 picResults={this.state.picResults} /> 
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