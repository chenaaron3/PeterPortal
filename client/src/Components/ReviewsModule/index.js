import React from "react";
import Review from "./Review";
import { Form, TextArea, Checkbox, Dropdown, Button } from "semantic-ui-react";

// const professorOptions = [
//   { key: "pattis", value: "pattis", text: "Richard Pattis" },
//   { key: "thornton", value: "thornton", text: "Alexander Thornton" }
// ];

const creditOptions = [
  { key: "credit", value: "True", text: "Taken for credit" },
  { key: "p/np", value: "False", text: "Taken as P/NP" }
];

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
      userID: "raman",
      // courseID: "",//this.props.courseID,
      profID: "",
      date: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      grade: "",
      forCredit: "",
      professorOptions: [],
      reviews: [],
    };
    console.log(this.state);
    this.getProfessorNames();
    this.getReviews();
    
  }

  componentWillReceiveProps(props) {
    console.log("hi")
    this.setState({courseID: this.props.courseID});
    this.getReviews();
    this.getProfessorNames();
  }

  getProfessorNames() {
    console.log("Getting the professors");
    let names = []
    for (var i = 0; i < this.props.professorHistory.length; i++) {       
      fetch(
        "https://search-icssc-om3pkghp24gnjr4ib645vct64q.us-west-2.es.amazonaws.com/professors/_doc/"+this.props.professorHistory[i],
        {method: "GET"}
      )
        .then(data => {
          return data.json();
        })
        .then(res => {
          console.log(res);
          this.setState({})
          names.push({ key: res._source.ucinetid, value: res._source.ucinetid, text: res._source.name })
          this.setState({professorOptions: names});
        })
        .catch(e => console.log(e));
    }
  }

  addReview = () => {

    var queryParams = {
      text: this.state.text,
      rating: this.state.rating,
      difficulty: this.state.difficulty,
      userID: this.state.userID,
      courseID: this.props.courseID,//this.props.courseID,
      profID: this.state.profID,
      date: this.state.date,
      grade: this.state.grade,
      forCredit: this.state.forCredit,
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
      console.log("it worked");
      this.getReviews();
    }).catch(() => {
      console.log("No Course Found")
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
      <div style={{ marginTop: "26px", marginBottom: "200px" }}>
        <h1>Review and Discussion</h1>
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
                placeholder="Grade Option"
                fluid
                selection
                options={creditOptions}
                onChange={(event, data) => {this.setState({forCredit: data.value})}}
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

              <Button onClick={this.addReview}>Submit</Button>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

export default ReviewsModule;
