import React from "react";
import "./App.css";



class App extends React.Component {

  constructor(props) {
    super(props);

    this.state ={
      query: '',
      result: []
    }
  }

  queryChange = (evt) => {
    this.setState({query: evt.target.value});
    this.context.router.push(`'/search/${this.state.query}/some-action'`);
  }

  search(keyword) {
    var fuzzyParam = {
      "query": {
        "bool": {
          "should": [
            {
              "multi_match": {
                "query": keyword,
                "fields": [
                  "number",
                  "name",
                  "description",
                  "same as",
                  "concurrent",
                  "prerequisite",
                  "corequisite",
                  "overlaps"
                ],
                "type": "best_fields",
                "operator": "and",
                "fuzziness": "AUTO"
              }
            },
            {
              "multi_match": {
                "query": keyword,
                "fields": [
                  "number",
                  "name",
                  "description",
                  "same as",
                  "concurrent",
                  "prerequisite",
                  "corequisite",
                  "overlaps"
                ],
                "type": "phrase_prefix",
                "operator": "and"
              }
            }
          ],
          "minimum_should_match": "1"
        }
      },
      "size": 15,
      "highlight": {
        "pre_tags": [
          "<mark>"
        ],
        "post_tags": [
          "</mark>"
        ],
        "fields": {
          "number": {},
          "name": {},
          "description": {},
          "same as": {},
          "concurrent": {},
          "prerequisite": {},
          "corequisite": {},
          "overlaps": {}
        },
        "encoder": "html"
      },
      "suggest": {
        "text": keyword,
        "suggestions": {
          "phrase": {
            "field": "name",
            "real_word_error_likelihood": 0.95,
            "max_errors": 1,
            "gram_size": 4,
            "direct_generator": [
              {
                "field": "name",
                "suggest_mode": "always",
                "min_word_length": 1
              }
            ]
          }
        }
      }
    };

    var requestHeader = {
      headers: {
        "content-type": "application/json; charset=UTF-8",
        "content-length": 140
      },
      body: JSON.stringify(fuzzyParam),
      method: "POST"
    };

    fetch("http://localhost:9200/_search", requestHeader).then(data => {return data.json()}).then(res => {console.log(res.hits)})
  }

  render() {
      return (

      <div className="App">

          <div>
            <input value={this.state.query} onChange={this.queryChange}></input>

        </div>

      </div>

     
    )
  }
};

export default App;
