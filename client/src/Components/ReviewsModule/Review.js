import React from "react";
import avatar from "../../Assets/default-avatar.png";
import "./ReviewsModule.scss";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Button, Icon, Divider } from "semantic-ui-react";
import Moment from 'react-moment';

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
      <div>
      <div className={"review_container"}>
        <div className={"avatar_container"}>
          {/* avater here! */}
          <img src={avatar}></img>
        </div>

        <div className={"content_container"}>
          {/* review context */}
          <div className={"review_header_container"}>
               {/* review info header */}
            <div className={"review_header_info_container"}>
              {/* <span><h3 id={"reviewer_name"}>{this.props.reviewData.user_id}</h3 ><Moment fromNow id={"timestamp"}>{this.props.reviewData.submitted_at}</Moment></span> */}
              <span><h3 id={"reviewer_name"}>Anonymous Petr</h3 ></span>
              <div className={"reviewer_meta_container"}>
                <div>
                  <h5>
                    <b>TAKEN WITH:</b> {this.props.reviewData.prof_id}
                  </h5>
                </div>

                <div>
                  <h5>
                    <b>Grade:</b> {this.props.reviewData.grade}
                  </h5>
                </div>
              </div>
            </div>

          </div>

          <div className={"review_body_container"}>

            <p>{this.props.reviewData.body}</p>

            <div className={"review_rating_container"}>
              <h1></h1>
            </div>

          </div>


          <div class="vote-container">
              <div class="vote-container_up" onClick={() => (this.vote('up'))}>
                <span>
                  <Icon className="vote-button upvote" name="arrow up"/>
                  <b className="vote-counter">{this.props.reviewData.up_votes}</b>
                </span>
              </div>
              <div class="vote-container_down" onClick={() => (this.vote('down'))}>
                <span>
                  <Icon className="vote-button downvote" name="arrow down"/>
                  <b className="vote-counter">{this.props.reviewData.down_votes}</b>
                </span>
              </div>
              {/* <div class="report-container">
                <span>
                  <Icon name="flag outline"/>
                  <b className="vote-counter">Report Review</b>
                </span>
                
              </div> */}
            </div>
        </div>

        <div className={"rating-container"}>
        <Moment fromNow id={"timestamp"}>{this.props.reviewData.submitted_at}</Moment>
          <div className="rating">
            <h4 className="rating-label">DIFFICULTY</h4>
            <div className={"rating-text-container"}>
              <h2 class="rating-text">{this.props.reviewData.difficulty}</h2>
            </div>
          </div>

          <div className="rating">
            <h4 className="rating-label">RATING</h4>
            <div className={"rating-text-container"}>
              <h2 class="rating-text">{this.props.reviewData.rating}</h2>
            </div>
          </div>

          </div>
          </div>
          <Divider />
        </div>
    );
  }
}

export default Review;
