import React from "react";
import Review from "./Review.js";
import { Form, TextArea, Checkbox, Dropdown, Button, Grid, Divider } from "semantic-ui-react";
import "./ReviewsModule.scss";
import ReCAPTCHA from "react-google-recaptcha";

// reference to the captcha element
const recaptchaRef = React.createRef();

const ratingOptions = [
  { key: "1", value: "1", text: "1" },
  { key: "2", value: "2", text: "2" },
  { key: "3", value: "3", text: "3" },
  { key: "4", value: "4", text: "4" },
  { key: "5", value: "5", text: "5" }
];

const gradeReceived = [
  { key: "A", value: "A", text: "A" },
  { key: "B", value: "B", text: "B" },
  { key: "C", value: "C", text: "C" },
  { key: "D", value: "D", text: "D" },
  { key: "F", value: "F", text: "F" },
  { key: "P", value: "P", text: "P" },
  { key: "NP", value: "NP", text: "NP" },
  { key: "W", value: "W", text: "W" },
  { key: "I", value: "I", text: "I" },
  { key: "S", value: "S", text: "S" },
  { key: "U", value: "U", text: "U" },
  { key: "IP", value: "IP", text: "IP" },
];

class ReviewsModule extends React.Component {


  constructor(props) {
    super(props);
    let date = new Date();
    this.state = {
      text: "",
      rating: 0,
      difficulty: 0,
      // courseID: "",//this.props.courseID,
      profID: "",
      date: date,
      grade: "",
      takenIn: "",
      professorOptions: [],
      reviews: [],
      verified: false,
      termOptions: []
    };
    console.log(this.state);
    this.getTerms();
    this.getProfessorNames();
    this.getReviews();
  }

  getTerms() {
    let termOptions = [];
    const range = 5;
    fetch(`/api/v1/schedule/getTerms?pastYears=${range}`)
    .then(res => res.json())
    .then(terms => {
      terms.forEach(term => {
        termOptions.unshift({ key: term, value: term, text: term })
      })
      this.setState({termOptions: termOptions})
    });
  }

  getProfessorNames() {
    console.log("Getting the professors");
    let names = []
    // go through each professor ucinetid
    for (var i = 0; i < this.props.professorHistory.length; i++) {    
      var searchParams = {
        query: {
          terms: {
            _id: [this.props.professorHistory[i]]
          }
        }
      };
      var requestHeader = {
        headers: new Headers({
          "content-type": "application/json; charset=UTF-8",
          "content-length": 140
        }),
        body: JSON.stringify(searchParams),
        method: "POST"
      };   
      fetch(
        "/professors/_search",
        requestHeader
      )
      .then(data => {
        return data.json();
      })
      .then(res => {
        this.setState({})
        let prof_data = res.hits.hits[0]._source;
        names.push({ "key": prof_data.ucinetid, "value": prof_data.ucinetid, "text": prof_data.name });
        this.setState({professorOptions: names});
      })
      .catch(e => console.log(e));
    }
  }

  addReview = () => {
    if(!this.state.verified){
      alert("Please Complete the reCAPTCHA!");
      return;
    }
    this.setState({verified:false})
    var queryParams = {
      text: this.state.text,
      rating: this.state.rating,
      difficulty: this.state.difficulty,
      courseID: this.props.courseID,//this.props.courseID,
      profID: this.state.profID,
      date: this.state.date.getFullYear() + "-" + (this.state.date.getMonth() + 1) + "-" + this.state.date.getDate(),
      grade: this.state.grade,
      takenIn: this.state.takenIn
    }
    var requestHeader= {
      'Content-Type': 'application/json',
    };
    console.log(queryParams);
    fetch("/reviews/addReview", {
      method: "POST",
      headers: requestHeader,
      body: JSON.stringify(queryParams),
    }).then(data => {return data.json()})
    .then(res => {
      console.log("Review Posted!");
      recaptchaRef.current.reset();
      this.getReviews();
    }).catch((err) => {
      console.log(err);
      console.log("No Course Found!")
    });
  }
  
  getReviews = () => {
    console.log(this.props.courseID)
    fetch("/reviews/course?courseID="+ encodeURIComponent(this.props.courseID), {
      method: "GET"
    }).then(data => {return data.json()})
    .then(res => {
      this.setState({reviews: res});
      console.log(res);
    }).catch(() => {
      console.log("No Course Found")
    });
  }

  render() {
    return (
      <div className="review-module-container" style={{ marginTop: "36px", marginBottom: "200px" }}>
        <Grid.Row className="feature-label">
          <h2>💬 Review & Discussion</h2>
          <Divider />
        </Grid.Row>

        
        <div>
          {this.state.reviews && this.state.reviews.map(item => (
            <>
              <Review reviewData={item} getReviews={this.getReviews}/>
            </>
          ))}
           
          <div style={{ marginTop: "100px" }}>
            {/* <div className={"avatar_container"}>
                    <img src={avatar}></img>
                  </div> */}

            <Form>
              <h1 id={"reviewer_name"}>
                Peter Anteater
                <Checkbox
                  style={{ marginLeft: "18px" }}
                  label="Post review as Anonymous"
                />
              </h1>

              <div style={{ display: "flex", marginBottom: "16px"}}>
              <Dropdown
                clearable
                fluid
                search
                selection
                options={this.state.professorOptions}
                placeholder="Select Professor"
                onChange={(event,  data) => {this.setState({profID: data.value})}}                
              />

              <Dropdown
                placeholder="Taken In"
                fluid
                selection
                options={this.state.termOptions}
                onChange={(event, data) => {this.setState({takenIn: data.value})}}
              />

              <Dropdown
                placeholder="Grade Received"
                fluid
                selection
                options={gradeReceived}
                onChange={(event, data) => {this.setState({grade: data.value})}}
              />
              <Dropdown
                placeholder="Rating"
                fluid
                selection
                options={ratingOptions}
                onChange={(event, data)=> {this.setState({rating: data.value})}}
              />
              <Dropdown
                placeholder="Difficulty"
                fluid
                selection
                options={ratingOptions}
                onChange={(event, data)=> {this.setState({difficulty: data.value})}}
              />
              </div>
              
              <TextArea 
              placeholder="Write your review here"
              
              onChange={(event, data) => {this.setState({text: data.value})}}
               />

              <ReCAPTCHA ref={recaptchaRef} sitekey="6Le6rfIUAAAAAOdqD2N-QUEW9nEtfeNyzkXucLm4" onChange={(value)=>{this.setState({verified:value})}}/>
              <Button onClick={this.addReview}>Submit</Button>              
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

export default ReviewsModule;
