import React from "react";
// import avatar from "../../../Assets/default-avatar.png";
import "./review.scss";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {Button } from "semantic-ui-react";

class Review extends React.Component {
  constructor(props) {
    super(props);
  }

  vote = (direction) => {
    fetch("/users/loggedIn", {method: "GET"}).then((res)=> {
      return res.json();
    }).then((data) => {
      if (data.status) {
        var body = {
          reviewID: this.props.reviewData.id,
        }
        var requestHeader= {
          'Content-Type': 'application/json',
        };
        console.log(body);
        fetch(`/reviews/${direction}VoteReview`, {
          method: "PUT",
          headers: requestHeader,
          body: JSON.stringify(body),
        }).then(data => {return data.json()})
        .then(res => {
          console.log("it worked");
          this.props.getReviews()
        }).catch(() => {
          console.log("No Course Found")
        });
      } else {
        alert("Login to vote!")
      }
    });
  }

  render() {
    return (
      <div className={"review_container"}>
        <div className={"avatar_container"}>
          {/* avater here! */}
          {/* <img src={avatar}></img> */}
        </div>

        <div className={"content_container"}>
          {/* review context */}
          <div className={"review_header_container"}>
               {/* review info header */}
            <div className={"review_header_info_container"}>
              <h2 id={"reviewer_name"}>{this.props.reviewData.user_id}</h2>
              <h4 id={"timestamp"}>{this.props.reviewData.submitted_at.slice(0, 10)}</h4>

              <div className={"reviewer_meta_container"}>
                <div>
                  <h5>
                    <b>Taken with:</b> {this.props.reviewData.prof_id}
                  </h5>
                </div>

                {/* <div>
                  <h5>
                    <b>For Credit:</b> {this.props.reviewData.for_credit ? "Yes" : "No"}
                  </h5>
                </div> */}

                <div>
                  <h5>
                    <b>Grade:</b> {this.props.reviewData.grade}
                  </h5>
                </div>
              </div>
            </div>

           
            <div className={"review_rating_container"}>
              <CircularProgressbar value={this.props.reviewData.rating} maxValue={5} text={this.props.reviewData.rating} />
              <CircularProgressbar value={this.props.reviewData.difficulty} maxValue={5} text={this.props.reviewData.difficulty} />
            </div>
          </div>

          <div className={"review_body_container"}>
            <p>{this.props.reviewData.body}</p>
            <div>
              <h5>
                <b>Up:</b> {this.props.reviewData.up_votes}
              </h5>
              <h5>
                <b>Down:</b> {this.props.reviewData.down_votes}
              </h5>
            </div>
            <Button onClick={() => (this.vote('up'))}>Up</Button>
            
            <Button onClick={() => (this.vote('down'))}>Down</Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Review;
