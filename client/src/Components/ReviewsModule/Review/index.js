import React from "react";
import avatar from "../../../assets/default_avatar.png";
import "./review.scss";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Button } from "semantic-ui-react";

class Review extends React.Component {
  constructor(props) {
    super(props);
  }


  flagReview = () => {

    var queryParams = {
      reviewID: this.props.reviewData.reviewID,
    }
    fetch("/reviews/flagReview", {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryParams),
    }).then(data => {return data.json()})
    .then(res => {
      console.log("it worked");
      console.log(this.props.reviewData.flagged);
      
      this.forceUpdate();
    }).catch(() => {
      console.log("no course found")
    });
  }

  render() {
    return (
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
              <h2 id={"reviewer_name"}>{this.props.reviewData.userID}</h2>
              <h4 id={"timestamp"}>{this.props.reviewData.dateSubmitted.slice(0, 10)}</h4>

              <div className={"reviewer_meta_container"}>
                <div>
                  <h5>
                    <b>Taken with:</b> {this.props.reviewData.profID}
                  </h5>
                </div>

                <div>
                  <h5>
                    <b>For Credit:</b> {this.props.reviewData.forCredit ? "Yes" : "No"}
                  </h5>
                </div>

                <div>
                  <h5>
                    <b>Grade:</b> {this.props.reviewData.grade}
                  </h5>
                </div>
              </div>
            </div>

           
            <div className={"review_rating_container"}>
              <CircularProgressbar value={this.props.reviewData.rating} maxValue={5} text={this.props.reviewData.rating} />
            </div>
          </div>

          <div className={"review_body_container"}><p>{this.props.reviewData.reviewText}</p></div>
          
        </div>
      </div>
    );
  }
}

export default Review;
